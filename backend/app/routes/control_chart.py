from fastapi import APIRouter, HTTPException, Query
from pathlib import Path
import json
import csv
from collections import defaultdict
from typing import Optional

router = APIRouter(tags=["pieces"])

# path data base
BASE_DATA = Path(__file__).resolve().parent.parent / "data" / "groups"

# HELPERS
def _piece_analysis_dir(group: str, piece: str) -> Path:
    path = BASE_DATA / group / "pieces" / piece / "analysis"
    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Análise não encontrada para grupo='{group}', peça='{piece}'"
        )
    return path


def _latest_stats_file(analysis_dir: Path) -> Path:
    """Retorna o arquivo *_stats.json mais recente (por nome)."""
    files = sorted(analysis_dir.glob("*_stats.json"))
    if not files:
        raise HTTPException(status_code=404, detail="Nenhum arquivo stats.json encontrado.")
    return files[-1]  # último alfabeticamente = mais recente


def _latest_csv_file(analysis_dir: Path) -> Path:
    """Retorna o arquivo *.csv mais recente (por nome, excluindo stats)."""
    files = sorted(f for f in analysis_dir.glob("*.csv"))
    if not files:
        raise HTTPException(status_code=404, detail="Nenhum arquivo CSV encontrado.")
    return files[-1]


def _stem_to_week(filename: str) -> str:
    """analysis_2025_W43 → '2025-W43'"""
    parts = filename.replace("_stats", "").split("_")
    if len(parts) >= 3:
        return f"{parts[1]}-{parts[2]}"
    return filename

# ENDPOINT 1 – Listar pontos disponíveis (para o modal)

@router.get("/pieces/{group}/{piece}/points")

def get_available_points(group: str, piece: str):
    """
    Retorna todos os pontos e eixos disponíveis para a peça,
    lendo o stats.json mais recente.
    Resposta:
    {
      "group": "CONJUNTO_5980",
      "piece": "53325115",
      "week": "2025-W43",
      "points": [
        { "id": "CÍRCULO_7", "label": "CÍRCULO_7", "tipo": "CÍRCULO", "localizacao": "N/D", "axes": ["X","Z"] },
        ...
      ]
    }
    """
    analysis_dir = _piece_analysis_dir(group, piece)
    stats_file = _latest_stats_file(analysis_dir)
    

    with open(stats_file, encoding="utf-8") as f:
        stats_data = json.load(f)

    characteristics = stats_data.get("characteristics", [])

    # Agrupa eixos por nome_ponto
    points_map: dict[str, dict] = {}
    for ch in characteristics:
        nome = ch.get("nome_ponto", ch.get("caracteristica", ""))
        eixo = ch.get("eixo", "")
        tipo = ch.get("tipo_geometrico", "")
        loc  = ch.get("localizacao", "N/D")
        if nome not in points_map:
            points_map[nome] = {
                "id":          nome,
                "label":       nome,
                "tipo":        tipo,
                "localizacao": loc,
                "axes":        [],
            }
        if eixo and eixo not in points_map[nome]["axes"]:
            points_map[nome]["axes"].append(eixo)

    return {
        "group":  group,
        "piece":  piece,
        "week":   _stem_to_week(stats_file.stem),
        "points": list(points_map.values()),
    }

# ENDPOINT 2 – Dados do gráfico para um ponto+eixo

