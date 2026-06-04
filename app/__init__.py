import pymysql
pymysql.install_as_MySQLdb()   

from flask import Flask
from app.extensions import db, limiter
import os
from app.Services import email_service 
from dotenv import load_dotenv   
from .Controllers.routes import routes_bp
from .Controllers.AunthController import auth_bp
from .Controllers.credentialController import credential_bp
from .Controllers.EsculturasController import escultura_bp
from app.Models import Usuario, Login, Escultura
from app.middleware import init_cors, init_security_headers
from sqlalchemy.exc import OperationalError, DisconnectionError
import logging

load_dotenv() 

logger = logging.getLogger(__name__)

def create_app():
    app = Flask(__name__)
    
    flask_env = os.getenv("FLASK_ENV", "production")
    
    # Configuración de la base de datos
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.secret_key = os.getenv("SECRET_KEY_CACHE")
    
    # Configuración CRÍTICA para evitar "MySQL server has gone away"
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        'pool_size': 10,              
        'pool_recycle': 28000,        
        'pool_pre_ping': True,         
        'pool_timeout': 30,          
        'max_overflow': 20,       
        'connect_args': {
            'connect_timeout': 60,     
            'read_timeout': 60,         
            'write_timeout': 60,    
            'charset': 'utf8mb4',
            'autocommit': False,
        }
    }
    
    db.init_app(app)
    limiter.init_app(app)
    email_service.init_app(app) 
    
    is_production = flask_env == "production"
    
    app.config.update(
        SESSION_COOKIE_SECURE=is_production,
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_HTTPONLY=True
    )
    
    # Agregar teardown para limpiar sesiones de DB
    @app.teardown_appcontext
    def shutdown_session(exception=None):
        """Cierra la sesión de BD al finalizar el request"""
        if exception:
            db.session.rollback()
        db.session.remove()
    
    # Manejador de errores global para problemas de conexión
    @app.errorhandler(OperationalError)
    def handle_db_connection_error(error):
        """Maneja errores de conexión a la base de datos"""
        logger.error(f"Error de conexión a la base de datos: {error}")
        db.session.rollback()
        db.session.remove()
        return {"error": "Error de conexión con la base de datos. Intente nuevamente."}, 503
    
    # Manejador para errores de desconexión
    @app.errorhandler(DisconnectionError)
    def handle_db_disconnect_error(error):
        """Maneja errores de desconexión de la base de datos"""
        logger.error(f"Error de desconexión de la base de datos: {error}")
        db.session.rollback()
        db.session.remove()
        return {"error": "Conexión perdida con la base de datos. Intente nuevamente."}, 503
    
    init_cors(app)
    init_security_headers(app)
    
    app.register_blueprint(routes_bp)
    app.register_blueprint(auth_bp) 
    app.register_blueprint(credential_bp)
    app.register_blueprint(escultura_bp)
    
    return app