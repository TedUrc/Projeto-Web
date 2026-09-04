from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from apscheduler.schedulers.background import BackgroundScheduler
from app.api.v1.router import router
from app.core.database import engine, Base
from app.services.limpeza import deletar_contas_nao_confirmadas

Base.metadata.create_all(bind=engine)

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="API Logística")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://seu-app.railway.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

# Scheduler — roda limpeza todo dia às 3h da manhã
scheduler = BackgroundScheduler()
scheduler.add_job(deletar_contas_nao_confirmadas, 'cron', hour=3, minute=0)
scheduler.start()

@app.on_event("shutdown")
def shutdown_scheduler():
    scheduler.shutdown()

@app.get("/")
def root():
    return {"message": "API Logística funcionando!", "status": "online"}

@app.get("/health")
def health():
    return {"status": "healthy"}