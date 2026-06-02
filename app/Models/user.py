from app.extensions import db
from sqlalchemy import Column, Integer, String


class Usuario(db.Model):
    __tablename__ = "usuario"

    idusuario = Column(Integer, primary_key=True)
    usuario = db.Column(db.String)
    password_hash = Column(String, nullable=False)
    estado = Column(Integer, default=1)
    intentos = Column(Integer, default=0)
    codigo_recuperacion = Column(String(10))
