from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List
from app.core.dependencies import get_db, get_current_user
from app.schemas.produto import ProdutoCreate, ProdutoUpdate, ProdutoResponse
from app.crud import produto as crud
from app.models.produto import ProdutoLogistica
import traceback
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/", response_model=List[ProdutoResponse])
def listar_produtos(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role == "admin":
        return crud.get_produtos(db, skip=skip, limit=limit)
    return crud.get_produtos_por_motorista(db, motorista_id=current_user.id, skip=skip, limit=limit)

@router.get("/{produto_id}", response_model=ProdutoResponse)
def buscar_produto(
    produto_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    produto = crud.get_produto(db, produto_id=produto_id)
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    if current_user.role != "admin" and produto.motorista_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    return produto

@router.post("/", response_model=ProdutoResponse, status_code=201)
def criar_produto(
    produto: ProdutoCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Apenas admins podem criar produtos")
    if crud.get_produto_por_rastreio(db, codigo_rastreio=produto.codigo_rastreio):
        raise HTTPException(status_code=400, detail="Código de rastreio já existe")
    try:
        return crud.create_produto(db=db, produto=produto)
    except Exception as e:
        logger.error(f"Erro ao criar produto: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Erro interno: {str(e)}")

@router.put("/{produto_id}", response_model=ProdutoResponse)
def atualizar_produto(
    produto_id: int,
    produto: ProdutoUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    db_produto = crud.get_produto(db, produto_id=produto_id)
    if not db_produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    if current_user.role != "admin" and db_produto.motorista_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    if current_user.role != "admin":
        produto.motorista_id = None
        produto.codigo_rastreio = None
        produto.destinatario = None
        produto.endereco = None
    result = crud.update_produto(db, produto_id=produto_id, produto=produto)
    return result

@router.delete("/{produto_id}", status_code=204)
def deletar_produto(
    produto_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Apenas admins podem deletar produtos")
    if not crud.delete_produto(db, produto_id=produto_id):
        raise HTTPException(status_code=404, detail="Produto não encontrado")