from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from enum import Enum as PyEnum
from typing import Optional
import re

class ProdutoBase(BaseModel):
    codigo_rastreio: str = Field(..., min_length=10, max_length=50)
    destinatario: str = Field(..., min_length=3, max_length=100)
    endereco: str = Field(..., min_length=10, max_length=200)

    @field_validator('codigo_rastreio')
    @classmethod
    def validar_codigo(cls, v):
        v = v.strip().upper()
        if not re.match(r'^[A-Z]{2}[0-9]{9}[A-Z]{2}$', v):
            raise ValueError('Código inválido. Use o formato dos Correios: AA000000000AA')
        return v

    @field_validator('destinatario')
    @classmethod
    def validar_destinatario(cls, v):
        v = v.strip()
        if not re.match(r'^[A-Za-zÀ-ÿ\s]+$', v):
            raise ValueError('Destinatário deve conter apenas letras e espaços')
        return v

class ProdutoCreate(ProdutoBase):
    motorista_id: Optional[int] = None

class ProdutoUpdate(BaseModel):
    codigo_rastreio: str | None = Field(None, min_length=10, max_length=50)
    destinatario: str | None = Field(None, min_length=3, max_length=100)
    endereco: str | None = Field(None, min_length=10, max_length=200)
    status: str | None = Field(None)
    motorista_id: Optional[int] = None

    @field_validator('status')
    @classmethod
    def validar_status(cls, v):
        if v is not None:
            valores_validos = ['saída', 'pendência', 'entrega', 'cancelamento']
            if v not in valores_validos:
                raise ValueError(f'Status inválido. Use: {valores_validos}')
        return v

    @field_validator('codigo_rastreio')
    @classmethod
    def validar_codigo(cls, v):
        if v is not None:
            v = v.strip().upper()
            if not re.match(r'^[A-Z]{2}[0-9]{9}[A-Z]{2}$', v):
                raise ValueError('Código inválido. Use o formato dos Correios: AA000000000AA')
        return v

class ProdutoResponse(ProdutoBase):
    id: int
    status: str
    motorista_id: Optional[int] = None
    data_criacao: datetime
    data_atualizacao: datetime

    @field_validator('status', mode='before')
    @classmethod
    def serializar_status(cls, v):
        if isinstance(v, PyEnum):
            return v.value
        return v

    class Config:
        from_attributes = True