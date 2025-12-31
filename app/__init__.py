from flask import Flask

from .controllers.routes import routes_bp

def create_app():
    app = Flask(__name__)

    #  Registra los blueprints
    app.register_blueprint(routes_bp)
    return app
