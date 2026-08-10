from sqlalchemy.orm import Session
from app.models.historico import HistoricoStatus
from app.schemas.historico import HistoricoCreate

def create_historico(db: Session, historico: HistoricoCreate):
    db_historico = HistoricoStatus(
        produto_id=historico.produto_id,
        status=historico.status,
        alterado_por=historico.alterado_por
    )
    db.add(db_historico)
    db.commit()
    db.refresh(db_historico)
    return db_historico

def get_historico_por_produto(db: Session, produto_id: int):
    return db.query(HistoricoStatus)\
        .filter(HistoricoStatus.produto_id == produto_id)\
        .order_by(HistoricoStatus.alterado_em.desc())\
        .all()