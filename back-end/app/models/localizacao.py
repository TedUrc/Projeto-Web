from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime, timezone

class Localizacao(Base):
    __tablename__ = "localizacoes"
    
    id = Column(Integer, primary_key=True, index=True)
    produto_id = Column(Integer, ForeignKey("produtos.id"), nullable=False)
    enviado_por = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    registrado_em = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    produto = relationship("ProdutoLogistica", back_populates="localizacoes")
    usuario = relationship("Usuario", back_populates="localizacoes")