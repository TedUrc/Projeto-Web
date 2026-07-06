from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app.core.security import verificar_senha, criar_token
from app.crud import usuario as crud_usuario
from app.schemas.usuario import UsuarioCreate, UsuarioResponse, Token

router = APIRouter()

@router.post("/register", response_model=UsuarioResponse, status_code=201)
def registrar(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    if crud_usuario.get_usuario_por_email(db, email=usuario.email):
        raise HTTPException(status_code=400, detail="Email já cadastrado")
    return crud_usuario.create_usuario(db=db, usuario=usuario)

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    usuario = crud_usuario.get_usuario_por_email(db, email=form_data.username)
    if not usuario or not verificar_senha(form_data.password, usuario.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = criar_token(data={"sub": usuario.email})
    return {"access_token": token, "token_type": "bearer"}