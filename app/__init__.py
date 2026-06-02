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

load_dotenv() 

def create_app():
    app = Flask(__name__)
    
    flask_env = os.getenv("FLASK_ENV", "production")
    
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.secret_key = os.getenv("SECRET_KEY_CACHE")
    
    db.init_app(app)
    limiter.init_app(app)
    email_service.init_app(app) 
    
    is_production = flask_env == "production"
    
    app.config.update(
        SESSION_COOKIE_SECURE=is_production,
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_HTTPONLY=True
    )
    
    init_cors(app)
    init_security_headers(app)
    
    app.register_blueprint(routes_bp)
    app.register_blueprint(auth_bp) 
    app.register_blueprint(credential_bp)
    app.register_blueprint(escultura_bp)
    
    return app