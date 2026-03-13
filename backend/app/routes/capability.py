from fastapi import APIRouter, HTTPException
from pathlib import Path
from typing import Any, Optional
import json
 
router = APIRouter(tags=["capability"])
 
BASE_DATA = Path(__file__).resolve().parent.parent / "data" / "groups"
 
#helpers
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
 
def _layout_path(group: str, piece: str) -> Path:
    return BASE_DATA / group / "pieces" / piece / "capability_layout.json"
 
#ENDPOINT 1 — Pontos com stats completos
@router.get("/pieces/{group}/{piece}/capability-points")
def get_capability_points(group: str, piece: str):
    analysis_dir = _piece_analysis_dir(group, piece)
    stats_file   = _latest_stats_file(analysis_dir)
 
    with open(stats_file, encoding="utf-8") as f:
        stats_data = json.load(f)
 
    points_map: dict[str, dict] = {}
 
    for ch in stats_data.get("characteristics", []):
        nome = ch.get("nome_ponto", "")
        if not nome:
            car  = ch.get("caracteristica", "")
            eixo = ch.get("eixo", "")
            nome = car.removesuffix(f"_{eixo}") if car.endswith(f"_{eixo}") else car
 
        eixo  = ch.get("eixo", "")
        tipo  = ch.get("tipo_geometrico", "")
        loc   = ch.get("localizacao", "N/D")
        tol_p = _safe_float(ch.get("tol_plus"))
        tol_m = _safe_float(ch.get("tol_minus"))
 
        tolerance = (
            f"{tol_m:.2f}|+{tol_p:.2f}".replace(".", ",")
            if tol_m is not None and tol_p is not None else None
        )
 
        axis_entry = {
            "axis":      eixo,
            "cp":        _safe_float(ch.get("cp")),
            "cpk":       _safe_float(ch.get("cpk")),
            "xmed":      _safe_float(ch.get("mean")),
            "range":     _safe_float(ch.get("range")),
            "tol_plus":  tol_p,
            "tol_minus": tol_m,
            "tolerance": tolerance,
            "nominal":   _safe_float(ch.get("nominal")),
            "cp_color":  ch.get("cp_color"),
            "cpk_color": ch.get("cpk_color"),
        }
 
        if nome not in points_map:
            points_map[nome] = {"id": nome, "tipo": tipo, "localizacao": loc, "axes": []}
 
        if not any(a["axis"] == eixo for a in points_map[nome]["axes"]):
            points_map[nome]["axes"].append(axis_entry)
 
    return {"points": list(points_map.values())}
 
 
#ENDPOINT 2 — carrega layout salvo
@router.get("/pieces/{group}/{piece}/capability-layout")
def get_capability_layout(group: str, piece: str):
    layout_file = _layout_path(group, piece)
    if not layout_file.exists():
        raise HTTPException(404, "Nenhum layout salvo para esta peça.")
    with open(layout_file, encoding="utf-8") as f:
        return json.load(f)
 
 
#ENDPOINT 3 — Salva layout 
from pydantic import BaseModel
 
class LayoutPayload(BaseModel):
    pages:            list[Any]
    locked:           bool           = False
    modalSelections:  Optional[Any]  = None  #state bruto do modal
    modalNumPages:    Optional[int]  = None #nº de pages configurado no modal
 
 
@router.post("/pieces/{group}/{piece}/capability-layout")
def save_capability_layout(group: str, piece: str, body: LayoutPayload):
    layout_file = _layout_path(group, piece)
    layout_file.parent.mkdir(parents=True, exist_ok=True)
 
    payload = {
        "pages":           body.pages,
        "locked":          body.locked,
        "modalSelections": body.modalSelections,
        "modalNumPages":   body.modalNumPages,
    }
 
    with open(layout_file, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
 
    return {"ok": True, "path": str(layout_file)}  
 
  
   