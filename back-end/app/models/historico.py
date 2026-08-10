from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime, timezone

class HistoricoStatus(Base):
    __tablename__ = "historico_status"
    
    id = Column(Integer, primary_key=True, index=True)
    produto_id = Column(Integer, ForeignKey("produtos.id"), nullable=False)
    status = Column(String, nullable=False)
    alterado_por = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    alterado_em = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    
    produto = relationship("ProdutoLogistica", back_populates="historico")
    usuario = relationship("Usuario", back_populates="historico")