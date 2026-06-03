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
import os
import re
import base64
from pathlib import Path
from datetime import datetime
 
 
# ── reutiliza as helpers já existentes no seu jobs_router.py ─────────────────
# BASE_PATH, _safe_folder() — já declarados no seu arquivo
 
 
# ── Schema do novo endpoint ───────────────────────────────────────────────────
 
class ScreenshotRequest(BaseModel):
    page_url:   str          # URL completa da página, ex: "http://localhost:3000/action-plan/CONJUNTO_5980/53327786"
    group:      str          # ex: "CONJUNTO_5980"
    piece:      str          # ex: "53327786"
    wait_for:   str = "#action-plan-table"   # seletor CSS para aguardar antes de capturar
    zoom:       float = 1.0  # zoom extra (1.0 = normal, 0.8 = reduz um pouco para caber mais)
 
 
# ── Constantes A4 landscape 
A4_W_PX = 1123   # 297mm × 3.78px/mm ≈ 1123px
A4_H_PX = 794    # 210mm × 3.78px/mm ≈ 794px
 
 
# ── ENDPOINT: tira screenshot da página e salva no job
 
@router.post("/job/{job_id}/screenshot-action-plan")
async def screenshot_action_plan(job_id: str, body: ScreenshotRequest):
    """
    Usa Playwright (Chromium headless) para renderizar a página do Action Plan,
    captura a tabela em alta resolução, divide em folhas A4 landscape e salva
    cada PNG no job ativo.
 
    Estrutura salva:
      data/jobs/{job_id}/{piece}/ActionPlan/AP_{piece}.png
      data/jobs/{job_id}/{piece}/ActionPlan/AP_{piece}_page2.png  (se necessário)
    """
 
    # Verifica se o job existe
    job_path = Path(BASE_PATH) / job_id
    if not job_path.exists():
        raise HTTPException(404, "JobID não encontrado")
 
    # Cria pasta de destino
    safe_piece = Path(body.piece).name
    target_dir  = job_path / safe_piece / body.group / "ActionPlan"
    target_dir.mkdir(parents=True, exist_ok=True)
 
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise HTTPException(500,
            "Playwright não instalado. Execute: pip install playwright && python -m playwright install chromium"
        )
 
    results = []
 
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
            ]
        )
 
        # Viewport largo para não quebrar a tabela
        page = await browser.new_page(
            viewport={"width": 1600, "height": 900}
        )
 
        try:
            # 1. Navega para a página
            await page.goto(body.page_url, wait_until="networkidle", timeout=30000)
 
            # 2. Aguarda a tabela aparecer no DOM
            await page.wait_for_selector(body.wait_for, timeout=15000)
 
            # 3. Aguarda mais 1s para garantir que dados dinâmicos carregaram
            await page.wait_for_timeout(1000)
 
            # 4. Pega dimensões reais da tabela
            table_el = await page.query_selector(body.wait_for)
            if not table_el:
                raise HTTPException(404, f"Elemento '{body.wait_for}' não encontrado na página")
 
            bbox = await table_el.bounding_box()
            if not bbox:
                raise HTTPException(500, "Não foi possível obter dimensões da tabela")
 
            table_w = int(bbox["width"])
            table_h = int(bbox["height"])
 
            # 5. Captura screenshot da tabela inteira em alta resolução (device_scale_factor=3)
            #    Redimensiona viewport para garantir que a tabela inteira é visível
            await page.set_viewport_size({
                "width":  max(1600, table_w + 40),
                "height": max(900,  table_h + 40),
            })
 
            # Recalcula bbox após redimensionar
            bbox = await table_el.bounding_box()
 
            screenshot_bytes = await table_el.screenshot(
                type="png",
                scale="device",   # usa device_scale_factor
            )
 
            # 6. Converte para PIL para dividir em fatias A4
            try:
                from PIL import Image
                import io
            except ImportError:
                raise HTTPException(500,
                    "Pillow não instalado. Execute: pip install Pillow"
                )
 
            img = Image.open(io.BytesIO(screenshot_bytes))
 
            # Redimensiona para largura A4 landscape mantendo proporção
            scale_ratio = A4_W_PX / img.width
            new_w = A4_W_PX
            new_h = int(img.height * scale_ratio)
            img_resized = img.resize((new_w, new_h), Image.LANCZOS)
 
            # 7. Divide em fatias A4 se necessário
            total_pages = max(1, -(-new_h // A4_H_PX))   # ceil division
 
            for page_idx in range(total_pages):
                y_start = page_idx * A4_H_PX
                y_end   = min(y_start + A4_H_PX, new_h)
 
                # Cria imagem da fatia com fundo branco
                slice_img = Image.new("RGB", (new_w, A4_H_PX), (255, 255, 255))
                crop = img_resized.crop((0, y_start, new_w, y_end))
                slice_img.paste(crop, (0, 0))
 
                # Nome do arquivo
                if total_pages == 1:
                    filename = f"AP_{safe_piece}.png"
                else:
                    filename = f"AP_{safe_piece}_page{page_idx + 1}.png"
 
                # Sobrescreve se existir (nova captura = versão mais recente)
                filepath = target_dir / filename
 
                buf = io.BytesIO()
                slice_img.save(buf, format="PNG", optimize=False)
                filepath.write_bytes(buf.getvalue())
 
                static_url = f"/static/jobs/{job_id}/{safe_piece}/ActionPlan/{filename}"
                results.append({
                    "page":       page_idx + 1,
                    "filename":   filename,
                    "static_url": static_url,
                    "path":       str(filepath),
                })
 
        finally:
            await browser.close()
 
    return {
        "status":      "ok",
        "job_id":      job_id,
        "piece":       safe_piece,
        "total_pages": len(results),
        "files":       results,
    }    