from fastapi import APIRouter
from app.api.v1.routes import produtos, auth, historico

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["Autenticação"])
router.include_router(produtos.router, prefix="/produtos", tags=["Produtos"])
router.include_router(historico.router, prefix="/historico", tags=["Histórico"])