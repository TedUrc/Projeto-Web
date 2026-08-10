from app.core.database import SessionLocal
from app.models.usuario import Usuario
from app.models.produto import ProdutoLogistica
from app.models.historico import HistoricoStatus
from app.models.localizacao import Localizacao
from app.core.security import gerar_hash_senha

db = SessionLocal()
usuario = db.query(Usuario).filter(Usuario.email == "arthur@email.com").first()
usuario.senha_hash = gerar_hash_senha("minhasenha123")
db.commit()
print("Senha atualizada!")
db.close()
