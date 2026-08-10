from pydantic import BaseModel, EmailStr, Field

class UsuarioCreate(BaseModel):
    email: EmailStr
    nome: str = Field(..., min_length=3, max_length=100)
    senha: str = Field(..., min_length=6)

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