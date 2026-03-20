import json
import os
from datetime import datetime
from pathlib import Path
 
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any
 
router = APIRouter(prefix="/reportbuilder", tags=["reportbuilder"])
 
# Mesma raiz usada pelo resto do projeto 
BASE = Path(os.path.dirname(__file__)).parent / "data" / "jobs"
 
 
# ── helper ────────────────────────────────────────────────────────────────────
 
def _rb_dir(group: str, conjunto: str) -> Path:
    """Retorna (e cria se necessário) a pasta reportbuilder do conjunto."""
    path = BASE / group / conjunto / "reportbuilder"
    path.mkdir(parents=True, exist_ok=True)
    return path
 
 
# ── schemas ───────────────────────────────────────────────────────────────────
 
class ReportState(BaseModel):
    """Payload enviado pelo frontend — mesmo padrão do capability-layout."""
    pages: list[Any]
    pageOrientation: str = "landscape"
    reportName: str = "Relatório sem título"
 
 
# ── auto-save (estado atual do canvas) ───────────────────────────────────────
 
@router.get("/{group}/{conjunto}/layout")
def load_layout(group: str, conjunto: str):
    """
    Carrega o estado atual do canvas.
    Retorna {} se nada foi salvo ainda (frontend trata como canvas vazio).
    """
    target = _rb_dir(group, conjunto) / "_autosave.json"
    if not target.exists():
        return {}
    return json.loads(target.read_text(encoding="utf-8"))
 
 
@router.post("/{group}/{conjunto}/layout")
def save_layout(group: str, conjunto: str, state: ReportState):
    """
    Persiste o estado atual do canvas (auto-save, sempre sobrescreve).
    Chamado com debounce pelo frontend a cada mudança.
    """
    target = _rb_dir(group, conjunto) / "_autosave.json"
    payload = {
        **state.model_dump(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    target.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return {"ok": True}
 
 
# ── snapshots nomeados ────────────────────────────────────────────────────────
 
@router.get("/{group}/{conjunto}/list")
def list_reports(group: str, conjunto: str):
    """Lista todos os snapshots nomeados (exclui _autosave)."""
    rb = _rb_dir(group, conjunto)
    reports = []
 
    for f in sorted(rb.glob("*.json"), key=lambda p: p.stat().st_mtime, reverse=True):
        if f.stem == "_autosave":
            continue
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            reports.append({
                "name": f.stem,
                "reportName": data.get("reportName", f.stem),
                "updated_at": data.get("updated_at", ""),
                "page_count": len(data.get("pages", [])),
                "pageOrientation": data.get("pageOrientation", "landscape"),
            })
        except Exception:
            continue
 
    return reports
 
 
@router.post("/{group}/{conjunto}/list/{name}")
def save_named_report(group: str, conjunto: str, name: str, state: ReportState):
    """Salva um snapshot com nome escolhido pelo usuário."""
    safe = "".join(c for c in name if c.isalnum() or c in "-_ ").strip()
    if not safe:
        raise HTTPException(status_code=400, detail="Nome inválido.")
 
    target = _rb_dir(group, conjunto) / f"{safe}.json"
    payload = {
        **state.model_dump(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    target.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return {"ok": True, "name": safe}
 
 
@router.get("/{group}/{conjunto}/list/{name}")
def load_named_report(group: str, conjunto: str, name: str):
    """Carrega um snapshot nomeado."""
    target = _rb_dir(group, conjunto) / f"{name}.json"
    if not target.exists():
        raise HTTPException(status_code=404, detail=f"Report '{name}' não encontrado.")
    return json.loads(target.read_text(encoding="utf-8"))
 
 
@router.delete("/{group}/{conjunto}/list/{name}")
def delete_named_report(group: str, conjunto: str, name: str):
    """Deleta um snapshot nomeado."""
    target = _rb_dir(group, conjunto) / f"{name}.json"
    if not target.exists():
        raise HTTPException(status_code=404, detail=f"Report '{name}' não encontrado.")
    target.unlink()
    return {"ok": True, "deleted": name}
   