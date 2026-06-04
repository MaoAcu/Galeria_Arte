from flask import Blueprint, request, jsonify, session, url_for
from app.extensions import db, limiter
from app.Services import email_service
from app.Models.login import Login
from app.Models.user import Usuario
from datetime import datetime, timedelta
import bcrypt
import secrets
import logging

logger = logging.getLogger(__name__)

credential_bp = Blueprint("crede", __name__, url_prefix='/crede')


def GenerarCodigoRecovery():
    return secrets.randbelow(900000) + 100000


@credential_bp.route('/validar_usuario', methods=['POST'])
@limiter.limit("5 per minute")
def ValidarUsuarioRecovery():
    try:
        data = request.get_json()
        correo = data.get('usuario')

        if not correo:
            return jsonify({'success': False, 'message': 'Correo requerido'})

        login = Login.query.filter_by(correo=correo).first()
        if not login:
            return jsonify({
                'success': False,
                'message': 'El correo no esta asociado a ninguna cuenta.'
            })

        code = GenerarCodigoRecovery()
        login.codigo = code
        login.codigo_expiracion = datetime.utcnow() + timedelta(minutes=10)
        db.session.commit()

        session['recovery_idusuario'] = login.idusuario
        session['recovery_correo'] = login.correo

        email_service.SendVerificationCode(email=correo, code=code)

        return jsonify({
            'success': True,
            'message': 'Codigo de verificacion enviado al correo.'
        })

    except Exception as e:
        logger.error("ERROR validar_usuario: %s", e)
        return jsonify({'success': False, 'message': 'Error interno del servidor'}), 500


@credential_bp.route('/validate_code', methods=['POST'])
@limiter.limit("5 per minute")
def ValidateCode():
    try:
        data = request.get_json()
        code_entered = data.get('codigo')

        idusuario = session.get('recovery_idusuario')

        if not idusuario:
            return jsonify({'success': False, 'message': 'Sesion expirada.'})

        login = Login.query.filter_by(idusuario=idusuario).first()
        if not login:
            return jsonify({'success': False, 'message': 'Cuenta no encontrada.'})

        if login.codigo is None:
            return jsonify({'success': False, 'message': 'No hay un codigo pendiente.'})

        if login.codigo_expiracion and datetime.utcnow() > login.codigo_expiracion:
            login.codigo = None
            login.codigo_expiracion = None
            db.session.commit()
            return jsonify({'success': False, 'message': 'El codigo ha expirado. Solicite uno nuevo.'})

        try:
            codigo_int = int(str(code_entered).strip())
        except ValueError:
            return jsonify({'success': False, 'message': 'Codigo invalido.'})

        if codigo_int != login.codigo:
            return jsonify({'success': False, 'message': 'Codigo incorrecto.'})

        login.codigo = None
        login.codigo_expiracion = None
        db.session.commit()

        session['code_verified'] = True
        return jsonify({
            'success': True,
            'redirect_url': url_for('routes.restablecer_contra')
        })

    except Exception as e:
        logger.error("ERROR validate_code: %s", e)
        return jsonify({'success': False, 'message': 'Error interno'}), 500


@credential_bp.route('/update_password', methods=['POST'])
@limiter.limit("5 per minute")
def UpdatePassword():
    try:

        if not session.get('code_verified'):
            return jsonify({'success': False, 'message': 'No autorizado'}), 403

        data = request.get_json()
        new_password = data.get('new_password')

        if not new_password or len(new_password) < 6:
            return jsonify({'success': False, 'message': 'Minimo 6 caracteres'})

        idusuario = session.get('recovery_idusuario')

        usuario = Usuario.query.filter_by(idusuario=idusuario).first()
        if not usuario:
            return jsonify({'success': False, 'message': 'Usuario no encontrado'})

        usuario.contrasena_hash = bcrypt.hashpw(
            new_password.encode(),
            bcrypt.gensalt()
        ).decode()

        usuario.estado = 1
        usuario.intentos = 0

        db.session.commit()
        session.clear()

        return jsonify({'success': True, 'message': 'Contrasena actualizada'})

    except Exception as e:
        logger.error("ERROR update_password: %s", e)
        return jsonify({'success': False, 'message': 'Error interno'}), 500
