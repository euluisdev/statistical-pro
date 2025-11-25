import pandas as pd
import numpy as np
from typing import Dict, List


def calculate_statistics(df: pd.DataFrame) -> Dict:
    """
    Calcula estatísticas no padrão do QH / PC-DMIS da indústria automotiva.
    """

    if df.empty:
        return {"error": "DataFrame vazio"}

    df['Caracteristica'] = df['NomePonto'].astype(str) + '_' + df['Eixo'].astype(str)

    results = {
        "total_measurements": len(df),
        "characteristics": []
    }

    for caracteristica in df['Caracteristica'].unique():
        char_data = df[df['Caracteristica'] == caracteristica].copy()

        if len(char_data) < 2:
            continue

        first = char_data.iloc[0]

        nome_ponto = first['NomePonto']
        eixo = first['Eixo']
        nominal = float(first['Nominal'])
        tol_plus = float(first['Tol+'])
        tol_minus = float(first['Tol-'])
        tipo_geom = first.get('TipoGeométrico', '')
        localizacao = first.get('Localização', '')

        desvios = char_data['Desvio'].astype(float).values

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

    results["summary"] = calculate_summary(results["characteristics"])

    return results


def calculate_characteristic_qh(
    desvios: np.ndarray,
    nominal: float,
    tol_plus: float,
    tol_minus: float
) -> Dict:
    """
    Cálculo EXATO usado no QH / PC-DMIS.
    """

    n = len(desvios)
    mean_dev = np.mean(desvios)
    r = np.max(desvios) - np.min(desvios)
    sigma = r / 6 if r > 0 else 0

    lsl = -abs(tol_minus)
    usl = abs(tol_plus)

    if sigma > 0:
        cp = (usl - lsl) / (6 * sigma)
        cpu = (usl - mean_dev) / (3 * sigma)
        cpl = (mean_dev - lsl) / (3 * sigma)
        cpk = min(cpu, cpl)
    else:
        cp = cpu = cpl = cpk = 0

    below_lsl = np.sum(desvios < lsl)
    above_usl = np.sum(desvios > usl)
    out_of_spec = below_lsl + above_usl
    ok_percent = ((n - out_of_spec) / n * 100) if n > 0 else 0

    #classifica cor baseada na celula tabela
    mean_color = classify_mean_color(mean_dev, lsl, usl)
    cp_color = classify_cp_color(cp)
    cpk_color = classify_cpk_color(cpk)

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
        "mean_color": mean_color,      #verde/amarelo/vermelho
        "cp_color": cp_color,            # verde/amarelo/vermelho
        "cpk_color": cpk_color,          # verde/amarelo/vermelho
        "desvio_medio": round(float(mean_dev), 3),
        "desvio_max": round(float(np.max(desvios)), 3),
        "desvio_min": round(float(np.min(desvios)), 3)
    }


def classify_mean_color(mean: float, lsl: float, usl: float) -> str:
    """
    Classifica a cor da célula da MÉDIA baseado na zona de tolerância.
    """
    #fora da tol
    if mean < lsl or mean > usl:
        return "red"
    
    #dentro da tol- calcula percentual
    abs_mean = abs(mean)
    max_dev = min(abs(lsl), abs(usl))
    percent = abs_mean / max_dev if max_dev > 0 else 0
    
    if percent >= 0.8:
        return "yellow"  # Próximo/limiet
    return "green"       # OK


def classify_cp_color(cp: float) -> str:
    """Classifica a cor do CP."""
    if cp >= 1.33:
        return "green"
    elif cp >= 1.0:
        return "yellow"
    return "red"


def classify_cpk_color(cpk: float) -> str:
    """Classifica a cor do CPK."""
    if cpk >= 1.33:
        return "green"
    elif cpk >= 1.0:
        return "yellow"
    return "red"


