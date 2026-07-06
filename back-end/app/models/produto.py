from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.sql import func
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
    data_criacao = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    data_atualizacao = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))