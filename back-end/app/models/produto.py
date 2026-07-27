from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum
from datetime import datetime, timezone

class StatusProduto(enum.Enum):
    SAIDA = "saída"
    PENDENCIA = "pendência"
    ENTREGA = "entrega"
    CANCELAMENTO = "cancelamento"

class ProdutoLogistica(Base):
    __tablename__ = "produtos"
    
    id = Column(Integer, primary_key=True, index=True)
    codigo_rastreio = Column(String, unique=True, index=True)
    destinatario = Column(String)
    endereco = Column(String)
    status = Column(Enum(StatusProduto))
    motorista_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)
    data_criacao = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    data_atualizacao = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    historico = relationship("HistoricoStatus", back_populates="produto")
    localizacoes = relationship("Localizacao", back_populates="produto")
    motorista = relationship("Usuario", back_populates="produtos", foreign_keys=[motorista_id])