"""
action_plan_router.py
Prefix: /pieces 

Endpoints:
  GET  /pieces/{group}/{piece}/action-plans          → lista alls os plan
  POST /pieces/{group}/{piece}/action-plans          → create new plan
  GET  /pieces/{group}/{piece}/action-plans/{seq}    → detalhe de um plan
  PUT  /pieces/{group}/{piece}/action-plans/{seq}    → edit plan existente
  DELETE /pieces/{group}/{piece}/action-plans/{seq}  → remove plan
"""

from fastapi import APIRouter, HTTPException
from pathlib import Path
from typing import Optional, List
from pydantic import BaseModel
import json
import re
from datetime import datetime

router = APIRouter(tags=["action-plan"])

BASE_DATA = Path(__file__).resolve().parent.parent / "data" / "groups"


#helpers

def _piece_dir(group: str, piece: str) -> Path:
    path = BASE_DATA / group / "pieces" / piece
    if not path.exists():
        raise HTTPException(404, f"Peça '{piece}' não encontrada no grupo '{group}'")
    return path

def _ap_file(group: str, piece: str) -> Path:
    return _piece_dir(group, piece) / "action_plan.json"

def _latest_stats_file(group: str, piece: str) -> Path:
    analysis = _piece_dir(group, piece) / "analysis"
    files = sorted(analysis.glob("*_stats.json"))
    if not files:
        raise HTTPException(404, "Nenhum stats.json encontrado")
    return files[-1]

def _safe_float(v):
    try: return float(v)
    except: return None

def _load_plans(group: str, piece: str) -> list:
    f = _ap_file(group, piece)
    if not f.exists():
        return []
    with open(f, encoding="utf-8") as fp:
        return json.load(fp)

def _save_plans(group: str, piece: str, plans: list):
    f = _ap_file(group, piece)
    f.parent.mkdir(parents=True, exist_ok=True)
    with open(f, "w", encoding="utf-8") as fp:
        json.dump(plans, fp, ensure_ascii=False, indent=2)


#schemas

class WeekStatus(BaseModel):
    week: str           #"05", "06", ...
    value: str = ""     #"X", "NOK", "R", ""

class ActionPlanCreate(BaseModel):
    #pontos selecionados — lista de "NOMEPONTO_EIXO"
    points:        List[str]
    #tipo da ação
    action_type:   str = "Não definida"  # "X", "R", "NOK", "Não definida"
    #texto da ação de execução
    action_text:   str = ""
    #responsável
    responsible_name: str = ""
    responsible_dept: str = ""
    #prazo
    deadline_date: Optional[str] = None   #"DD/MM/YYYY"
    deadline_year: Optional[str] = None
    deadline_week: Optional[str] = None
    #status geral
    status:        str = ""
    #análise dropdown parts
    analysis:      str = ""
    #semanas de acompanhamento
    week_statuses: List[WeekStatus] = []

class ActionPlanUpdate(ActionPlanCreate):
    pass


#ENDPOINT 1 — pontos disponíveis para o modal
@router.get("/pieces/{group}/{piece}/action-plan-points")
def get_action_plan_points(group: str, piece: str):
    """
    Retorna pontos com stats completos para popular o modal.
    Cada item: { id, label, axis, cp, cpk, xmed, range, lse, lie, symbol, tolerance }
    """
    stats_file = _latest_stats_file(group, piece)
    with open(stats_file, encoding="utf-8") as f:
        data = json.load(f)

    points = []
    for ch in data.get("characteristics", []):
        nome  = ch.get("nome_ponto", "")
        eixo  = ch.get("eixo", "")
        if not nome or not eixo:
            continue

        tol_p = _safe_float(ch.get("tol_plus"))
        tol_m = _safe_float(ch.get("tol_minus"))

        points.append({
            "id":        f"{nome}_{eixo}",
            "label":     nome,
            "axis":      eixo,
            "cp":        _safe_float(ch.get("cp")),
            "cpk":       _safe_float(ch.get("cpk")),
            "xmed":      _safe_float(ch.get("mean")),
            "range":     _safe_float(ch.get("range")),
            "lse":       tol_p,
            "lie":       tol_m,
            "symbol":    ch.get("tipo_geometrico", ""),
            "tolerance": f"{tol_m}|+{tol_p}" if tol_m and tol_p else "",
            "cp_color":  ch.get("cp_color"),
            "cpk_color": ch.get("cpk_color"),
        })

    return {"group": group, "piece": piece, "points": points}


#ENDPOINT 2 — listar plano

@router.get("/pieces/{group}/{piece}/action-plans")
def list_action_plans(group: str, piece: str):
    plans = _load_plans(group, piece)
    return {"group": group, "piece": piece, "plans": plans, "total": len(plans)}


#ENDPOINT 3 — criar plan

