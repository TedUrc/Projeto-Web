from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import router
from app.core.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Logística")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
def root():
    return {"message": "API Logística funcionando!", "status": "online"}

@app.get("/health")
def health():
    return {"status": "healthy"}