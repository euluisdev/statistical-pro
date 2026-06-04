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
    











    

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import asyncio
import io
import os
 
# reutiliza as helpers já existentes no seu jobs_router.py
# BASE_PATH e _safe_folder() já declarados no seu arquivo
 
A4_W_PX = 1123
A4_H_PX = 794
 
_executor = ThreadPoolExecutor(max_workers=2)
 
 
class ScreenshotRequest(BaseModel):
    page_url: str
    group:    str
    piece:    str
    wait_for: str   = "#action-plan-table"
    zoom:     float = 1.0
 
 
def _run_playwright_sync(page_url: str, wait_for: str) -> bytes:
    """
    Função SÍNCRONA que roda num thread separado com seu próprio event loop.
    Isso contorna o problema do Windows onde o loop do uvicorn não suporta
    criar subprocessos via asyncio.
    """
    import asyncio
    # No Windows é obrigatório usar ProactorEventLoop para subprocessos
    if os.name == "nt":
        loop = asyncio.ProactorEventLoop()
    else:
        loop = asyncio.new_event_loop()
 
    asyncio.set_event_loop(loop)
 
    async def _capture():
        from playwright.async_api import async_playwright
 
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
            )
            page = await browser.new_page(viewport={"width": 1600, "height": 900})
            try:
                await page.goto(page_url, wait_until="networkidle", timeout=15_000)
                print("URL FINAL:", page.url)
                await page.wait_for_selector(wait_for, state="attached",timeout=15_000)
                await page.wait_for_timeout(1_000)
 
                el   = await page.query_selector(wait_for)
                bbox = await el.bounding_box()
 
                await page.set_viewport_size({
                    "width":  max(1600, int(bbox["width"])  + 40),
                    "height": max(900,  int(bbox["height"]) + 40),
                })
 
                screenshot = await el.screenshot(type="png")
                return screenshot
            finally:
                await browser.close()
 
    try:
        return loop.run_until_complete(_capture())
    finally:
        loop.close()
 
 
@router.post("/job/{job_id}/screenshot-action-plan")
async def screenshot_action_plan(job_id: str, body: ScreenshotRequest):
    job_path = Path(BASE_PATH) / job_id
    if not job_path.exists():
        raise HTTPException(404, "JobID não encontrado")
 
    try:
        import playwright  # noqa — só verifica se está instalado
    except ImportError:
        raise HTTPException(500,
            "Playwright não instalado. Execute:\n"
            "pip install playwright\n"
            "python -m playwright install chromium"
        )
 
    try:
        from PIL import Image
    except ImportError:
        raise HTTPException(500,
            "Pillow não instalado. Execute: pip install Pillow"
        )
 
    safe_piece = Path(body.piece).name
    target_dir = job_path / safe_piece / body.group / "ActionPlan"
    target_dir.mkdir(parents=True, exist_ok=True)
 
    # Roda Playwright no executor (thread separada com event loop próprio)
    loop = asyncio.get_event_loop()
    try:
        screenshot_bytes = await loop.run_in_executor(
            _executor,
            _run_playwright_sync,
            body.page_url,
            body.wait_for,
        )
    except Exception as e:
        raise HTTPException(500, f"Erro ao capturar screenshot: {str(e)}")
 
    # Divide em fatias A4 com Pillow
    img = Image.open(io.BytesIO(screenshot_bytes))
    scale_ratio = A4_W_PX / img.width
    new_w = A4_W_PX
    new_h = int(img.height * scale_ratio)
    img_resized = img.resize((new_w, new_h), Image.LANCZOS)
 
    total_pages = max(1, -(-new_h // A4_H_PX))
    results = []
 
    for page_idx in range(total_pages):
        y_start   = page_idx * A4_H_PX
        y_end     = min(y_start + A4_H_PX, new_h)
        slice_img = Image.new("RGB", (new_w, A4_H_PX), (255, 255, 255))
        slice_img.paste(img_resized.crop((0, y_start, new_w, y_end)), (0, 0))
 
        filename = (
            f"AP_{safe_piece}.png" if total_pages == 1
            else f"AP_{safe_piece}_page{page_idx + 1}.png"
        )
        filepath = target_dir / filename
 
        buf = io.BytesIO()
        slice_img.save(buf, format="PNG")
        filepath.write_bytes(buf.getvalue())
 
        results.append({
            "page":       page_idx + 1,
            "filename":   filename,
            "static_url": f"/static/jobs/{job_id}/{safe_piece}/ActionPlan/{filename}",
        })
 
    return {
        "status":      "ok",
        "job_id":      job_id,
        "piece":       safe_piece,
        "total_pages": len(results),
        "files":       results,
    }