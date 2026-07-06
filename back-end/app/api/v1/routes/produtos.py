from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List
from app.core.dependencies import get_db, get_current_user
from app.schemas.produto import ProdutoCreate, ProdutoUpdate, ProdutoResponse
from app.crud import produto as crud

router = APIRouter()

@router.get("/", response_model=List[ProdutoResponse])
def listar_produtos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return crud.get_produtos(db, skip=skip, limit=limit)

@router.get("/{produto_id}", response_model=ProdutoResponse)
def buscar_produto(produto_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    produto = crud.get_produto(db, produto_id=produto_id)
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return produto

@router.post("/", response_model=ProdutoResponse, status_code=201)
def criar_produto(produto: ProdutoCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if crud.get_produto_por_rastreio(db, codigo_rastreio=produto.codigo_rastreio):
        raise HTTPException(status_code=400, detail="Código de rastreio já existe")
    try:
        return crud.create_produto(db=db, produto=produto)
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Erro interno ao criar produto")

@router.put("/{produto_id}", response_model=ProdutoResponse)
def atualizar_produto(produto_id: int, produto: ProdutoUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db_produto = crud.update_produto(db, produto_id=produto_id, produto=produto)
    if not db_produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return db_produto

@router.delete("/{produto_id}", status_code=204)
def deletar_produto(produto_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if not crud.delete_produto(db, produto_id=produto_id):
        raise HTTPException(status_code=404, detail="Produto não encontrado")