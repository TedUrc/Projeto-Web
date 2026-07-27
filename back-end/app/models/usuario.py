from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    nome = Column(String, nullable=False)
    senha_hash = Column(String, nullable=False)
    ativo = Column(Boolean, default=True)
    role = Column(String, default="motorista", nullable=False)
    
    historico = relationship("HistoricoStatus", back_populates="usuario")
    localizacoes = relationship("Localizacao", back_populates="usuario")
    produtos = relationship("ProdutoLogistica", back_populates="motorista", foreign_keys="ProdutoLogistica.motorista_id")