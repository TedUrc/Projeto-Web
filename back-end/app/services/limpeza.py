from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.usuario import Usuario
from app.models.token_confirmacao import TokenConfirmacao

def deletar_contas_nao_confirmadas():
    db: Session = SessionLocal()
    try:
        limite = datetime.now(timezone.utc) - timedelta(days=3)

        # Busca usuários inativos com token criado há mais de 3 dias
        usuarios_expirados = db.query(Usuario).join(
            TokenConfirmacao,
            TokenConfirmacao.usuario_id == Usuario.id
        ).filter(
            Usuario.ativo == False,
            TokenConfirmacao.criado_em < limite
        ).all()

        for usuario in usuarios_expirados:
            print(f"[LIMPEZA] Deletando conta não confirmada: {usuario.email}")
            db.delete(usuario)

        db.commit()
        print(f"[LIMPEZA] {len(usuarios_expirados)} contas deletadas")
    except Exception as e:
        print(f"[LIMPEZA] Erro: {e}")
        db.rollback()
    finally:
        db.close()