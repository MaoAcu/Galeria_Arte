# app/routes/escultura.py
from flask import Blueprint, jsonify, request, current_app
from app.extensions import db, limiter
from app.Models.escultura import Escultura
from app.Models.artistaInvitado import ArtistaInvitado
from .decorators import loginRequired, codigoRequired
import uuid
import os
from PIL import Image

# Configuración de upload
UPLOAD_FOLDER = os.path.join('app', 'static', 'gallery')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

escultura_bp = Blueprint("escultura", __name__, url_prefix='/escultura')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def optimizar_imagen(input_path, output_filename):
    """Optimizar imagen manteniendo calidad original"""
    try:
        img = Image.open(input_path)
        
        # Convertir a RGB si es necesario
        if img.mode in ('RGBA', 'LA', 'P'):
            rgb_img = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'RGBA':
                rgb_img.paste(img, mask=img.split()[3] if len(img.split()) > 3 else None)
            else:
                rgb_img.paste(img)
            img = rgb_img
        
        # Mantener extensión original
        ext = output_filename.rsplit('.', 1)[1].lower()
        
        upload_path = os.path.join(current_app.root_path, "static", "gallery")
        os.makedirs(upload_path, exist_ok=True)
        output_path = os.path.join(upload_path, output_filename)
        
        # Guardar con buena calidad
        if ext in ['jpg', 'jpeg']:
            img.save(output_path, 'JPEG', quality=90, optimize=True)
        elif ext == 'png':
            img.save(output_path, 'PNG', optimize=True)
        else:
            img.save(output_path, quality=90, optimize=True)
        
        # Eliminar archivo temporal
        if os.path.exists(input_path) and input_path != output_path:
            os.remove(input_path)
        
        return output_filename
        
    except Exception as e:
        print(f"[ERROR] optimizar_imagen: {e}")
        return os.path.basename(input_path)

def SerializeEscultura(e):
    return {
        "id": e.id,
        "title": e.title,
        "artist": e.artist,
        "year": e.year,
        "material": e.material,
        "description": e.description,
        "image": e.image,
        "alt": e.alt,
        "width": e.width,
        "height": e.height,
        "audio": e.audio,
        "orden": e.orden,
        "estado": e.estado
    }
def SerializeArtistaInvitado(a):
    return {
        "id": a.id,
        "title": a.title,
        "artist": a.artist,
        "artist_description": a.artist_description,
        "artist_image": a.artist_image,
        "year": a.year,
        "material": a.material,
        "description": a.description,
        "image": a.image,
        "alt": a.alt,
        "width": a.width,
        "height": a.height,
        "audio": a.audio,
        "orden": a.orden,
        "estado": a.estado
    }
@escultura_bp.route("/GetEsculturas", methods=["GET"])
@limiter.limit("120 per minute")
def GetEsculturas():
    try:
        esculturas = Escultura.query.filter_by(estado=1).order_by(Escultura.orden).all()
        data = [SerializeEscultura(e) for e in esculturas]
         
        return jsonify(data), 200
    except Exception as e:
        print(f"[ERROR GetEsculturas]: {e}")
        return jsonify({"error": "No se pudo obtener las esculturas"}), 500
    
@escultura_bp.route("/GetInvitados", methods=["GET"])
@limiter.limit("120 per minute")
def GetInvitados():
    try:
        invitados = ArtistaInvitado.query.filter_by(estado=1).order_by(ArtistaInvitado.orden).all()
        data = [SerializeArtistaInvitado(a) for a in invitados]
         
        return jsonify(data), 200
    except Exception as e:
        print(f"[ERROR GetEsculturas]: {e}")
        return jsonify({"error": "No se pudo obtener las esculturas"}), 500

@escultura_bp.route("/GetAllEsculturas", methods=["GET"])
@limiter.limit("30 per minute")
def GetAllEsculturas():
    try:
        esculturas = Escultura.query.order_by(Escultura.orden).all()
        data = [SerializeEscultura(e) for e in esculturas]
       
        return jsonify(data), 200
    except Exception as e:
        print(f"[ERROR GetAllEsculturas]: {e}")
        return jsonify({"error": "No se pudo obtener las esculturas"}), 500