def calculate_summary(characteristics: List[Dict]) -> Dict:
    """
    Calcula resumo baseado nas CORES das células.
    
    Lógica:
    - CG (verde): Conta quantos pontos têm MÉDIA verde (dentro da zona verde)
    - CG ≤ 75% (amarelo): Conta quantos pontos têm MÉDIA amarela
    - CG < 100% (vermelho): Conta quantos pontos têm MÉDIA vermelha
    - CP/CPK: mesma lógica, mas baseado nas cores de CP e CPK
    """

    total = len(characteristics)

    if total == 0:
        return {}

    #conta por cor da media cg
    cg_green = sum(1 for c in characteristics if c["mean_color"] == "green")
    cg_yellow = sum(1 for c in characteristics if c["mean_color"] == "yellow")
    cg_red = sum(1 for c in characteristics if c["mean_color"] == "red")

    # Conta por cor do cp
    cp_green = sum(1 for c in characteristics if c["cp_color"] == "green")
    cp_yellow = sum(1 for c in characteristics if c["cp_color"] == "yellow")
    cp_red = sum(1 for c in characteristics if c["cp_color"] == "red")

    # Conta por cor cpk
    cpk_green = sum(1 for c in characteristics if c["cpk_color"] == "green")
    cpk_yellow = sum(1 for c in characteristics if c["cpk_color"] == "yellow")
    cpk_red = sum(1 for c in characteristics if c["cpk_color"] == "red")

    #percentuais
    cg_green_percent = round(cg_green / total * 100, 2)
    cg_yellow_percent = round(cg_yellow / total * 100, 2)
    cg_red_percent = round(cg_red / total * 100, 2)

    cp_green_percent = round(cp_green / total * 100, 2)
    cp_yellow_percent = round(cp_yellow / total * 100, 2)
    cp_red_percent = round(cp_red / total * 100, 2)

    cpk_green_percent = round(cpk_green / total * 100, 2)
    cpk_yellow_percent = round(cpk_yellow / total * 100, 2)
    cpk_red_percent = round(cpk_red / total * 100, 2)

    #medias gerais
    avg_cp = round(np.mean([c["cp"] for c in characteristics]), 2)
    avg_cpk = round(np.mean([c["cpk"] for c in characteristics]), 2)
    avg_sigma = round(np.mean([c["sigma"] for c in characteristics]), 3)
    avg_r = round(np.mean([c["range"] for c in characteristics]), 3)

    total_measurements = sum(c["n"] for c in characteristics)
    total_ok = sum(c["n"] - c["out_of_spec"] for c in characteristics)
    overall_ok_percent = round(total_ok / total_measurements * 100, 2)

    return {
        "total_characteristics": total,
        
        #cg baseado na cor da media
        "cg_green": cg_green,
        "cg_green_percent": cg_green_percent,
        "cg_yellow": cg_yellow,
        "cg_yellow_percent": cg_yellow_percent,
        "cg_red": cg_red,
        "cg_red_percent": cg_red_percent,
        
        # cp baseado na cor do cp
        "cp_green": cp_green,
        "cp_green_percent": cp_green_percent,
        "cp_yellow": cp_yellow,
        "cp_yellow_percent": cp_yellow_percent,
        "cp_red": cp_red,
        "cp_red_percent": cp_red_percent,
        
        #cpk
        "cpk_green": cpk_green,
        "cpk_green_percent": cpk_green_percent,
        "cpk_yellow": cpk_yellow,
        "cpk_yellow_percent": cpk_yellow_percent,
        "cpk_red": cpk_red,
        "cpk_red_percent": cpk_red_percent,
        
        # Médias
        "avg_cp": avg_cp,
        "avg_cpk": avg_cpk,
        "avg_sigma": avg_sigma,
        "avg_r": avg_r,
        
        #totais
        "total_measurements": total_measurements,
        "total_ok": total_ok,
        "overall_ok_percent": overall_ok_percent,
        "pu_percent": 0.30
    }