@router.get("/pieces/{group}/{piece}/chart")
def get_chart_data(
    group: str,
    piece: str,
    point: str = Query(..., description="Nome do ponto, ex: CÍRCULO_7"),
    axis:  str = Query(..., description="Eixo: X, Y ou Z"),
):
    """
    Varre TODOS os arquivos CSV da pasta analysis em ordem cronológica,
    coleta as medições do ponto+eixo solicitado e retorna:
    {
      "point":    "CÍRCULO_7",
      "axis":     "X",
      "stats": { cp, cpk, avg, range, lsl, usl, sigma, ... },
      "measurements": [
        { "datetime": "17/11/2025-10:35", "nominal": 2240.01, "measured": 2239.81, "deviation": -0.21 },
        ...
      ]
    }
    """
    analysis_dir = _piece_analysis_dir(group, piece)

    # ── Coleta medições de todos os CSVs em ordem ──────────────────────────
    csv_files = sorted(f for f in analysis_dir.glob("*.csv"))
    if not csv_files:
        raise HTTPException(status_code=404, detail="Nenhum CSV encontrado.")

    measurements = []
    point_upper = point.upper()
    axis_upper  = axis.upper()

    for csv_path in csv_files:
        with open(csv_path, encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                nome  = row.get("NomePonto", "").upper()
                eixo  = row.get("Eixo", "").upper()
                if nome == point_upper and eixo == axis_upper:
                    data   = row.get("Data", "")
                    hora   = row.get("Hora", "")
                    dt_str = f"{data}-{hora}" if hora else data
                    measurements.append({
                        "datetime": dt_str,
                        "nominal":  _safe_float(row.get("Nominal")),
                        "measured": _safe_float(row.get("Medido")),
                        "deviation": _safe_float(row.get("Desvio")),
                        "tol_plus":  _safe_float(row.get("Tol+")),
                        "tol_minus": _safe_float(row.get("Tol-")),
                    })

    if not measurements:
        raise HTTPException(
            status_code=404,
            detail=f"Nenhuma medição encontrada para ponto='{point}', eixo='{axis}'"
        )

    # ── Busca stats do JSON mais recente 
    stats_file = _latest_stats_file(analysis_dir)
    with open(stats_file, encoding="utf-8") as f:
        stats_data = json.load(f)

    char_key = f"{point_upper}_{axis_upper}"
    stats = {}
    for ch in stats_data.get("characteristics", []):
        key = ch.get("caracteristica", "").upper()
        if key == char_key:
            stats = {
                "n":           ch.get("n"),
                "mean":        ch.get("mean"),
                "range":       ch.get("range"),
                "sigma":       ch.get("sigma"),
                "cp":          ch.get("cp"),
                "cpk":         ch.get("cpk"),
                "cpu":         ch.get("cpu"),
                "cpl":         ch.get("cpl"),
                "lsl":         ch.get("lsl"),
                "usl":         ch.get("usl"),
                "nominal":     ch.get("nominal"),
                "tol_plus":    ch.get("tol_plus"),
                "tol_minus":   ch.get("tol_minus"),
                "min":         ch.get("min"),
                "max":         ch.get("max"),
                "ok_percent":  ch.get("ok_percent"),
                "cp_color":    ch.get("cp_color"),
                "cpk_color":   ch.get("cpk_color"),
                # limites de controle (±3σ em torno da média)
                "ucl": round(ch.get("mean", 0) + 3 * ch.get("sigma", 0), 4),
                "lcl": round(ch.get("mean", 0) - 3 * ch.get("sigma", 0), 4),
                "specified": ch.get("nominal"),
            }
            break

    return {
        "group":        group,
        "piece":        piece,
        "point":        point,
        "axis":         axis,
        "stats":        stats,
        "measurements": measurements,
    }


# ═════════════════════════════════════════════════════════════════════════════
# ENDPOINT 3 – Listar semanas disponíveis (opcional, útil para filtros futuros)

@router.get("/pieces/{group}/{piece}/weeks")
def get_available_weeks(group: str, piece: str):
    analysis_dir = _piece_analysis_dir(group, piece)
    stats_files  = sorted(analysis_dir.glob("*_stats.json"))
    weeks = [_stem_to_week(f.stem) for f in stats_files]
    return {"group": group, "piece": piece, "weeks": weeks}


# ═════════════════════════════════════════════════════════════════════════════
# ENDPOINT 4 – Múltiplos gráficos de uma vez (chamada em batch do modal)
# Body: { "selections": [{"point": "CÍRCULO_7", "axis": "X"}, ...] }
# ═════════════════════════════════════════════════════════════════════════════

from pydantic import BaseModel

class ChartSelection(BaseModel):
    point: str
    axis:  str

class ChartsRequest(BaseModel):
    selections: list[ChartSelection]


@router.post("/pieces/{group}/{piece}/charts")
def get_multiple_charts(group: str, piece: str, body: ChartsRequest):
    """
    Retorna dados de múltiplos gráficos em uma única requisição.
    Ideal para chamar após o usuário confirmar as seleções no modal.
    """
    results = []
    for sel in body.selections:
        try:
            data = get_chart_data(group, piece, point=sel.point, axis=sel.axis)
            results.append(data)
        except HTTPException as e:
            results.append({
                "point": sel.point,
                "axis":  sel.axis,
                "error": e.detail,
            })
    return {"charts": results}


#Util
def _safe_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None  
     
      