@escultura_bp.route("/CreateEscultura", methods=["POST"])
@limiter.limit("30 per minute")
@loginRequired
@codigoRequired
def CreateEscultura():
    try:
        data = request.form
        file = request.files.get('image')
        
        if not data.get("title") or not data.get("artist") or not data.get("year") or not data.get("material") or not data.get("description"):
            return jsonify({"error": "title, artist, year, material y description son obligatorios"}), 400

        filename = None

        if file and allowed_file(file.filename):
            # Generar nombre único manteniendo extensión
            ext = file.filename.rsplit('.', 1)[1].lower()
            filename = f"{uuid.uuid4().hex}.{ext}"
            
            upload_path = os.path.join(current_app.root_path, "static", "gallery")
            os.makedirs(upload_path, exist_ok=True)
            temp_path = os.path.join(upload_path, f"temp_{filename}")
            file.save(temp_path)

            filename = optimizar_imagen(temp_path, filename)

        escultura = Escultura(
            title=data.get('title'),
            artist=data.get('artist'),
            year=data.get('year'),
            material=data.get('material'),
            description=data.get('description'),
            image=filename,
            alt=data.get('alt', data.get('title')),
            width=int(data.get('width', 800)),
            height=int(data.get('height', 600)),
            audio=data.get('audio'),
            orden=int(data.get('orden', 0)),
            estado=int(data.get('estado', 1))
        )

        db.session.add(escultura)
        db.session.commit()
        return jsonify({"message": "Escultura creada correctamente", "image": filename}), 201

    except Exception as e:
        db.session.rollback()
        print(f"[ERROR CreateEscultura]: {e}")
        return jsonify({"error": "Error al crear escultura"}), 500

