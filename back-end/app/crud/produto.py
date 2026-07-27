from sqlalchemy.orm import Session
from app.models.produto import ProdutoLogistica, StatusProduto
from app.schemas import produto as schemas

def get_produto(db: Session, produto_id: int):
    return db.query(ProdutoLogistica).filter(ProdutoLogistica.id == produto_id).first()

def get_produto_por_rastreio(db: Session, codigo_rastreio: str):
    return db.query(ProdutoLogistica).filter(ProdutoLogistica.codigo_rastreio == codigo_rastreio).first()

def get_produtos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(ProdutoLogistica).offset(skip).limit(limit).all()

def get_produtos_por_motorista(db: Session, motorista_id: int, skip: int = 0, limit: int = 100):
    return db.query(ProdutoLogistica)\
        .filter(ProdutoLogistica.motorista_id == motorista_id)\
        .offset(skip)\
        .limit(limit)\
        .all()

def create_produto(db: Session, produto: schemas.ProdutoCreate):
    db_produto = ProdutoLogistica(
        codigo_rastreio=produto.codigo_rastreio,
        destinatario=produto.destinatario,
        endereco=produto.endereco,
        status=StatusProduto.PENDENCIA,
        motorista_id=produto.motorista_id
    )
    db.add(db_produto)
    db.commit()
    db.refresh(db_produto)
    return db_produto

def update_produto(db: Session, produto_id: int, produto: schemas.ProdutoUpdate):
    db_produto = get_produto(db, produto_id)
    if db_produto:
        update_data = produto.model_dump(exclude_unset=True)
        if 'status' in update_data:
            update_data['status'] = StatusProduto(update_data['status'])
        for key, value in update_data.items():
            setattr(db_produto, key, value)
        db.commit()
        db.refresh(db_produto)
    return db_produto

def delete_produto(db: Session, produto_id: int):
    db_produto = get_produto(db, produto_id)
    if db_produto:
        db.delete(db_produto)
        db.commit()
        return True
    return False