from fastapi import APIRouter, HTTPException, Query
from pathlib import Path
import json
import csv

router = APIRouter(tags=["pieces"])

BASE_DATA = Path(__file__).resolve().parent.parent / "data" / "groups"


# ── HELPERS ───────────────────────────────────────────────────────────────────

def _piece_analysis_dir(group: str, piece: str) -> Path:
    path = BASE_DATA / group / "pieces" / piece / "analysis"
    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Análise não encontrada para grupo='{group}', peça='{piece}'"
        )
    return path


def _latest_stats_file(analysis_dir: Path) -> Path:
    """Retorna o *_stats.json mais recente (ordenação alfabética = mais recente)."""
    files = sorted(analysis_dir.glob("*_stats.json"))
    if not files:
        raise HTTPException(status_code=404, detail="Nenhum arquivo stats.json encontrado.")
    return files[-1]


def _latest_csv_file(analysis_dir: Path) -> Path:
    """
    Retorna o CSV mais recente da pasta analysis.
    Padrão: analysis_YYYY_WNN.csv — ordenação alfabética garante o mais recente.
    """
    files = sorted(f for f in analysis_dir.glob("*.csv"))
    if not files:
        raise HTTPException(status_code=404, detail="Nenhum arquivo CSV encontrado.")
    return files[-1]


def _stem_to_week(filename: str) -> str:
    parts = filename.replace("_stats", "").split("_")
    if len(parts) >= 3:
        return f"{parts[1]}-{parts[2]}"
    return filename


def _safe_float(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


# ── ENDPOINT 1 – Pontos disponíveis (para o modal) ───────────────────────────

@router.get("/pieces/{group}/{piece}/points")
def get_available_points(group: str, piece: str):
    """Lê o stats.json mais recente e retorna todos os pontos com seus eixos."""
    analysis_dir = _piece_analysis_dir(group, piece)
    stats_file   = _latest_stats_file(analysis_dir)

    with open(stats_file, encoding="utf-8") as f:
        stats_data = json.load(f)

    points_map: dict[str, dict] = {}
    for ch in stats_data.get("characteristics", []):
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


# ── ENDPOINT 2 – Dados de um gráfico ─────────────────────────────────────────

@router.get("/pieces/{group}/{piece}/chart")
def get_chart_data(
    group: str,
    piece: str,
    point: str = Query(...),
    axis:  str = Query(...),
):
    """
    Regra de negócio:
      - Usa APENAS o CSV mais recente da pasta (semana/ano mais atual).
      - Dentro do CSV, filtra por NomePonto + Eixo.
      - Cada valor único de 'Origem' = 1 peça/medição distinta
        → 1 Origem = 1 ponto no gráfico, com a data e hora daquela origem.
      - A ordem segue a aparição das Origens no arquivo (= ordem cronológica).
    """
    analysis_dir = _piece_analysis_dir(group, piece)
    csv_path     = _latest_csv_file(analysis_dir)   # sempre o mais recente
    point_upper  = point.upper()
    axis_upper   = axis.upper()

    # dict ordenado: Origem → primeira linha encontrada para este ponto+eixo
    origens: dict[str, dict] = {}

    with open(csv_path, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if (row.get("NomePonto", "").upper() != point_upper or
                    row.get("Eixo", "").upper() != axis_upper):
                continue

            origem = row.get("Origem", "").strip()
            if not origem:
                # fallback: usa Data+Hora como chave se Origem estiver vazia
                origem = f"{row.get('Data', '')}_{row.get('Hora', '')}"

            if origem not in origens:
                # Registra apenas a 1ª ocorrência desta Origem para este ponto+eixo
                origens[origem] = row

    if not origens:
        raise HTTPException(
            status_code=404,
            detail=(
                f"Nenhuma medição encontrada para ponto='{point}', eixo='{axis}' "
                f"no arquivo '{csv_path.name}'"
            )
        )

    # 1 item por Origem, na ordem cronológica do arquivo
    measurements = []
    for origem, row in origens.items():
        data = row.get("Data", "")
        hora = row.get("Hora", "")
        measurements.append({
            "datetime":  f"{data}\n{hora}" if hora else data,
            "origem":    origem,
            "nominal":   _safe_float(row.get("Nominal")),
            "measured":  _safe_float(row.get("Medido")),
            "deviation": _safe_float(row.get("Desvio")),
            "tol_plus":  _safe_float(row.get("Tol+")),
            "tol_minus": _safe_float(row.get("Tol-")),
        })

    # Stats do JSON mais recente
    stats_file = _latest_stats_file(analysis_dir)
    with open(stats_file, encoding="utf-8") as f:
        stats_data = json.load(f)

    char_key = f"{point_upper}_{axis_upper}"
    stats = {}
    for ch in stats_data.get("characteristics", []):
        if ch.get("caracteristica", "").upper() == char_key:
            mean  = ch.get("mean",  0) or 0
            sigma = ch.get("sigma", 0) or 0
            stats = {
                "n":          len(measurements),   # 1 por Origem = real
                "mean":       ch.get("mean"),
                "range":      ch.get("range"),
                "sigma":      ch.get("sigma"),
                "cp":         ch.get("cp"),
                "cpk":        ch.get("cpk"),
                "cpu":        ch.get("cpu"),
                "cpl":        ch.get("cpl"),
                "lsl":        ch.get("lsl"),
                "usl":        ch.get("usl"),
                "nominal":    ch.get("nominal"),
                "tol_plus":   ch.get("tol_plus"),
                "tol_minus":  ch.get("tol_minus"),
                "min":        ch.get("min"),
                "max":        ch.get("max"),
                "ok_percent": ch.get("ok_percent"),
                "cp_color":   ch.get("cp_color"),
                "cpk_color":  ch.get("cpk_color"),
                "ucl":        round(mean + 3 * sigma, 4),
                "lcl":        round(mean - 3 * sigma, 4),
                "specified":  ch.get("nominal"),
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


# ── ENDPOINT 3 – Semanas disponíveis ─────────────────────────────────────────

@router.get("/pieces/{group}/{piece}/weeks")
def get_available_weeks(group: str, piece: str):
    analysis_dir = _piece_analysis_dir(group, piece)
    stats_files  = sorted(analysis_dir.glob("*_stats.json"))
    weeks = [_stem_to_week(f.stem) for f in stats_files]
    return {"group": group, "piece": piece, "weeks": weeks}


# ── ENDPOINT 4 – Batch (múltiplos gráficos de uma vez) ───────────────────────

from pydantic import BaseModel

class ChartSelection(BaseModel):
    point: str
    axis:  str

class ChartsRequest(BaseModel):
    selections: list[ChartSelection]


@router.post("/pieces/{group}/{piece}/charts")
def get_multiple_charts(group: str, piece: str, body: ChartsRequest):
    results = []
    for sel in body.selections:
        try:
            data = get_chart_data(group, piece, point=sel.point, axis=sel.axis)
            results.append(data)
        except HTTPException as e:
            results.append({"point": sel.point, "axis": sel.axis, "error": e.detail})
    return {"charts": results}  
 
  
   