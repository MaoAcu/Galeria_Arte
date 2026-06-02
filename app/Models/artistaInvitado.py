from app.extensions import db
from sqlalchemy import Column, Integer, String, Text
from datetime import datetime

class ArtistaInvitado(db.Model):
    __tablename__ = "artistas_invitados"

    id = Column(Integer, primary_key=True)
    title = Column(String(200), nullable=False)
    artist = Column(String(100), nullable=False, default="Daniel Guido")
    artist_description = Column(Text)
    artist_image = Column(String(500)) 
    year = Column(String(10), nullable=False)
    material = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    image = Column(String(500), nullable=False)
    alt = Column(String(200))
    width = Column(Integer, default=800)
    height = Column(Integer, default=600)
    audio = Column(String(500)) 
    orden = Column(Integer, default=0)
    estado = Column(Integer, default=1)   
    created_at = Column(db.DateTime, default=datetime.utcnow)
    updated_at = Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)