from fastapi import APIRouter
from app.api.v1.routes import produtos, auth, historico, localizacao

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["Autenticação"])
router.include_router(produtos.router, prefix="/produtos", tags=["Produtos"])
router.include_router(historico.router, prefix="/historico", tags=["Histórico"])
router.include_router(localizacao.router, prefix="/localizacao", tags=["Localização"])