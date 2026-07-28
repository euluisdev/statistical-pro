from fastapi import APIRouter, HTTPException, Body
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uuid
import os
import shutil
import base64
from datetime import datetime

router = APIRouter(prefix="/jobs", tags=["jobs"])

BASE_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "data", "jobs"
)

#garante que a pasta /data/jobs/ existe
os.makedirs(BASE_PATH, exist_ok=True)

#modelo para receber os dados do gráfico
class ChartData(BaseModel):
    group: str
    piece: str
    image_data: str
    page_type: str


@router.post("/create")
def create_job(group: str):
    """
    Cria um jobid associado a um grupo.
    - Gera um UUID.
    - Cria a pasta /data/jobs/<jobid>/
    - Cria a pasta /data/jobs/<jobid>/<group>/
    - Retorna o jobid.
    """
    jobid = str(uuid.uuid4())
    job_path = os.path.join(BASE_PATH, jobid)

    try:
        os.makedirs(job_path)
        os.makedirs(os.path.join(job_path, group))
    except Exception as e:
        raise HTTPException(500, f"Erro ao criar job: {e}")

    return {
        "status": "ok",
        "jobid": jobid,
        "path": job_path
    }


@router.delete("/job/{job_id}")
def delete_job(job_id: str):
    job_path = os.path.join(BASE_PATH, job_id)

    if not os.path.exists(job_path):
        raise HTTPException(status_code=404, detail="JobID não encontrado")

    try:
        shutil.rmtree(job_path)
        return {"message": f"JobID {job_id} encerrado e removido."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao deletar: {str(e)}")


@router.post("/job/{job_id}/save-chart")
async def save_chart_to_job(job_id: str, data: ChartData):
    """
    Salva uma imagem de gráfico no job-id.
    - job_id: ID do job ativo
    - data.group: nome do grupo
    - data.piece: nome da peça
    - data.image_data: imagem em base64 (PNG)
    """
    job_path = os.path.join(BASE_PATH, job_id)
    
    if not os.path.exists(job_path):
        raise HTTPException(status_code=404, detail="JobID não encontrado")
    
    group_path = os.path.join(job_path, data.group)
    piece_path = os.path.join(group_path, data.piece)
    page_path = os.path.join(piece_path, data.page_type)

    os.makedirs(page_path, exist_ok=True)
    
    try:
        #remove o prefixo "data:image/png;base64," se existir
        image_data_clean = data.image_data
        if "base64," in image_data_clean:
            image_data_clean = image_data_clean.split("base64,")[1]
        
        #decodifica a imagem
        image_bytes = base64.b64decode(image_data_clean)
        
        # gera nome do arquivo com timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
        filename = f"f{data.piece}_{timestamp}.png"
        filepath = os.path.join(page_path, filename)
        
        #save the img
        with open(filepath, "wb") as f:
            f.write(image_bytes)
        
        return {
            "status": "ok",
            "message": "Gráfico salvo com sucesso",
            "filename": filename,
            "path": filepath
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Erro ao salvar imagem: {str(e)}"
        )


@router.get("/job/{job_id}/charts")
def list_charts_in_job(job_id: str, group: str = None):
    """
    Lista todos os gráficos salvos em um job.
    Estrutura atual:
    jobid/group/piece/page_type/files.png
    """

    job_path = os.path.join(BASE_PATH, job_id)

    if not os.path.exists(job_path):
        raise HTTPException(status_code=404, detail="JobID não encontrado")

    charts = []

    try:

        groups = [group] if group else os.listdir(job_path)

        for group_name in groups:

            group_path = os.path.join(job_path, group_name)

            if not os.path.isdir(group_path):
                continue

            for piece_name in os.listdir(group_path):

                piece_path = os.path.join(group_path, piece_name)

                if not os.path.isdir(piece_path):
                    continue

                for page_type in os.listdir(piece_path):

                    page_path = os.path.join(piece_path, page_type)

                    if not os.path.isdir(page_path):
                        continue

                    for file in os.listdir(page_path):

                        if file.endswith(".png"):

                            charts.append({
                                "group": group_name,
                                "piece": piece_name,
                                "page_type": page_type,
                                "filename": file,
                                "url": f"/static/jobs/{job_id}/{group_name}/{piece_name}/{page_type}/{file}"
                            })

        return {
            "job_id": job_id,
            "charts": charts,
            "total": len(charts)
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao listar gráficos: {str(e)}"
        )
    











    

"""
the backend is a photographer only:
  1abre a URL de print - já renderizada pelo React com o slice correto
  2aguarda #action-plan-table
  3tira screenshot
  4save
  
"""
 
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from typing import Optional
import asyncio
import os
 
_executor = ThreadPoolExecutor(max_workers=2)
 
 
class ScreenshotRequest(BaseModel):
    page_url:    str
    group:       str
    piece:       str
    page_index:  int = 0          #índice da página - para nomear o arquivo
    total_pages: int = 1          #total de páginas - para nomear
 
 
def _shoot(page_url: str) -> bytes:
    """Abre a URL, espera a tabela, tira screenshot. Nada mais."""
 
    loop = asyncio.ProactorEventLoop() if os.name == "nt" else asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
 
    async def _go() -> bytes:
        from playwright.async_api import async_playwright
 
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page    = await browser.new_page(
                viewport            = {"width": 1800, "height": 1200},
                device_scale_factor = 2,
            )
 
            #abre a rota de print - sem navbar, sem toolbar)
            await page.goto(page_url, wait_until="networkidle", timeout=30_000)
 
            #aguarda o elemento da tabela
            await page.wait_for_selector("#action-plan-table", timeout=15_000)
 
            #aguarda renderização das cores CSS
            await page.wait_for_timeout(800)
 
            #captura exatamente o elemento — sem nada ao redor
            el  = await page.query_selector("#action-plan-table")
            png = await el.screenshot(type="png", scale="device")
 
            await browser.close()
            return png
 
    try:
        return loop.run_until_complete(_go())
    finally:
        loop.close()
 
 
@router.post("/job/{job_id}/screenshot-action-plan")
async def screenshot_action_plan(job_id: str, body: ScreenshotRequest):
    job_path = Path(BASE_PATH) / job_id
    if not job_path.exists():
        raise HTTPException(404, "JobID não encontrado")
 
    try:
        png_bytes = await asyncio.get_event_loop().run_in_executor(
            _executor, _shoot, body.page_url
        )
    except Exception as e:
        raise HTTPException(500, f"Screenshot falhou: {e}")
 
    #nomeia o arquivo: AP_PIECE.png ou AP_PIECE_p1.png, AP_PIECE_p2.png...
    safe_piece = Path(body.piece).name
    out_dir    = job_path / body.group / safe_piece / "ActionPlan"
    out_dir.mkdir(parents=True, exist_ok=True)
 
    if body.total_pages == 1:
        filename = f"AP_{safe_piece}.png"
    else:
        filename = f"AP_{safe_piece}_p{body.page_index + 1}.png"
 
    (out_dir / filename).write_bytes(png_bytes)
 
    return {
        "status": "ok",
        "files": [{
            "page":       body.page_index + 1,
            "filename":   filename,
            "static_url": f"/static/jobs/{job_id}/{safe_piece}/ActionPlan/{filename}",
        }],
    }  

  