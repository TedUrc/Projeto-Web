from datetime import datetime, timedelta, timezone
import os
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.core.security import criar_token, gerar_hash_senha, verificar_senha
from app.crud import usuario as crud_usuario
from app.models.token_confirmacao import TokenConfirmacao
from app.models.token_recuperacao import TokenRecuperacao
from app.models.usuario import Usuario
from app.schemas.usuario import Token, UsuarioCreate, UsuarioResponse
from app.schemas.token_recuperacao import SolicitarRecuperacao, RedefinirSenha

from app.services.email import (
    enviar_email_confirmacao,
    enviar_email_recuperacao,
    gerar_token_confirmacao,
    gerar_token_recuperacao,
)

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")


@router.post("/register", response_model=UsuarioResponse, status_code=201)
@limiter.limit("5/minute")
def registrar(
    request: Request, usuario: UsuarioCreate, db: Session = Depends(get_db)
):
    if crud_usuario.get_usuario_por_email(db, email=usuario.email):
        raise HTTPException(status_code=400, detail="Email já cadastrado")

    db_usuario = crud_usuario.create_usuario(db=db, usuario=usuario)

    # Gera token e envia e-mail de confirmação
    token = gerar_token_confirmacao(db, usuario_id=db_usuario.id)
    enviar_email_confirmacao(
        email=db_usuario.email,
        nome=db_usuario.nome,
        token=token,
        base_url=BASE_URL,
    )

    return db_usuario


@router.get("/confirmar/{token}")
def confirmar_email(token: str, db: Session = Depends(get_db)):
    db_token = (
        db.query(TokenConfirmacao)
        .filter(TokenConfirmacao.token == token)
        .first()
    )

    if not db_token:
        raise HTTPException(
            status_code=404, detail="Token inválido ou expirado"
        )

    usuario = crud_usuario.get_usuario_por_id(
        db, usuario_id=db_token.usuario_id
    )
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    usuario.ativo = True
    db.delete(db_token)
    db.commit()

    return {"message": "Conta confirmada com sucesso! Você já pode fazer login."}


@router.post("/login", response_model=Token)
@limiter.limit("10/minute")
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    usuario = crud_usuario.get_usuario_por_email(db, email=form_data.username)
    if not usuario:
        raise HTTPException(
            status_code=401,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not usuario.ativo:
        raise HTTPException(
            status_code=403,
            detail="Conta não confirmada. Verifique seu e-mail.",
        )
    if not verificar_senha(form_data.password, usuario.senha_hash):
        raise HTTPException(
            status_code=401,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = criar_token(data={"sub": usuario.email})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=UsuarioResponse)
def me(current_user=Depends(get_current_user)):
    return current_user


@router.get("/usuarios", response_model=List[UsuarioResponse])
def listar_usuarios(
    db: Session = Depends(get_db), current_user=Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    return db.query(Usuario).all()


@router.delete("/usuarios/{usuario_id}", status_code=204)
def deletar_usuario(
    usuario_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    if usuario_id == current_user.id:
        raise HTTPException(
            status_code=400, detail="Você não pode deletar sua própria conta"
        )
    if not crud_usuario.delete_usuario(db, usuario_id=usuario_id):
        raise HTTPException(status_code=404, detail="Usuário não encontrado")


@router.get("/motoristas/disponiveis", response_model=List[UsuarioResponse])
def motoristas_disponiveis(
    db: Session = Depends(get_db), current_user=Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    return crud_usuario.get_motoristas_disponiveis(db)


@router.patch("/usuarios/{usuario_id}/ativar", response_model=UsuarioResponse)
def toggle_ativo(
    usuario_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Acesso negado")
    if usuario_id == current_user.id:
        raise HTTPException(
            status_code=400, detail="Você não pode desativar sua própria conta"
        )
    usuario = crud_usuario.toggle_ativo(db, usuario_id=usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return usuario


@router.post("/recuperar-senha")
@limiter.limit("3/minute")
def solicitar_recuperacao(
    request: Request, body: SolicitarRecuperacao, db: Session = Depends(get_db)
):
    usuario = crud_usuario.get_usuario_por_email(db, email=body.email)
    if usuario and usuario.ativo:
        token = gerar_token_recuperacao(db, usuario_id=usuario.id)
        enviar_email_recuperacao(
            email=usuario.email,
            nome=usuario.nome,
            token=token,
            base_url=BASE_URL,
        )
    return {
        "message": "Se o e-mail estiver cadastrado, você receberá as instruções."
    }


@router.post("/redefinir-senha")
def redefinir_senha(body: RedefinirSenha, db: Session = Depends(get_db)):
    db_token = (
        db.query(TokenRecuperacao)
        .filter(TokenRecuperacao.token == body.token)
        .first()
    )

    if not db_token:
        raise HTTPException(
            status_code=404, detail="Token inválido ou expirado"
        )

    # Tratamento seguro contra inconsistências de fuso horário
    agora = datetime.now(timezone.utc)
    criado_em = db_token.criado_em
    if criado_em.tzinfo is None:
        criado_em = criado_em.replace(tzinfo=timezone.utc)

    if agora - criado_em > timedelta(hours=1):
        db.delete(db_token)
        db.commit()
        raise HTTPException(
            status_code=400, detail="Token expirado. Solicite um novo link."
        )

    usuario = crud_usuario.get_usuario_por_id(
        db, usuario_id=db_token.usuario_id
    )
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    usuario.senha_hash = gerar_hash_senha(body.nova_senha)
    db.delete(db_token)
    db.commit()

    return {"message": "Senha redefinida com sucesso!"}