from pydantic import BaseModel, EmailStr, Field


class SolicitarRecuperacao(BaseModel):
    email: EmailStr


class RedefinirSenha(BaseModel):
    token: str
    nova_senha: str = Field(..., min_length=8)