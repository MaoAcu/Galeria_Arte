from flask import Blueprint, render_template, request, redirect, url_for, session, flash
from app.extensions import db, limiter
from app.Models.login import Login
from datetime import datetime, timedelta
import secrets
import logging

logger = logging.getLogger(__name__)

auth_bp = Blueprint("auth", __name__)


def GenerarCodigo():
    return secrets.randbelow(900000) + 100000


@auth_bp.route("/login", methods=["GET", "POST"])
@limiter.limit("5 per minute")
def login():
    if request.method == "POST":
        try:
            correo = request.form.get("correo")
            password = request.form.get("password")

            # Validación básica
            if not correo or not password:
                flash("Correo y contraseña son requeridos", "error")
                return redirect(url_for("auth.login"))

            # Usar una consulta más segura
            login = Login.query.filter(Login.correo == correo).first()

            if not login:
                flash("Usuario o contraseña incorrectos", "error")
                return redirect(url_for("auth.login"))

            if not login.esta_activo():
                flash("Usuario bloqueado. Restablezca la contraseña.", "error")
                return redirect(url_for("auth.login"))

            if not login.verificar_password(password):
                login.registrar_fallo()
                db.session.commit()

                if login.estado == 0:
                    flash(
                        "Usuario bloqueado por demasiados intentos fallidos. Restablezca la contraseña",
                        "error"
                    )
                else:
                    flash("Usuario o contraseña incorrectos", "error")

                return redirect(url_for("auth.login"))

            # Login exitoso
            login.registrar_login_exitoso()
            db.session.commit()

            session.clear()
            session["idusuario"] = login.idusuario
            session["correo"] = login.correo

            code = GenerarCodigo()
            login.codigo = code
            login.codigo_expiracion = datetime.utcnow() + timedelta(minutes=10)
            db.session.commit()

            # Enviar código de verificación
            try:
                from app.Services import email_service
                email_service.SendVerificationCode(email=login.correo, code=code)
            except Exception as e:
                logger.error(f"Error enviando código de verificación: {e}")
                flash("Error al enviar el código de verificación. Intente nuevamente.", "error")
                return redirect(url_for("auth.login"))

            return redirect(url_for("auth.VerificarCodigo"))  # Corregido: usar el nombre correcto del endpoint

        except Exception as e:
            logger.error(f"Error en login: {e}")
            db.session.rollback()
            flash("Error interno del servidor. Intente nuevamente.", "error")
            return redirect(url_for("auth.login"))

    return render_template("login.html")


@auth_bp.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("auth.login"))


@auth_bp.route("/verificar_codigo", methods=["GET", "POST"])
@limiter.limit("5 per minute")
def VerificarCodigo():
    idusuario = session.get("idusuario")

    if not idusuario:
        flash("Sesión expirada. Inicie sesión nuevamente.", "warning")
        return redirect(url_for("auth.login"))

    if request.method == "POST":
        try:
            codigo_ingresado = request.form.get("codigo")

            if not codigo_ingresado:
                flash("Ingrese el código de verificación", "error")
                return redirect(url_for("auth.VerificarCodigo"))

            login = Login.query.filter(Login.idusuario == idusuario).first()

            if not login:
                flash("Error interno: usuario no encontrado", "error")
                return redirect(url_for("auth.VerificarCodigo"))

            if login.codigo is None:
                flash("No hay un código pendiente. Inicie sesión nuevamente.", "warning")
                return redirect(url_for("auth.login"))

            # Verificar expiración
            if login.codigo_expiracion and datetime.utcnow() > login.codigo_expiracion:
                login.codigo = None
                login.codigo_expiracion = None
                db.session.commit()
                flash("El código ha expirado (validez: 10 minutos). Inicie sesión nuevamente.", "error")
                return redirect(url_for("auth.login"))

            # Convertir y validar código
            try:
                codigo_int = int(codigo_ingresado.strip())
            except ValueError:
                flash("Código inválido. Debe ser un número de 6 dígitos.", "error")
                return redirect(url_for("auth.VerificarCodigo"))

            # Verificar el código
            if codigo_int != login.codigo:
                flash("Código incorrecto", "error")
                return redirect(url_for("auth.VerificarCodigo"))

            # Código correcto
            login.codigo = None
            login.codigo_expiracion = None
            db.session.commit()

            session["Access"] = 1
            return redirect(url_for("routes.dashboard"))

        except Exception as e:
            logger.error(f"Error en verificación de código: {e}")
            db.session.rollback()
            flash("Error interno del servidor. Intente nuevamente.", "error")
            return redirect(url_for("auth.VerificarCodigo"))

    return render_template("verificar_codigo.html")