from pydantic import BaseModel, EmailStr, Field, field_validator
import re

class UsuarioCreate(BaseModel):
    email: EmailStr
    nome: str = Field(..., min_length=3, max_length=100)
    senha: str = Field(..., min_length=8)

    @field_validator('nome')
    @classmethod
    def validar_nome(cls, v):
        v = v.strip()
        if not re.match(r'^[A-Za-zÀ-ÿ\s]+$', v):
            raise ValueError('Nome deve conter apenas letras e espaços')
        return v

    @field_validator('senha')
    @classmethod
    def validar_senha(cls, v):
        if not re.search(r'[A-Z]', v):
            raise ValueError('Senha deve ter pelo menos uma letra maiúscula')
        if not re.search(r'[0-9]', v):
            raise ValueError('Senha deve ter pelo menos um número')
        return v

class UsuarioResponse(BaseModel):
    id: int
    email: str
    nome: str
    ativo: bool
    role: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None