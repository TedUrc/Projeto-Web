from sqlalchemy.orm import Session
from app.models.usuario import Usuario
from app.schemas.usuario import UsuarioCreate
from app.core.security import gerar_hash_senha

def get_usuario_por_email(db: Session, email: str):
    return db.query(Usuario).filter(Usuario.email == email).first()

def get_usuario_por_id(db: Session, usuario_id: int):
    return db.query(Usuario).filter(Usuario.id == usuario_id).first()

def create_usuario(db: Session, usuario: UsuarioCreate):
    senha_hash = gerar_hash_senha(usuario.senha)
    db_usuario = Usuario(
        email=usuario.email,
        nome=usuario.nome,
        senha_hash=senha_hash
    )
    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

def delete_usuario(db: Session, usuario_id: int):
    db_usuario = get_usuario_por_id(db, usuario_id)
    if db_usuario:
        db.delete(db_usuario)
        db.commit()
        return True
    return False

def toggle_ativo(db: Session, usuario_id: int):
    db_usuario = get_usuario_por_id(db, usuario_id)
    if db_usuario:
        db_usuario.ativo = not db_usuario.ativo
        db.commit()
        db.refresh(db_usuario)
    return db_usuario