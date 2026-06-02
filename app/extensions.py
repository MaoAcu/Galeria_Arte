#crea una instancia global de SQLAlchemy y despues se llama en el init
from flask_sqlalchemy import SQLAlchemy
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

db = SQLAlchemy()
limiter = Limiter(key_func=get_remote_address, storage_uri="memory://")
