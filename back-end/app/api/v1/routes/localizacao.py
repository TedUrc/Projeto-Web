from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.schemas.localizacao import LocalizacaoCreate, LocalizacaoResponse
from app.crud import localizacao as crud_loc
from app.crud import produto as crud_produto
from typing import List

router = APIRouter()

@router.post("/{produto_id}", response_model=LocalizacaoResponse)
def enviar_localizacao(
    produto_id: int,
    localizacao: LocalizacaoCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    produto = crud_produto.get_produto(db, produto_id=produto_id)
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    return crud_loc.create_localizacao(
        db,
        produto_id=produto_id,
        enviado_por=current_user.id,
        localizacao=localizacao
    )

@router.get("/{produto_id}/atual", response_model=LocalizacaoResponse)
def ultima_localizacao(
    produto_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    loc = crud_loc.get_ultima_localizacao(db, produto_id=produto_id)
    if not loc:
        raise HTTPException(status_code=404, detail="Nenhuma localização registrada")
    return loc

@router.get("/{produto_id}/historico", response_model=List[LocalizacaoResponse])
def historico_localizacao(
    produto_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return crud_loc.get_historico_localizacao(db, produto_id=produto_id)