@escultura_bp.route("/UpdateEscultura/<int:id>", methods=["PATCH"])
@limiter.limit("30 per minute")
@loginRequired
@codigoRequired
def UpdateEscultura(id):
    try:
        escultura = Escultura.query.get(id)
        if not escultura:
            return jsonify({"error": "Escultura no encontrada"}), 404

        data = request.form
        file = request.files.get("image")
        
        # Procesar nueva imagen si se subió
        if file and allowed_file(file.filename):
            ext = file.filename.rsplit('.', 1)[1].lower()
            filename = f"{uuid.uuid4().hex}.{ext}"
            
            upload_path = os.path.join(current_app.root_path, "static", "gallery")
            os.makedirs(upload_path, exist_ok=True)
            temp_path = os.path.join(upload_path, f"temp_{filename}")
            file.save(temp_path)

            filename = optimizar_imagen(temp_path, filename)

            if escultura.image:
                old_path = os.path.join(upload_path, escultura.image)
                if os.path.exists(old_path):
                    try:
                        os.remove(old_path)
                    except Exception as e:
                        print(f"⚠️ Error eliminando imagen anterior: {e}")
            
            escultura.image = filename

        # Campos editables
        campos = {
            "title": data.get("title"),
            "artist": data.get("artist"),
            "year": data.get("year"),
            "material": data.get("material"),
            "description": data.get("description"),
            "alt": data.get("alt"),
            "width": data.get("width"),
            "height": data.get("height"),
            "audio": data.get("audio"),
            "orden": data.get("orden"),
            "estado": data.get("estado")
        }

        for campo, valor in campos.items():
            if valor is not None:
                if campo in ["width", "height", "orden", "estado"]:
                    setattr(escultura, campo, int(valor))
                else:
                    setattr(escultura, campo, valor)

        db.session.commit()
        return jsonify({"message": "Escultura actualizada correctamente"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"[ERROR UpdateEscultura]: {e}")
        return jsonify({"error": "No se pudo actualizar la escultura"}), 500

@escultura_bp.route("/DeleteEscultura/<int:id>", methods=["DELETE"])
@limiter.limit("30 per minute")
@loginRequired
@codigoRequired
def DeleteEscultura(id):
    try:
        escultura = Escultura.query.get(id)
        
        if not escultura:
            return jsonify({"error": "Escultura no encontrada"}), 404

        # Eliminar la imagen física
        if escultura.image:
            image_path = os.path.join(current_app.root_path, "static", "gallery", escultura.image)
            if os.path.exists(image_path):
                try:
                    os.remove(image_path)
                    print(f"Imagen eliminada: {escultura.image}")
                except Exception as e:
                    print(f"Error eliminando imagen: {e}")

        db.session.delete(escultura)
        db.session.commit()

        return jsonify({"message": "Escultura eliminada correctamente"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"[ERROR DeleteEscultura]: {e}")
        return jsonify({"error": "No se pudo eliminar la escultura"}), 500

@escultura_bp.route("/ToggleEstado/<int:id>", methods=["PATCH"])
@limiter.limit("30 per minute")
@loginRequired
@codigoRequired
def ToggleEstado(id):
    try:
        escultura = Escultura.query.get(id)
        
        if not escultura:
            return jsonify({"error": "Escultura no encontrada"}), 404
        
        escultura.estado = 0 if escultura.estado == 1 else 1
        db.session.commit()
        
        return jsonify({
            "message": "Estado actualizado correctamente",
            "estado": escultura.estado
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"[ERROR ToggleEstado]: {e}")
        return jsonify({"error": "No se pudo cambiar el estado"}), 500

@escultura_bp.route("/ReordenarEsculturas", methods=["POST"])
@limiter.limit("30 per minute")
@loginRequired
@codigoRequired
def ReordenarEsculturas():
    try:
        data = request.get_json()
        ordenes = data.get('ordenes', [])
        
        for item in ordenes:
            escultura = Escultura.query.get(item.get('id'))
            if escultura:
                escultura.orden = item.get('orden')
        
        db.session.commit()
        
        return jsonify({"message": "Orden actualizado correctamente"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"[ERROR ReordenarEsculturas]: {e}")
        return jsonify({"error": "No se pudo actualizar el orden"}), 500

@escultura_bp.route("/CreateInvitado", methods=["POST"])
@limiter.limit("30 per minute")
@loginRequired
@codigoRequired
def CreateInvitado():
    try:
        data = request.form
        file = request.files.get('image')
        artistFile = request.files.get('artist_image')

        if not data.get("title") or not data.get("artist") or not data.get("year") or not data.get("material") or not data.get("description"):
            return jsonify({"error": "title, artist, year, material y description son obligatorios"}), 400

        filename = None
        if file and allowed_file(file.filename):
            ext = file.filename.rsplit('.', 1)[1].lower()
            filename = f"{uuid.uuid4().hex}.{ext}"
            upload_path = os.path.join(current_app.root_path, "static", "gallery")
            os.makedirs(upload_path, exist_ok=True)
            temp_path = os.path.join(upload_path, f"temp_{filename}")
            file.save(temp_path)
            filename = optimizar_imagen(temp_path, filename)

        artistFilename = None
        if artistFile and allowed_file(artistFile.filename):
            ext = artistFile.filename.rsplit('.', 1)[1].lower()
            artistFilename = f"{uuid.uuid4().hex}.{ext}"
            upload_path = os.path.join(current_app.root_path, "static", "gallery")
            os.makedirs(upload_path, exist_ok=True)
            temp_path = os.path.join(upload_path, f"temp_{artistFilename}")
            artistFile.save(temp_path)
            artistFilename = optimizar_imagen(temp_path, artistFilename)

        invitado = ArtistaInvitado(
            title=data.get('title'),
            artist=data.get('artist'),
            artist_description=data.get('artist_description', ''),
            artist_image=artistFilename,
            year=data.get('year'),
            material=data.get('material'),
            description=data.get('description'),
            image=filename,
            alt=data.get('alt', data.get('title')),
            width=int(data.get('width', 800)),
            height=int(data.get('height', 600)),
            audio=data.get('audio'),
            orden=int(data.get('orden', 0)),
            estado=int(data.get('estado', 1))
        )

        db.session.add(invitado)
        db.session.commit()
        return jsonify({"message": "Artista invitado creado correctamente", "image": filename}), 201

    except Exception as e:
        db.session.rollback()
        print(f"[ERROR CreateInvitado]: {e}")
        return jsonify({"error": "Error al crear artista invitado"}), 500


@escultura_bp.route("/UpdateInvitado/<int:id>", methods=["PATCH"])
@limiter.limit("30 per minute")
@loginRequired
@codigoRequired
def UpdateInvitado(id):
    try:
        invitado = ArtistaInvitado.query.get(id)
        if not invitado:
            return jsonify({"error": "Artista invitado no encontrado"}), 404

        data = request.form
        file = request.files.get("image")
        artistFile = request.files.get("artist_image")

        if file and allowed_file(file.filename):
            ext = file.filename.rsplit('.', 1)[1].lower()
            filename = f"{uuid.uuid4().hex}.{ext}"
            upload_path = os.path.join(current_app.root_path, "static", "gallery")
            os.makedirs(upload_path, exist_ok=True)
            temp_path = os.path.join(upload_path, f"temp_{filename}")
            file.save(temp_path)
            filename = optimizar_imagen(temp_path, filename)

            if invitado.image:
                old_path = os.path.join(upload_path, invitado.image)
                if os.path.exists(old_path):
                    try: os.remove(old_path)
                    except Exception as e: print(f"Error eliminando imagen anterior: {e}")

            invitado.image = filename

        if artistFile and allowed_file(artistFile.filename):
            ext = artistFile.filename.rsplit('.', 1)[1].lower()
            artistFilename = f"{uuid.uuid4().hex}.{ext}"
            upload_path = os.path.join(current_app.root_path, "static", "gallery")
            os.makedirs(upload_path, exist_ok=True)
            temp_path = os.path.join(upload_path, f"temp_{artistFilename}")
            artistFile.save(temp_path)
            artistFilename = optimizar_imagen(temp_path, artistFilename)

            if invitado.artist_image:
                old_path = os.path.join(upload_path, invitado.artist_image)
                if os.path.exists(old_path):
                    try: os.remove(old_path)
                    except Exception as e: print(f"Error eliminando artista imagen: {e}")

            invitado.artist_image = artistFilename

        campos = {
            "title": data.get("title"),
            "artist": data.get("artist"),
            "artist_description": data.get("artist_description"),
            "artist_image": data.get("artist_image"),
            "year": data.get("year"),
            "material": data.get("material"),
            "description": data.get("description"),
            "alt": data.get("alt"),
            "width": data.get("width"),
            "height": data.get("height"),
            "audio": data.get("audio"),
            "orden": data.get("orden"),
            "estado": data.get("estado")
        }

        for campo, valor in campos.items():
            if valor is not None:
                if campo in ["width", "height", "orden", "estado"]:
                    setattr(invitado, campo, int(valor))
                else:
                    setattr(invitado, campo, valor)

        db.session.commit()
        return jsonify({"message": "Artista invitado actualizado correctamente"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"[ERROR UpdateInvitado]: {e}")
        return jsonify({"error": "No se pudo actualizar el artista invitado"}), 500


@escultura_bp.route("/DeleteInvitado/<int:id>", methods=["DELETE"])
@limiter.limit("30 per minute")
@loginRequired
@codigoRequired
def DeleteInvitado(id):
    try:
        invitado = ArtistaInvitado.query.get(id)
        if not invitado:
            return jsonify({"error": "Artista invitado no encontrado"}), 404

        if invitado.image:
            image_path = os.path.join(current_app.root_path, "static", "gallery", invitado.image)
            if os.path.exists(image_path):
                try:
                    os.remove(image_path)
                except Exception as e:
                    print(f"Error eliminando imagen: {e}")

        db.session.delete(invitado)
        db.session.commit()
        return jsonify({"message": "Artista invitado eliminado correctamente"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"[ERROR DeleteInvitado]: {e}")
        return jsonify({"error": "No se pudo eliminar el artista invitado"}), 500


@escultura_bp.route("/ToggleInvitado/<int:id>", methods=["PATCH"])
@limiter.limit("30 per minute")
@loginRequired
@codigoRequired
def ToggleInvitado(id):
    try:
        invitado = ArtistaInvitado.query.get(id)
        if not invitado:
            return jsonify({"error": "Artista invitado no encontrado"}), 404

        invitado.estado = 0 if invitado.estado == 1 else 1
        db.session.commit()
        return jsonify({"message": "Estado actualizado correctamente", "estado": invitado.estado}), 200

    except Exception as e:
        db.session.rollback()
        print(f"[ERROR ToggleInvitado]: {e}")
        return jsonify({"error": "No se pudo cambiar el estado"}), 500


@escultura_bp.route("/ReordenarInvitados", methods=["POST"])
@limiter.limit("30 per minute")
@loginRequired
@codigoRequired
def ReordenarInvitados():
    try:
        data = request.get_json()
        ordenes = data.get('ordenes', [])

        for item in ordenes:
            invitado = ArtistaInvitado.query.get(item.get('id'))
            if invitado:
                invitado.orden = item.get('orden')

        db.session.commit()
        return jsonify({"message": "Orden actualizado correctamente"}), 200

    except Exception as e:
        db.session.rollback()
        print(f"[ERROR ReordenarInvitados]: {e}")
        return jsonify({"error": "No se pudo actualizar el orden"}), 500