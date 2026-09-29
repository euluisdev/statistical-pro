"""
Exportação do PDF final do Report Builder no backend.

Fluxo:
  1. Abre UMA vez a rota de impressão do Next (/print/reportbuilder/{group}/{piece})
  2. Para cada página do relatório: troca a página, espera imagens, gera 1 PDF (vetorial)
  3. Junta todos os PDFs em um só com pypdf
  4. O frontend acompanha o progresso por polling e baixa o arquivo no final

Dependências:  pip install pypdf   (playwright + chromium você já tem)
"""

import asyncio
import json
import os
import shutil
import time
import uuid
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

# from config import BASE_PATH      
BASE_PATH = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "data", "jobs"
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

router = APIRouter()

# 1 worker: exporta um relatório por vez (Chromium consome bastante memória)
_executor = ThreadPoolExecutor(max_workers=1)

# registro em memória dos exports em andamento/concluídos
EXPORTS: dict[str, dict] = {}


class ExportRequest(BaseModel):
    job_id: str


# JS executado no navegador: espera fontes, imagens e 2 frames de render
_WAIT_ASSETS_JS = """
async () => {
  await document.fonts.ready;
  const imgs = Array.from(document.images);
  await Promise.all(imgs.map(img =>
    img.complete
      ? (img.decode ? img.decode().catch(() => {}) : Promise.resolve())
      : new Promise(r => { img.onload = img.onerror = r; })
  ));
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
}
"""


async def _render_pdf(export_id: str, job_id: str, group: str, piece: str, out_dir: Path) -> Path:
    from playwright.async_api import async_playwright
    from pypdf import PdfWriter

    state = EXPORTS[export_id]
    tmp_dir = out_dir / f"_tmp_{export_id}"
    tmp_dir.mkdir(parents=True, exist_ok=True)

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True,
                args=["--disable-dev-shm-usage"],
            )
            context = await browser.new_context(
                viewport={"width": 1200, "height": 900},
                device_scale_factor=1,
            )

            # o front lê o job atual do localStorage; no Chromium "limpo" ele não existe
            await context.add_init_script(
                f"localStorage.setItem('current_jobid', {json.dumps(job_id)});"
            )

            page = await context.new_page()
            url = f"{FRONTEND_URL}/print/reportbuilder/{group}/{piece}"
            await page.goto(url, wait_until="networkidle", timeout=90_000)

            # espera o layout carregar do backend e o canvas montar
            await page.wait_for_selector('#print-canvas[data-ready="true"]', timeout=60_000)

            total = await page.evaluate("window.__pageCount")
            orientation = await page.evaluate("window.__orientation")
            state["total"] = total

            if orientation == "landscape":
                width, height = "297mm", "210mm"
            else:
                width, height = "210mm", "297mm"

            for i in range(total):
                # troca a página no store e espera o canvas refletir o índice
                await page.evaluate("(i) => window.__setPage(i)", i)
                await page.wait_for_function(
                    "(i) => document.querySelector('#print-canvas')?.dataset.page === String(i)",
                    arg=i,
                    timeout=30_000,
                )
                await page.evaluate(_WAIT_ASSETS_JS)
                # folga para SVGs/gráficos que pintam depois do onload
                await page.wait_for_timeout(250)

                pdf_bytes = await page.pdf(
                    width=width,
                    height=height,
                    print_background=True,
                    margin={"top": "0", "right": "0", "bottom": "0", "left": "0"},
                    page_ranges="1",  # garante 1 página mesmo com arredondamento de mm/px
                )
                (tmp_dir / f"page_{i:04d}.pdf").write_bytes(pdf_bytes)
                state["done"] = i + 1

            await browser.close()

        # ── junta tudo ──
        state["status"] = "merging"
        writer = PdfWriter()
        for f in sorted(tmp_dir.glob("page_*.pdf")):
            writer.append(str(f))
        try:
            writer.compress_identical_objects(remove_identicals=True, remove_orphans=True)
        except Exception:
            pass  # versões antigas do pypdf não têm esse método

        final_path = out_dir / f"relatorio_{piece}_{int(time.time())}.pdf"
        with open(final_path, "wb") as fh:
            writer.write(fh)
        return final_path

    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


def _export_worker(export_id: str, job_id: str, group: str, piece: str, out_dir: Path):
    """Roda em thread própria com seu próprio event loop (padrão que já funciona no Windows)."""
    state = EXPORTS[export_id]
    loop = asyncio.ProactorEventLoop() if os.name == "nt" else asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        final_path = loop.run_until_complete(_render_pdf(export_id, job_id, group, piece, out_dir))
        state["file"] = str(final_path)
        state["status"] = "done"
    except Exception as e:
        state["status"] = "error"
        state["error"] = str(e)
    finally:
        loop.close()


@router.post("/reportbuilder/{group}/{piece}/export-pdf")
async def start_export(group: str, piece: str, body: ExportRequest):
    job_path = Path(BASE_PATH) / body.job_id
    if not job_path.exists():
        raise HTTPException(404, "JobID não encontrado")

    safe_piece = Path(piece).name
    safe_group = Path(group).name
    out_dir = job_path / safe_group / safe_piece / "Reports"
    out_dir.mkdir(parents=True, exist_ok=True)

    export_id = uuid.uuid4().hex[:12]
    EXPORTS[export_id] = {
        "status": "running",
        "done": 0,
        "total": 0,
        "file": None,
        "error": None,
        "piece": safe_piece,
    }
    _executor.submit(_export_worker, export_id, body.job_id, safe_group, safe_piece, out_dir)
    return {"export_id": export_id}


@router.get("/reportbuilder/export-pdf/{export_id}/status")
async def export_status(export_id: str):
    state = EXPORTS.get(export_id)
    if not state:
        raise HTTPException(404, "Export não encontrado")
    return {k: state[k] for k in ("status", "done", "total", "error")}


@router.get("/reportbuilder/export-pdf/{export_id}/download")
async def export_download(export_id: str):
    state = EXPORTS.get(export_id)
    if not state or state["status"] != "done" or not state["file"]:
        raise HTTPException(404, "PDF ainda não está pronto")
    path = Path(state["file"])
    if not path.exists():
        raise HTTPException(404, "Arquivo não encontrado")
    return FileResponse(path, media_type="application/pdf", filename=path.name)  

  