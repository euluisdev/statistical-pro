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
Mudança de estratégia:
  Backend monta o HTML da tabela diretamente dos dados salvos e
   o Playwright renderiza esse HTML isolado — sem dependência do frontend.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import asyncio, io, os, json

# reutiliza BASE_PATH e _safe_folder() já declarados no seu jobs_router.py

A4_W_PX  = 2480
A4_H_PX  = 1754
_executor = ThreadPoolExecutor(max_workers=2)


class ScreenshotRequest(BaseModel):
    group: str
    piece: str


RISK_COLORS = {
    "To 0,5mm": ("#e5e7eb","#111"), "To 1,0mm": ("#bfdbfe","#111"),
    "To 1,5mm": ("#fef08a","#111"), "To 2,0mm": ("#fca5a5","#111"),
    "To 2,5mm": ("#60a5fa","#111"), "To 3,0mm": ("#1e40af","#fff"),
    "To 3,5mm": ("#7c3aed","#fff"), "To 4,0mm": ("#6b7280","#fff"),
    "Up 4,5mm": ("#1f2937","#fff"),
}
WEEK_COLORS = {"X":"#aad4f5","NOK":"#ffaaaa","R":"#ffe099"}

def _cpk_bg(v):
    if v is None: return "transparent"
    n = float(v)
    return "#22bb44" if n>=1.33 else "#f0b800" if n>=1.0 else "#cc2222"

def _fmt(v):
    if v is None: return "—"
    try: return f"{float(v):.2f}".replace(".",",")
    except: return str(v)

def _load_plans(group, piece):
    BASE = Path(__file__).resolve().parent.parent / "data" / "groups"
    f = BASE / group / "pieces" / piece / "action_plan.json"
    if not f.exists(): return []
    with open(f, encoding="utf-8") as fp: return json.load(fp)

def _get_weeks(plans):
    weeks = set()
    for p in plans:
        for ws in p.get("week_statuses",[]): weeks.add(ws["week"])
    return sorted(weeks)

def _th(txt, extra=""):
    return (f'<th style="background:#e8ecf0;font-size:9px;font-weight:bold;'
            f'padding:4px 3px;border:1px solid #bbb;text-align:center;'
            f'white-space:nowrap;{extra}">{txt}</th>')

def _td(txt, extra=""):
    return (f'<td style="padding:3px 5px;border:1px solid #ccc;'
            f'text-align:center;font-size:10px;{extra}">{txt}</td>')

def _build_html(group, piece, plans, weeks):
    week_ths = "".join(
        f'<th style="background:#c4cfe0;font-size:10px;font-weight:bold;'
        f'padding:3px 4px;border:1px solid #bbb;min-width:26px;text-align:center">{w}</th>'
        for w in weeks
    )

    rows_html = ""
    for plan in plans:
        plan_rows = plan.get("rows", [])
        rc  = len(plan_rows)
        wst = {ws["week"]: ws["value"] for ws in plan.get("week_statuses",[])}

        for ri, row in enumerate(plan_rows):
            risk      = row.get("risk_level","")
            rbg, rfg  = RISK_COLORS.get(risk,("#f0f0f0","#111"))
            bg        = "#fff" if ri%2==0 else "#f8f8f8"
            cpk_bg    = _cpk_bg(row.get("cpk"))
            c = lambda v,ex="": _td(v, f"background:{bg};{ex}")

            fixed = (c(row.get("label","")) + c(row.get("axis","")) +
                     c(_fmt(row.get("lse"))) + c(_fmt(row.get("lie"))) +
                     c(row.get("symbol","")) + c(_fmt(row.get("xmed"))) +
                     c(_fmt(row.get("cp"))) +
                     f'<td style="padding:3px 4px;border:1px solid #ccc;text-align:center;'
                     f'font-size:10px;font-weight:bold;background:{cpk_bg};color:white">{_fmt(row.get("cpk"))}</td>' +
                     c(_fmt(row.get("range"))))

            if ri == 0:
                wk_cells = "".join(
                    f'<td rowspan="{rc}" style="padding:2px;border:1px solid #ccc;'
                    f'text-align:center;font-size:10px;font-weight:bold;'
                    f'background:{WEEK_COLORS.get(wst.get(w,""),"transparent")};min-width:26px">'
                    f'{wst.get(w,"")}</td>' for w in weeks
                )
                resp = plan.get("responsible_name","")
                dept = plan.get("responsible_dept","")
                if dept: resp += f" ({dept})"

                rows_html += f"""<tr>
  <td rowspan="{rc}" style="padding:3px 4px;border:1px solid #ccc;text-align:center;
    vertical-align:top;font-size:10px;font-weight:bold">{str(plan.get('seq','')).zfill(3)}</td>
  {fixed}
  <td rowspan="{rc}" style="padding:3px 2px;border:1px solid #ccc;text-align:center;
    width:22px;background:{rbg};color:{rfg}">
    <span style="display:inline-block;transform:rotate(90deg);white-space:nowrap;font-size:8px;font-weight:bold">{risk}</span>
  </td>
  <td rowspan="{rc}" style="padding:3px 2px;border:1px solid #ccc;text-align:center;width:22px">
    <span style="display:inline-block;transform:rotate(90deg);white-space:nowrap;font-size:8px">{plan.get('analysis','')}</span>
  </td>
  <td rowspan="{rc}" style="padding:4px 6px;border:1px solid #ccc;font-size:9.5px;max-width:180px;white-space:normal;line-height:1.3">{plan.get('action_text','')}</td>
  <td rowspan="{rc}" style="padding:3px 5px;border:1px solid #ccc;font-size:9.5px">{resp}</td>
  <td rowspan="{rc}" style="padding:3px 4px;border:1px solid #ccc;font-size:9px;white-space:nowrap">{plan.get('deadline_date','') or ''}</td>
  {wk_cells}
  <td rowspan="{rc}" style="padding:3px 5px;border:1px solid #ccc;font-size:9.5px">{plan.get('status','')}</td>
</tr>"""
            else:
                rows_html += f"<tr>{fixed}</tr>"

    fixed_ths = "".join(_th(h) for h in ["SEQ","LABEL","AXIS","LSE","LIE","SYMBOL","XMED","CP","CPK","RANGE"])
    rot_th = lambda t: (f'<th style="background:#e8ecf0;font-size:9px;font-weight:bold;'
                        f'padding:3px 2px;border:1px solid #bbb;width:22px;text-align:center">'
                        f'<span style="display:inline-block;transform:rotate(90deg);'
                        f'white-space:nowrap;font-size:8px">{t}</span></th>')

    return f"""<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>*{{box-sizing:border-box;margin:0;padding:0}}
body{{font-family:Arial,Helvetica,sans-serif;background:#fff;padding:12px}}
table{{border-collapse:collapse;width:100%;font-size:10px}}</style>
</head><body>
<table id="action-plan-table">
<thead>
<tr>
  <th colspan="15" style="background:#d0d8e4;font-size:11px;font-weight:bold;
    padding:5px 8px;border:1px solid #aaa;text-align:center">{piece} | ACTION PLAN</th>
  <th colspan="{len(weeks)+1}" style="background:#c4cfe0;font-size:11px;font-weight:bold;
    padding:5px 8px;border:1px solid #aaa;text-align:center">SEMANA</th>
</tr>
<tr>
  {fixed_ths}
  {rot_th("RISK-Desviation")}{rot_th("RISK-Root Cause")}
  {_th("ACTION PLAN")}{_th("RESPONSIBLE")}{_th("DATA")}
  {week_ths}
  {_th("STATUS")}
</tr>
</thead>
<tbody>
{rows_html or '<tr><td colspan="100" style="text-align:center;padding:20px;color:#888">Nenhum plano criado.</td></tr>'}
</tbody>
</table>
<p style="text-align:center;font-size:10px;color:#555;margin-top:8px">
  X — Ação programada &nbsp;|&nbsp; NOK — Ação não efetiva &nbsp;|&nbsp; R — Ação reprogramada
</p>
</body></html>"""


