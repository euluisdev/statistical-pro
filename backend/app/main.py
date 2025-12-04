
from fastapi import FastAPI
from .routes.groups import router as groups_router
from .routes.pieces import router as pieces_router
from .routes.charts import router as charts_router 
from .routes.jobid import router as jobid_router
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os 

app = FastAPI(title="Statistical Project API")

JOBS_PATH = os.path.join(os.path.dirname(__file__), "data", "jobs")

os.makedirs(JOBS_PATH, exist_ok=True)

app.mount("/static/jobs", StaticFiles(directory=JOBS_PATH), name="static_jobs")

#cors - permitir local dev do front
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(groups_router)
app.include_router(pieces_router) 
app.include_router(charts_router) 
app.include_router(jobid_router) 

@app.get("/")
def ping():
    return {"ok": True}
