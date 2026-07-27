from alembic.environment import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.dependencies import get_current_user, get_db
from app.core.security import verificar_senha, criar_token
from app.crud import usuario as crud_usuario
from app.models.usuario import Usuario
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

@router.get("/usuarios", response_model=List[UsuarioResponse])
def listar_usuarios(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Acesso negado — apenas administradores"
        )
    return db.query(Usuario).all()

@router.get("/me", response_model=UsuarioResponse)
def me(current_user=Depends(get_current_user)):
    return current_user