
from fastapi import FastAPI
from .routes.groups import router as groups_router
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(title="Statistical Project API")

# CORS - permitir local dev do frontend (ajuste origem em produção)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(groups_router)

@app.get("/")
def ping():
    return {"ok": True}
