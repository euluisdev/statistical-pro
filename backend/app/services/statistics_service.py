import pandas as pd
import numpy as np
from typing import Dict, List


def calculate_statistics(df: pd.DataFrame) -> Dict:
    """
    Calcula estatísticas no padrão do QH / PC-DMIS da indústria automotiva.
    
    Regras:
    - Todos os cálculos são baseados APENAS nos desvios.
    - Média = média dos desvios.
    - Range = máx(desvio) – mín(desvio).
    - Sigma = range / 6.
    - Cp e Cpk calculados com sigma antigo.
    """

    if df.empty:
        return {"error": "DataFrame vazio"}

    #característica = NomePonto + Eixo
    df['Caracteristica'] = df['NomePonto'].astype(str) + '_' + df['Eixo'].astype(str)

    results = {
        "total_measurements": len(df),
        "characteristics": []
    }

    #para cada característica
    for caracteristica in df['Caracteristica'].unique():

        char_data = df[df['Caracteristica'] == caracteristica].copy()

        if len(char_data) < 2:
            continue

        first = char_data.iloc[0]

        #dados fixos
        nome_ponto = first['NomePonto']
        eixo = first['Eixo']
        nominal = float(first['Nominal'])
        tol_plus = float(first['Tol+'])
        tol_minus = float(first['Tol-'])
        tipo_geom = first.get('TipoGeométrico', '')
        localizacao = first.get('Localização', '')

        #desvios (base de tudo)
        desvios = char_data['Desvio'].astype(float).values

        #calcula estatísticas
        calc = calculate_characteristic_qh(
            desvios=desvios,
            nominal=nominal,
            tol_plus=tol_plus,
            tol_minus=tol_minus
        )

        calc["caracteristica"] = caracteristica
        calc["nome_ponto"] = nome_ponto
        calc["eixo"] = eixo
        calc["tipo_geometrico"] = tipo_geom
        calc["localizacao"] = localizacao

        results["characteristics"].append(calc)

    # resumo
    results["summary"] = calculate_summary(results["characteristics"])

    return results


#qh
def calculate_characteristic_qh(
    desvios: np.ndarray,
    nominal: float,
    tol_plus: float,
    tol_minus: float
) -> Dict:
    """
    Cálculo EXATO usado no QH / PC-DMIS:

    Média     = média dos desvios
    Range     = max(desvios) – min(desvios)
    Sigma     = range / 6
    Cp        = (USL - LSL) / (6 * sigma)
    Cpk       = min(Cpu, Cpl)
    Cpu       = (USL - Média) / (3 * sigma)
    Cpl       = (Média - LSL) / (3 * sigma)

    ATENÇÃO:
    - Tudo baseado nos desvios!
    - Valor "médio real" = nominal + média_dos_desvios (se o usuário quiser exibir).
    """

    n = len(desvios)

    #média
    mean_dev = np.mean(desvios)

    #range
    r = np.max(desvios) - np.min(desvios)

    #sigma
    sigma = r / 6 if r > 0 else 0

    #limites
    lsl = -abs(tol_minus)
    usl = abs(tol_plus)

    #cp-cpk
    if sigma > 0:
        cp = (usl - lsl) / (6 * sigma)
        cpu = (usl - mean_dev) / (3 * sigma)
        cpl = (mean_dev - lsl) / (3 * sigma)
        cpk = min(cpu, cpl)
    else:
        cp = cpu = cpl = cpk = 0

    #fora de especificação
    below_lsl = np.sum(desvios < lsl)
    above_usl = np.sum(desvios > usl)
    out_of_spec = below_lsl + above_usl
    ok_percent = ((n - out_of_spec) / n * 100) if n > 0 else 0

    return {
        "n": int(n),
        "mean": round(float(mean_dev), 3),
        "range": round(float(r), 3),
        "sigma": round(float(sigma), 3),
        "cp": round(float(cp), 2),
        "cpk": round(float(cpk), 2),
        "cpu": round(float(cpu), 2),
        "cpl": round(float(cpl), 2),
        "lsl": round(float(lsl), 3),
        "usl": round(float(usl), 3),
        "nominal": round(float(nominal), 3),
        "tol_plus": round(float(tol_plus), 3),
        "tol_minus": round(float(tol_minus), 3),
        "min": round(float(np.min(desvios)), 3),
        "max": round(float(np.max(desvios)), 3),
        "below_lsl": int(below_lsl),
        "above_usl": int(above_usl),
        "out_of_spec": int(out_of_spec),
        "ok_percent": round(float(ok_percent), 2),
        "classification": classify_capability(cp, cpk),
        "risk_level": calculate_risk(cpk),
        "desvio_medio": round(float(mean_dev), 3),
        "desvio_max": round(float(np.max(desvios)), 3),
        "desvio_min": round(float(np.min(desvios)), 3)
    }

def classify_capability(cp: float, cpk: float) -> str:
    if cpk >= 1.67:
        return "CG"
    elif cpk >= 1.33:
        return "CG < 75%"
    elif cpk >= 1.0:
        return "1 ≤ CP < 1.33"
    else:
        return "CP < 1"

def calculate_risk(cpk: float) -> int:
    if cpk >= 1.33:
        return 0
    elif cpk >= 1.0:
        return 1
    else:
        return 3

#resumo
def calculate_summary(characteristics: List[Dict]) -> Dict:

    total = len(characteristics)

    if total == 0:
        return {}

    cg_count = sum(1 for c in characteristics if c["cpk"] >= 1.67)
    cg_percent = round(cg_count / total * 100, 2)

    cg_75_count = sum(1 for c in characteristics if 1.33 <= c["cpk"] < 1.67)
    cg_75_percent = round(cg_75_count / total * 100, 2)

    avg_cp = round(np.mean([c["cp"] for c in characteristics]), 2)
    avg_cpk = round(np.mean([c["cpk"] for c in characteristics]), 2)
    avg_sigma = round(np.mean([c["sigma"] for c in characteristics]), 3)
    avg_r = round(np.mean([c["range"] for c in characteristics]), 3)

    total_measurements = sum(c["n"] for c in characteristics)
    total_ok = sum(c["n"] - c["out_of_spec"] for c in characteristics)
    overall_ok_percent = round(total_ok / total_measurements * 100, 2)

    return {
        "total_characteristics": total,
        "cg_count": cg_count,
        "cg_percent": cg_percent,
        "cg_75_count": cg_75_count,
        "cg_75_percent": cg_75_percent,
        "avg_cp": avg_cp,
        "avg_cpk": avg_cpk,
        "avg_sigma": avg_sigma,
        "avg_r": avg_r,
        "total_measurements": total_measurements,
        "total_ok": total_ok,
        "overall_ok_percent": overall_ok_percent,
        "pu_percent": 0.30
    }
