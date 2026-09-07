import secrets
import string
from sqlalchemy.orm import Session
from app.models.produto import ProdutoLogistica
from app.schemas import produto as schemas

def gerar_codigo_rastreio(db: Session) -> str:
    while True:
        letras = ''.join(secrets.choice(string.ascii_uppercase) for _ in range(2))
        numeros = ''.join(secrets.choice(string.digits) for _ in range(9))
        sufixo = 'BR'
        codigo = f"{letras}{numeros}{sufixo}"
        existe = db.query(ProdutoLogistica).filter(
            ProdutoLogistica.codigo_rastreio == codigo
        ).first()
        if not existe:
            return codigo

def get_produto(db: Session, produto_id: int):
    return db.query(ProdutoLogistica).filter(ProdutoLogistica.id == produto_id).first()

def get_produto_por_rastreio(db: Session, codigo_rastreio: str):
    return db.query(ProdutoLogistica).filter(ProdutoLogistica.codigo_rastreio == codigo_rastreio).first()

def get_produtos(db: Session, skip: int = 0, limit: int = 100):
    return db.query(ProdutoLogistica).offset(skip).limit(limit).all()

def get_produtos_por_motorista(db: Session, motorista_id: int, skip: int = 0, limit: int = 100):
    return db.query(ProdutoLogistica)\
        .filter(ProdutoLogistica.motorista_id == motorista_id)\
        .offset(skip).limit(limit).all()

def create_produto(db: Session, produto: schemas.ProdutoCreate):
    codigo = gerar_codigo_rastreio(db)
    endereco_completo = f"{produto.logradouro}, {produto.numero}"
    if produto.complemento_tipo == 'apartamento' and produto.complemento:
        endereco_completo += f", Apto {produto.complemento}"
    elif produto.complemento_tipo == 'casa' and produto.complemento:
        endereco_completo += f", {produto.complemento}"
    endereco_completo += f" - {produto.bairro}, {produto.cidade}/{produto.estado} - CEP: {produto.cep}"

    db_produto = ProdutoLogistica(
        codigo_rastreio=codigo,
        destinatario=produto.destinatario,
        cep=produto.cep,
        logradouro=produto.logradouro,
        numero=produto.numero,
        complemento_tipo=produto.complemento_tipo,
        complemento=produto.complemento,
        bairro=produto.bairro,
        cidade=produto.cidade,
        estado=produto.estado,
        endereco=endereco_completo,
        status='pendência',
        motorista_id=produto.motorista_id
    )
    db.add(db_produto)
    db.commit()
    db.refresh(db_produto)
    return db_produto

def update_produto(db: Session, produto_id: int, produto: schemas.ProdutoUpdate):
    db_produto = get_produto(db, produto_id)
    if db_produto:
        update_data = produto.dict(exclude_unset=True)
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