def _run_playwright_sync(html_content: str) -> bytes:
    if os.name == "nt":
        loop = asyncio.ProactorEventLoop()
    else:
        loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)

    async def _capture():
        from playwright.async_api import async_playwright
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True,
                args=["--no-sandbox","--disable-setuid-sandbox"])
            page = await browser.new_page(viewport={"width":1600,"height":900}, device_scale_factor=4)
            try:
                await page.set_content(html_content, wait_until="load")
                await page.wait_for_timeout(300)
                el   = await page.query_selector("#action-plan-table")
                bbox = await el.bounding_box()
                await page.set_viewport_size({
                    "width":  max(1600, int(bbox["width"])+40),
                    "height": max(900,  int(bbox["height"])+200),
                })
                return await el.screenshot(type="png", scale="device")
            finally:
                await browser.close()

    try:    return loop.run_until_complete(_capture())
    finally: loop.close()


@router.post("/job/{job_id}/screenshot-action-plan")
async def screenshot_action_plan(job_id: str, body: ScreenshotRequest):
    job_path = Path(BASE_PATH) / job_id
    if not job_path.exists():
        raise HTTPException(404, "JobID não encontrado")

    try: import playwright  # noqa
    except ImportError:
        raise HTTPException(500,"pip install playwright && python -m playwright install chromium")

    try: from PIL import Image
    except ImportError:
        raise HTTPException(500,"pip install Pillow")

    plans = _load_plans(body.group, body.piece)
    weeks = _get_weeks(plans)
    html  = _build_html(body.group, body.piece, plans, weeks)

    loop = asyncio.get_event_loop()
    try:
        screenshot_bytes = await loop.run_in_executor(_executor, _run_playwright_sync, html)
    except Exception as e:
        raise HTTPException(500, f"Erro ao capturar screenshot: {e}")

    safe_piece = Path(body.piece).name
    safe_group = Path(body.group).name
    target_dir = Path(BASE_PATH) / job_id / safe_group / safe_piece / "ActionPlan"
    target_dir.mkdir(parents=True, exist_ok=True)

    from PIL import Image as PILImage
    img   = PILImage.open(io.BytesIO(screenshot_bytes))
    ratio = A4_W_PX / img.width
    new_w = A4_W_PX
    new_h = int(img.height * ratio)
    img_r = img.resize((new_w, new_h), PILImage.LANCZOS)
    total = max(1, -(-new_h // A4_H_PX))
    results = []

    for pi in range(total):
        y0  = pi * A4_H_PX
        y1  = min(y0 + A4_H_PX, new_h)
        slab = PILImage.new("RGB",(new_w,A4_H_PX),(255,255,255))
        slab.paste(img_r.crop((0,y0,new_w,y1)),(0,0))
        fname = f"AP_{safe_piece}.png" if total==1 else f"AP_{safe_piece}_page{pi+1}.png"
        buf   = io.BytesIO()
        slab.save(buf,"PNG")
        (target_dir/fname).write_bytes(buf.getvalue())
        results.append({"page":pi+1,"filename":fname,
            "static_url":f"/static/jobs/{job_id}/{safe_group}/{safe_piece}/ActionPlan/{fname}"})

    return {"status":"ok","job_id":job_id,"piece":safe_piece,
            "total_pages":len(results),"files":results}