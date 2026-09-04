from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.core.dependencies import get_db, get_current_user
from app.core.security import verificar_senha, criar_token
from app.crud import usuario as crud_usuario
from app.schemas.usuario import UsuarioCreate, UsuarioResponse, Token
from app.models.usuario import Usuario
from app.models.token_confirmacao import TokenConfirmacao
from app.services.email import gerar_token_confirmacao, enviar_email_confirmacao
import os

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")

@router.post("/register", response_model=UsuarioResponse, status_code=201)
@limiter.limit("5/minute")
def registrar(request: Request, usuario: UsuarioCreate, db: Session = Depends(get_db)):
    if crud_usuario.get_usuario_por_email(db, email=usuario.email):
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    db_usuario = crud_usuario.create_usuario(db=db, usuario=usuario)

    # Gera token e envia e-mail de confirmação
    token = gerar_token_confirmacao(db, usuario_id=db_usuario.id)
    enviar_email_confirmacao(
        email=db_usuario.email,
        nome=db_usuario.nome,
        token=token,
        base_url=BASE_URL
    )

    return db_usuario

@router.get("/confirmar/{token}")
def confirmar_email(token: str, db: Session = Depends(get_db)):
    db_token = db.query(TokenConfirmacao).filter(
        TokenConfirmacao.token == token
    ).first()

    if not db_token:
        raise HTTPException(status_code=404, detail="Token inválido ou expirado")

    usuario = crud_usuario.get_usuario_por_id(db, usuario_id=db_token.usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    usuario.ativo = True
    db.delete(db_token)
    db.commit()

    return {"message": "Conta confirmada com sucesso! Você já pode fazer login."}

@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
def login(request: Request, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    usuario = crud_usuario.get_usuario_por_email(db, email=form_data.username)
    if not usuario:
        raise HTTPException(status_code=401, detail="Email ou senha incorretos", headers={"WWW-Authenticate": "Bearer"})
    if not usuario.ativo:
        raise HTTPException(status_code=403, detail="Conta não confirmada. Verifique seu e-mail.")
    if not verificar_senha(form_data.password, usuario.senha_hash):
        raise HTTPException(status_code=401, detail="Email ou senha incorretos", headers={"WWW-Authenticate": "Bearer"})
    token = criar_token(data={"sub": usuario.email})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=UsuarioResponse)
def me(current_user=Depends(get_current_user)):
    return current_user

@router.get("/usuarios", response_model=List[UsuarioResponse])
def listar_usuarios(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    return db.query(Usuario).all()

@router.delete("/usuarios/{usuario_id}", status_code=204)
def deletar_usuario(usuario_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    if usuario_id == current_user.id:
        raise HTTPException(status_code=400, detail="Você não pode deletar sua própria conta")
    if not crud_usuario.delete_usuario(db, usuario_id=usuario_id):
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

@router.patch("/usuarios/{usuario_id}/ativar", response_model=UsuarioResponse)
def toggle_ativo(usuario_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    if usuario_id == current_user.id:
        raise HTTPException(status_code=400, detail="Você não pode desativar sua própria conta")
    usuario = crud_usuario.toggle_ativo(db, usuario_id=usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return usuario