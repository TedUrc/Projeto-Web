from sqlalchemy.orm import Session
from app.models.localizacao import Localizacao
from app.schemas.localizacao import LocalizacaoCreate

def create_localizacao(db: Session, produto_id: int, enviado_por: int, localizacao: LocalizacaoCreate):
    db_loc = Localizacao(
        produto_id=produto_id,
        enviado_por=enviado_por,
        latitude=localizacao.latitude,
        longitude=localizacao.longitude
    )
    db.add(db_loc)
    db.commit()
    db.refresh(db_loc)
    return db_loc

def get_ultima_localizacao(db: Session, produto_id: int):
    return db.query(Localizacao)\
        .filter(Localizacao.produto_id == produto_id)\
        .order_by(Localizacao.registrado_em.desc())\
        .first()

def get_historico_localizacao(db: Session, produto_id: int, limit: int = 50):
    return db.query(Localizacao)\
        .filter(Localizacao.produto_id == produto_id)\
        .order_by(Localizacao.registrado_em.desc())\
        .limit(limit)\
        .all()