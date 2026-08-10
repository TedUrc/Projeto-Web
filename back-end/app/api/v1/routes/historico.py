from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.dependencies import get_db, get_current_user
from app.schemas.historico import HistoricoResponse, HistoricoCreate
from app.schemas.produto import ProdutoResponse, ProdutoUpdate
from app.crud import historico as crud_historico
from app.crud import produto as crud_produto
from app.models.produto import StatusProduto

router = APIRouter()

@router.get("/{produto_id}", response_model=List[HistoricoResponse])
def buscar_historico(
    produto_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    produto = crud_produto.get_produto(db, produto_id=produto_id)
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    if current_user.role != "admin" and produto.motorista_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso negado")
    return crud_historico.get_historico_por_produto(db, produto_id=produto_id)

@router.post("/{produto_id}/status", response_model=ProdutoResponse)
def atualizar_status(
    produto_id: int,
    status: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    valores_validos = [e.value for e in StatusProduto]
    if status not in valores_validos:
        raise HTTPException(status_code=400, detail=f"Status inválido. Use: {valores_validos}")

    produto = crud_produto.get_produto(db, produto_id=produto_id)
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    if current_user.role != "admin" and produto.motorista_id != current_user.id:
        raise HTTPException(status_code=403, detail="Acesso negado")

    crud_produto.update_produto(db, produto_id=produto_id, produto=ProdutoUpdate(status=status))
    crud_historico.create_historico(db, HistoricoCreate(
        produto_id=produto_id,
        status=status,
        alterado_por=current_user.id
    ))
    return crud_produto.get_produto(db, produto_id=produto_id)