@router.post("/pieces/{group}/{piece}/action-plans", status_code=201)
def create_action_plan(group: str, piece: str, body: ActionPlanCreate):
    plans = _load_plans(group, piece)

    # SEQ auto-incremento
    seq = max((p["seq"] for p in plans), default=0) + 1

    # Busca stats dos pontos selecionados para preencher a tabela
    stats_file = _latest_stats_file(group, piece)
    with open(stats_file, encoding="utf-8") as f:
        stats_data = json.load(f)

    chars_map = {}
    for ch in stats_data.get("characteristics", []):
        nome = ch.get("nome_ponto", "")
        eixo = ch.get("eixo", "")
        chars_map[f"{nome}_{eixo}"] = ch

    rows = []
    for pt_id in body.points:
        ch = chars_map.get(pt_id, {})
        tol_p = _safe_float(ch.get("tol_plus"))
        tol_m = _safe_float(ch.get("tol_minus"))
        rows.append({
            "point_id": pt_id,
            "label":    ch.get("nome_ponto", pt_id),
            "axis":     ch.get("eixo", ""),
            "lse":      tol_p,
            "lie":      tol_m,
            "symbol":   ch.get("tipo_geometrico", ""),
            "xmed":     _safe_float(ch.get("mean")),
            "cp":       _safe_float(ch.get("cp")),
            "cpk":      _safe_float(ch.get("cpk")),
            "range":    _safe_float(ch.get("range")),
        })

    plan = {
        "seq":              seq,
        "rows":             rows,
        "action_type":      body.action_type,
        "action_text":      body.action_text,
        "responsible_name": body.responsible_name,
        "responsible_dept": body.responsible_dept,
        "deadline_date":    body.deadline_date,
        "deadline_year":    body.deadline_year,
        "deadline_week":    body.deadline_week,
        "status":           body.status,
        "analysis":         body.analysis,
        "week_statuses":    [ws.model_dump() for ws in body.week_statuses],
        "created_at":       datetime.now().isoformat(),
        "updated_at":       datetime.now().isoformat(),
    }

    plans.append(plan)
    _save_plans(group, piece, plans)

    return {"ok": True, "plan": plan}


#ENDPOINT 4 — detalhe de um plano

@router.get("/pieces/{group}/{piece}/action-plans/{seq}")
def get_action_plan(group: str, piece: str, seq: int):
    plans = _load_plans(group, piece)
    plan  = next((p for p in plans if p["seq"] == seq), None)
    if not plan:
        raise HTTPException(404, f"Plano SEQ {seq} não encontrado")
    return plan


#ENDPOINT 5 — editar plano

@router.put("/pieces/{group}/{piece}/action-plans/{seq}")
def update_action_plan(group: str, piece: str, seq: int, body: ActionPlanUpdate):
    plans = _load_plans(group, piece)
    idx   = next((i for i, p in enumerate(plans) if p["seq"] == seq), None)
    if idx is None:
        raise HTTPException(404, f"Plano SEQ {seq} não encontrado")

    # Rebusca stats para atualizar rows se pontos mudaram
    stats_file = _latest_stats_file(group, piece)
    with open(stats_file, encoding="utf-8") as f:
        stats_data = json.load(f)

    chars_map = {}
    for ch in stats_data.get("characteristics", []):
        nome = ch.get("nome_ponto", "")
        eixo = ch.get("eixo", "")
        chars_map[f"{nome}_{eixo}"] = ch

    rows = []
    for pt_id in body.points:
        ch = chars_map.get(pt_id, {})
        tol_p = _safe_float(ch.get("tol_plus"))
        tol_m = _safe_float(ch.get("tol_minus"))
        rows.append({
            "point_id": pt_id,
            "label":    ch.get("nome_ponto", pt_id),
            "axis":     ch.get("eixo", ""),
            "lse":      tol_p,
            "lie":      tol_m,
            "symbol":   ch.get("tipo_geometrico", ""),
            "xmed":     _safe_float(ch.get("mean")),
            "cp":       _safe_float(ch.get("cp")),
            "cpk":      _safe_float(ch.get("cpk")),
            "range":    _safe_float(ch.get("range")),
        })

    plans[idx] = {
        **plans[idx],
        "rows":             rows,
        "action_type":      body.action_type,
        "action_text":      body.action_text,
        "responsible_name": body.responsible_name,
        "responsible_dept": body.responsible_dept,
        "deadline_date":    body.deadline_date,
        "deadline_year":    body.deadline_year,
        "deadline_week":    body.deadline_week,
        "status":           body.status,
        "analysis":         body.analysis,
        "week_statuses":    [ws.model_dump() for ws in body.week_statuses],
        "updated_at":       datetime.now().isoformat(),
    }

    _save_plans(group, piece, plans)
    return {"ok": True, "plan": plans[idx]}


#ENDPOINT 6 — deletar plano

@router.delete("/pieces/{group}/{piece}/action-plans/{seq}")
def delete_action_plan(group: str, piece: str, seq: int):
    plans = _load_plans(group, piece)
    new_plans = [p for p in plans if p["seq"] != seq]
    if len(new_plans) == len(plans):
        raise HTTPException(404, f"Plano SEQ {seq} não encontrado")
    _save_plans(group, piece, new_plans)
    return {"ok": True, "deleted_seq": seq}  
 
  