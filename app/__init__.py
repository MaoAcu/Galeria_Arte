import pymysql
pymysql.install_as_MySQLdb()   

from flask import Flask
from app.extensions import db
import os
from app.Services import email_service 
from dotenv import load_dotenv   
from .Controllers.routes import routes_bp
from .Controllers.AunthController import auth_bp
from .Controllers.credentialController import credential_bp
from .Controllers.EsculturasController import escultura_bp
from app.Models import Usuario, Login,Escultura
 
load_dotenv() 

def create_app():
    app = Flask(__name__)
    
    
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.secret_key = os.getenv("SECRET_KEY_CACHE")
    
    # Inicializa la base de datos
    db.init_app(app)
    email_service.init_app(app) 
    
    # Seguridad de cookies
    app.config.update(
        SESSION_COOKIE_SECURE=True,
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_HTTPONLY=True
    )
    
    # Registra los blueprints
    app.register_blueprint(routes_bp)
    app.register_blueprint(auth_bp) 
    app.register_blueprint(credential_bp)
    app.register_blueprint(escultura_bp)
    
    return app