from pydantic import BaseModel, Field
from datetime import datetime

class LocalizacaoCreate(BaseModel):
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)

class LocalizacaoResponse(BaseModel):
    id: int
    produto_id: int
    enviado_por: int
    latitude: float
    longitude: float
    registrado_em: datetime

    class Config:
        from_attributes = True