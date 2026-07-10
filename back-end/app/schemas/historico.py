from pydantic import BaseModel
from datetime import datetime

class HistoricoCreate(BaseModel):
    produto_id: int
    status: str
    alterado_por: int

class HistoricoResponse(BaseModel):
    id: int
    produto_id: int
    status: str
    alterado_por: int
    alterado_em: datetime

    class Config:
        from_attributes = True