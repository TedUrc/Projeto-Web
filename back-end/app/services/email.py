import secrets
import resend
import os
from sqlalchemy.orm import Session
from app.models.token_confirmacao import TokenConfirmacao
from app.models.token_recuperacao import TokenRecuperacao

resend.api_key = os.getenv("RESEND_API_KEY")

def gerar_token_confirmacao(db: Session, usuario_id: int) -> str:
    db.query(TokenConfirmacao).filter(
        TokenConfirmacao.usuario_id == usuario_id
    ).delete()

    token = secrets.token_urlsafe(32)
    db_token = TokenConfirmacao(usuario_id=usuario_id, token=token)
    db.add(db_token)
    db.commit()
    return token

def enviar_email_confirmacao(email: str, nome: str, token: str, base_url: str):
    link = f"{base_url}/confirmar/{token}"
    
    try:
        resend.Emails.send({
            "from": os.getenv("RESEND_FROM", "onboarding@resend.dev"),
            "to": email,
            "subject": "Confirme sua conta — Logística",
            "html": f"""
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
                <h2 style="color: #1e293b;">Olá, {nome}!</h2>
                <p style="color: #64748b;">
                    Obrigado por criar sua conta no sistema de logística.
                    Clique no botão abaixo para confirmar seu e-mail e ativar sua conta.
                </p>
                <a href="{link}" style="
                    display: inline-block;
                    margin: 24px 0;
                    padding: 12px 24px;
                    background: #2563eb;
                    color: white;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: bold;
                ">
                    Confirmar minha conta
                </a>
                <p style="color: #94a3b8; font-size: 12px;">
                    Este link expira em 3 dias. Se você não criou esta conta, ignore este e-mail.
                </p>
                <p style="color: #94a3b8; font-size: 12px;">
                    Ou copie e cole este link no navegador:<br/>
                    <a href="{link}" style="color: #2563eb;">{link}</a>
                </p>
            </div>
            """
        })
        return True
    except Exception as e:
        print(f"[EMAIL] Erro ao enviar: {e}")
        return False

def gerar_token_recuperacao(db: Session, usuario_id: int) -> str:
    db.query(TokenRecuperacao).filter(TokenRecuperacao.usuario_id == usuario_id).delete()
    token = secrets.token_urlsafe(32)
    db.add(TokenRecuperacao(usuario_id=usuario_id, token=token))
    db.commit()
    return token

def enviar_email_recuperacao(email: str, nome: str, token: str, base_url: str):
    link = f"{base_url}/recuperar/{token}"
    try:
        resend.Emails.send({
            "from": os.getenv("RESEND_FROM", "onboarding@resend.dev"),
            "to": email,
            "subject": "Recuperação de senha — Logística",
            "html": f"""
            <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;">
                <h2 style="color:#1e293b;">Olá, {nome}!</h2>
                <p style="color:#64748b;">Recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo:</p>
                <a href="{link}" style="display:inline-block;margin:24px 0;padding:12px 24px;background:#2563eb;color:white;text-decoration:none;border-radius:8px;font-weight:bold;">
                    Redefinir senha
                </a>
                <p style="color:#94a3b8;font-size:12px;">Este link expira em 1 hora. Se não foi você, ignore este e-mail.</p>
            </div>
            """
        })
        return True
    except Exception as e:
        print(f"[EMAIL] Erro: {e}")
        return False