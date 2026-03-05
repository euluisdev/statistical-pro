"""
capability_router.py
Prefix: /pieces  (já usado pelo router existente — adicione aqui ou num arquivo separado)

Novos endpoints:
  GET  /pieces/{group}/{piece}/capability-points   → pontos com stats para o modal
  GET  /pieces/{group}/{piece}/capability-layout   → carrega layout salvo
  POST /pieces/{group}/{piece}/capability-layout   → salva layout
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from pathlib import Path
from typing import Any
import json
import csv

router = APIRouter(tags=["capability"])

BASE_DATA = Path(__file__).resolve().parent.parent / "data" / "groups"


# ── helpers (mesmos do router existente) ──────────────────────────────────────

def _piece_analysis_dir(group: str, piece: str) -> Path:
    path = BASE_DATA / group / "pieces" / piece / "analysis"
    if not path.exists():
        raise HTTPException(404, f"Análise não encontrada: grupo='{group}', peça='{piece}'")
    return path


def _latest_stats_file(analysis_dir: Path) -> Path:
    files = sorted(analysis_dir.glob("*_stats.json"))
    if not files:
        raise HTTPException(404, "Nenhum stats.json encontrado.")
    return files[-1]


def _safe_float(v):
    try:    return float(v)
    except: return None


# ── ENDPOINT 1 ─ Pontos com stats completos para o modal de capability ────────
#
# Difere do /points existente pois retorna CP, CPK, XMED, RANGE, TOLERANCE
# por eixo — necessários para preencher as tabelinhas no canvas.
#
# GET /pieces/{group}/{piece}/capability-points
# Resposta:
# {
#   "points": [
#     {
#       "id": "CÍRCULO_7",
#       "tipo": "CÍRCULO",
#       "localizacao": "N/D",
#       "axes": [
#         { "axis": "X", "cp": 1.43, "cpk": 0.96, "xmed": -0.17, "range": 0.13,
#           "tol_plus": 1.0, "tol_minus": -1.0, "tolerance": "-1,0|+1,0" }
#       ]
#     }
#   ]
# }

@router.get("/pieces/{group}/{piece}/capability-points")
def get_capability_points(group: str, piece: str):
    analysis_dir = _piece_analysis_dir(group, piece)
    stats_file   = _latest_stats_file(analysis_dir)

    with open(stats_file, encoding="utf-8") as f:
        stats_data = json.load(f)

    # Agrupa características por nome_ponto
    points_map: dict[str, dict] = {}

    for ch in stats_data.get("characteristics", []):
        nome = ch.get("nome_ponto", "")
        if not nome:
            # fallback: extrai do campo 'caracteristica' (ex: "CÍRCULO_7_X" → "CÍRCULO_7")
            car = ch.get("caracteristica", "")
            eixo_suffix = f"_{ch.get('eixo', '')}"
            nome = car.removesuffix(eixo_suffix) if car.endswith(eixo_suffix) else car

        eixo    = ch.get("eixo", "")
        tipo    = ch.get("tipo_geometrico", "")
        loc     = ch.get("localizacao", "N/D")
        tol_p   = _safe_float(ch.get("tol_plus"))
        tol_m   = _safe_float(ch.get("tol_minus"))

        # Format tolerance string: "-1,0|+1,0"
        if tol_m is not None and tol_p is not None:
            tolerance = f"{tol_m:.2f}|+{tol_p:.2f}".replace(".", ",")
        else:
            tolerance = None

        axis_entry = {
            "axis":      eixo,
            "cp":        _safe_float(ch.get("cp")),
            "cpk":       _safe_float(ch.get("cpk")),
            "xmed":      _safe_float(ch.get("mean")),        # desvio médio
            "range":     _safe_float(ch.get("range")),
            "tol_plus":  tol_p,
            "tol_minus": tol_m,
            "tolerance": tolerance,
            "nominal":   _safe_float(ch.get("nominal")),
            "cp_color":  ch.get("cp_color"),
            "cpk_color": ch.get("cpk_color"),
        }

        if nome not in points_map:
            points_map[nome] = {
                "id":          nome,
                "tipo":        tipo,
                "localizacao": loc,
                "axes":        [],
            }

        # Evita duplicar o mesmo eixo
        if not any(a["axis"] == eixo for a in points_map[nome]["axes"]):
            points_map[nome]["axes"].append(axis_entry)

    return {"points": list(points_map.values())}


# ── ENDPOINT 2 ─ Carrega layout salvo ────────────────────────────────────────
#
# GET /pieces/{group}/{piece}/capability-layout
# Retorna o JSON de layout salvo, ou 404 se não existir ainda.

@router.get("/pieces/{group}/{piece}/capability-layout")
def get_capability_layout(group: str, piece: str):
    layout_file = _layout_path(group, piece)
    if not layout_file.exists():
        raise HTTPException(404, "Nenhum layout salvo para esta peça.")
    with open(layout_file, encoding="utf-8") as f:
        return json.load(f)


# ── ENDPOINT 3 ─ Salva layout ─────────────────────────────────────────────────
#
# POST /pieces/{group}/{piece}/capability-layout
# Body: { pages: [...], locked: bool }

from pydantic import BaseModel

class LayoutPayload(BaseModel):
    pages:  list[Any]
    locked: bool = False


@router.post("/pieces/{group}/{piece}/capability-layout")
def save_capability_layout(group: str, piece: str, body: LayoutPayload):
    layout_file = _layout_path(group, piece)
    layout_file.parent.mkdir(parents=True, exist_ok=True)

    payload = {"pages": body.pages, "locked": body.locked}

    with open(layout_file, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    return {"ok": True, "path": str(layout_file)}


# ── helper: caminho do arquivo de layout ──────────────────────────────────────
def _layout_path(group: str, piece: str) -> Path:
    """
    Salva o layout junto com os dados da peça:
    data/groups/{group}/pieces/{piece}/capability_layout.json
    """
    return BASE_DATA / group / "pieces" / piece / "capability_layout.json"