"""
Router: reportbuilder
Salva o estado do canvas no nível do CONJUNTO (group), não da peça.

Estrutura resultante:
  app/data/jobs/{group}/reportbuilder/
      _autosave.json
      MinhaVersao.json

Rotas:
  GET  /reportbuilder/{group}/layout        → carrega auto-save
  POST /reportbuilder/{group}/layout        → salva auto-save
  GET  /reportbuilder/{group}/list          → lista snapshots nomeados
  POST /reportbuilder/{group}/list/{name}   → salva snapshot nomeado
  GET  /reportbuilder/{group}/list/{name}   → carrega snapshot nomeado
  DEL  /reportbuilder/{group}/list/{name}   → deleta snapshot nomeado
"""

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

def _rb_dir(group: str) -> Path:
    """
    Retorna (e cria se necessário) a pasta reportbuilder do group/conjunto.
    Salva em:  data/jobs/{group}/reportbuilder/
    NÃO inclui a peça — o relatório pertence ao conjunto inteiro.
    """
    path = BASE / group / "reportbuilder"
    path.mkdir(parents=True, exist_ok=True)
    return path


# ── schemas ───────────────────────────────────────────────────────────────────

class ReportState(BaseModel):
    pages: list[Any]
    pageOrientation: str = "landscape"
    reportName: str = "Relatório sem título"


# ── auto-save ─────────────────────────────────────────────────────────────────

@router.get("/{group}/layout")
def load_layout(group: str):
    """Carrega o auto-save do conjunto. Retorna {} se ainda não existe."""
    target = _rb_dir(group) / "_autosave.json"
    if not target.exists():
        return {}
    return json.loads(target.read_text(encoding="utf-8"))


@router.post("/{group}/layout")
def save_layout(group: str, state: ReportState):
    """Persiste o estado atual do canvas (auto-save, sempre sobrescreve)."""
    target = _rb_dir(group) / "_autosave.json"
    payload = {
        **state.model_dump(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    target.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return {"ok": True}


# ── snapshots nomeados ────────────────────────────────────────────────────────

@router.get("/{group}/list")
def list_reports(group: str):
    """Lista todos os snapshots nomeados (exclui _autosave)."""
    rb = _rb_dir(group)
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


@router.post("/{group}/list/{name}")
def save_named_report(group: str, name: str, state: ReportState):
    """Salva um snapshot com nome escolhido pelo usuário."""
    safe = "".join(c for c in name if c.isalnum() or c in "-_ ").strip()
    if not safe:
        raise HTTPException(status_code=400, detail="Nome inválido.")

    target = _rb_dir(group) / f"{safe}.json"
    payload = {
        **state.model_dump(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    target.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return {"ok": True, "name": safe}


@router.get("/{group}/list/{name}")
def load_named_report(group: str, name: str):
    """Carrega um snapshot nomeado."""
    target = _rb_dir(group) / f"{name}.json"
    if not target.exists():
        raise HTTPException(status_code=404, detail=f"Report '{name}' não encontrado.")
    return json.loads(target.read_text(encoding="utf-8"))


@router.delete("/{group}/list/{name}")
def delete_named_report(group: str, name: str):
    """Deleta um snapshot nomeado."""
    target = _rb_dir(group) / f"{name}.json"
    if not target.exists():
        raise HTTPException(status_code=404, detail=f"Report '{name}' não encontrado.")
    target.unlink()
    return {"ok": True, "deleted": name}  
 
  
   