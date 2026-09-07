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

class ProdutoCreate(BaseModel):
    destinatario: str = Field(..., min_length=3, max_length=100)
    cep: str = Field(..., pattern=r'^\d{8}$')
    logradouro: str = Field(..., min_length=3, max_length=200)
    numero: str = Field(..., min_length=1, max_length=10)
    complemento_tipo: str = Field(..., pattern=r'^(casa|apartamento)$')
    complemento: str | None = Field(None, max_length=100)
    bairro: str = Field(..., min_length=2, max_length=100)
    cidade: str = Field(..., min_length=2, max_length=100)
    estado: str = Field(..., min_length=2, max_length=2)
    motorista_id: int | None = None

    @field_validator('destinatario')
    @classmethod
    def validar_destinatario(cls, v):
        v = v.strip()
        if not re.match(r'^[A-Za-zÀ-ÿ\s]+$', v):
            raise ValueError('Destinatário deve conter apenas letras e espaços')
        partes = v.split(' ')
        partes = [p for p in partes if p]
        if len(partes) < 2:
            raise ValueError('Informe nome e sobrenome completos do destinatário')
        return v

    @field_validator('cep')
    @classmethod
    def validar_cep(cls, v):
        v = re.sub(r'\D', '', v)
        if len(v) != 8:
            raise ValueError('CEP deve ter 8 dígitos')
        return v

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

class ProdutoResponse(BaseModel):
    id: int
    codigo_rastreio: str
    destinatario: str
    cep: str | None = None
    logradouro: str | None = None
    numero: str | None = None
    complemento_tipo: str | None = None
    complemento: str | None = None
    bairro: str | None = None
    cidade: str | None = None
    estado: str | None = None
    status: str
    motorista_id: int | None = None
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