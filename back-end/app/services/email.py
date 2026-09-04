import secrets
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models.token_confirmacao import TokenConfirmacao

def gerar_token_confirmacao(db: Session, usuario_id: int) -> str:
    # Remove tokens antigos do usuário
    db.query(TokenConfirmacao).filter(
        TokenConfirmacao.usuario_id == usuario_id
    ).delete()

    token = secrets.token_urlsafe(32)
    db_token = TokenConfirmacao(usuario_id=usuario_id, token=token)
    db.add(db_token)
    db.commit()
    return token

def enviar_email_confirmacao(email: str, nome: str, token: str, base_url: str):
    link = f"{base_url}/auth/confirmar/{token}"
    print(f"[EMAIL SIMULADO] Para: {email}")
    print(f"[EMAIL SIMULADO] Olá {nome}, confirme sua conta: {link}")
    return True