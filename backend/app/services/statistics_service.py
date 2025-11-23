import pandas as pd
import numpy as np
from typing import Dict, List, Optional

def calculate_statistics(df: pd.DataFrame) -> Dict:
    """
    Calcula todas as estatísticas necessárias para a análise PC-DMIS.
    """
    
    if df.empty:
        return {"error": "DataFrame vazio"}
    
    df['Caracteristica'] = df['NomePonto'].astype(str) + '_' + df['Eixo'].astype(str)
    
    results = {
        "total_measurements": len(df),
        "characteristics": []
    }
    
    for caracteristica in df['Caracteristica'].unique():
        char_data = df[df['Caracteristica'] == caracteristica]
        
        if len(char_data) == 0:
            continue
        
        #informações da primeira linha (tolerâncias são as mesmas)
        first_row = char_data.iloc[0]
        
        nominal = float(first_row['Nominal'])
        tol_plus = float(first_row['Tol+'])
        tol_minus = float(first_row['Tol-'])
        eixo = first_row['Eixo']
        nome_ponto = first_row['NomePonto']
        tipo_geom = first_row.get('TipoGeométrico', '')
        
        #valores medidos
        medidos = char_data['Medido'].astype(float)
        desvios = char_data['Desvio'].astype(float)
        
        calc = calculate_characteristic_stats(
            valores=medidos,
            desvios=desvios,
            nominal=nominal,
            tol_plus=tol_plus,
            tol_minus=tol_minus
        )
        
        calc["caracteristica"] = caracteristica
        calc["nome_ponto"] = nome_ponto
        calc["eixo"] = eixo
        calc["tipo_geometrico"] = tipo_geom
        calc["localizacao"] = first_row.get('Localização', '')
        
        results["characteristics"].append(calc)
    
    #resumo geral
    results["summary"] = calculate_summary(results["characteristics"])
    
    return results


def calculate_characteristic_stats(
    valores: pd.Series, 
    desvios: pd.Series,
    nominal: float, 
    tol_plus: float, 
    tol_minus: float
) -> Dict:
    """
    Calcula estatísticas detalhadas de uma característica.
    """
    
    n = len(valores)
    mean = valores.mean()
    std = valores.std(ddof=1) if n > 1 else 0  #desvio padrão amostral
    
    lsl = nominal - abs(tol_minus) 
    usl = nominal + abs(tol_plus)   
    
    #range - amplitude
    value_range = valores.max() - valores.min()
    
    # Cálculos de capacidade
    if std > 0:
        cp = (usl - lsl) / (6 * std)
        
        #cpk
        cpu = (usl - mean) / (3 * std)
        cpl = (mean - lsl) / (3 * std)
        cpk = min(cpu, cpl)
        
        #sigma
        sigma = abs(mean - nominal) / std
    else:
        cp = 0
        cpk = 0
        cpu = 0
        cpl = 0
        sigma = 0
    
    #percentuais fora
    below_lsl = (valores < lsl).sum()
    above_usl = (valores > usl).sum()
    out_of_spec = below_lsl + above_usl
    ok_percent = ((n - out_of_spec) / n * 100) if n > 0 else 0
    
    classification = classify_capability(cp, cpk)
    
    #risk
    risk_level = calculate_risk(cpk)
    
    return {
        "n": int(n),
        "mean": round(float(mean), 3),
        "std": round(float(std), 3),
        "min": round(float(valores.min()), 3),
        "max": round(float(valores.max()), 3),
        "range": round(float(value_range), 3),
        "nominal": round(float(nominal), 3),
        "lsl": round(float(lsl), 3),
        "usl": round(float(usl), 3),
        "tol_plus": round(float(tol_plus), 3),
        "tol_minus": round(float(tol_minus), 3),
        "cp": round(float(cp), 2),
        "cpk": round(float(cpk), 2),
        "cpu": round(float(cpu), 2),
        "cpl": round(float(cpl), 2),
        "sigma": round(float(sigma), 2),
        "below_lsl": int(below_lsl),
        "above_usl": int(above_usl),
        "out_of_spec": int(out_of_spec),
        "ok_percent": round(float(ok_percent), 2),
        "classification": classification,
        "risk_level": risk_level,
        "desvio_medio": round(float(desvios.mean()), 3),
        "desvio_max": round(float(desvios.max()), 3),
        "desvio_min": round(float(desvios.min()), 3)
    }


def classify_capability(cp: float, cpk: float) -> str:
    """
    Classifica a capacidade do processo baseado em Cp e Cpk.
    
    Classificações comuns na indústria:
    - CG (Capability Good): Cpk >= 1.67
    - CG < 75%: 1.33 <= Cpk < 1.67 e Cp >= 1.33
    - 76% < CG < 100%: Cpk >= 1.33 e Cp < 1.33
    - 1 ≤ CP < 1.33: Marginalmente capaz
    - CP < 1: Inadequado
    """
    if cpk >= 1.67:
        return "CG"
    elif cpk >= 1.33 and cp >= 1.33:
        return "CG < 75%"
    elif cpk >= 1.33 and cp < 1.67:
        return "76% < CG < 100%"
    elif cpk >= 1.0:
        return "1 ≤ CP < 1.33"
    else:
        return "CP < 1"


def calculate_risk(cpk: float) -> int:
    """
    Calcula nível de risco (0-3).
    0 = Sem risco (verde), 1 = Baixo (amarelo claro), 2 = Médio (amarelo), 3 = Alto (vermelho)
    """
    if cpk >= 1.67:
        return 0
    elif cpk >= 1.33:
        return 0  # To 0.5 na verdade, mas retorna 0
    elif cpk >= 1.0:
        return 0
    else:
        return 3 


def calculate_summary(characteristics: List[Dict]) -> Dict:
    """
    Calcula resumo geral de todas as características.
    """
    if not characteristics:
        return {}
    
    total = len(characteristics)
    
    #conta quantas características CG (Cpk >= 1.67)
    cg_count = sum(1 for c in characteristics if c["cpk"] >= 1.67)
    cg_percent = round(cg_count / total * 100, 2) if total > 0 else 0
    
    # Conta CG < 75% (1.33 <= Cpk < 1.67)
    cg_75_count = sum(1 for c in characteristics if 1.33 <= c["cpk"] < 1.67)
    cg_75_percent = round(cg_75_count / total * 100, 2) if total > 0 else 0
    
    #conta 76% < CG < 100%
    cg_76_100_count = sum(1 for c in characteristics if c["classification"] == "76% < CG < 100%")
    
    #Cp e Cpk
    avg_cp = round(np.mean([c["cp"] for c in characteristics]), 2)
    avg_cpk = round(np.mean([c["cpk"] for c in characteristics]), 2)
    
    #total de medições
    total_measurements = sum(c["n"] for c in characteristics)
    total_ok = sum(c["n"] - c["out_of_spec"] for c in characteristics)
    overall_ok_percent = round(total_ok / total_measurements * 100, 2) if total_measurements > 0 else 0
    
    return {
        "total_characteristics": total,
        "cg_count": cg_count,
        "cg_percent": cg_percent,
        "cg_75_count": cg_75_count,
        "cg_75_percent": cg_75_percent,
        "cg_76_100_count": cg_76_100_count,
        "avg_cp": avg_cp,
        "avg_cpk": avg_cpk,
        "total_measurements": total_measurements,
        "total_ok": total_ok,
        "overall_ok_percent": overall_ok_percent,
        "pu_percent": 0.30  # Placeholder
    }


def get_color_class(cpk: float, cp: float) -> str:
    """
    Retorna classe CSS baseada no Cp/Cpk.
    """
    if cpk < 1.0:
        return "bg-red-100"  # Vermelho - Inadequado
    elif cpk < 1.33:
        return "bg-yellow-100"  # Amarelo - Atenção
    elif cp >= 1.33 and cpk >= 1.67:
        return "bg-green-100"  # Verde - CG
    elif cpk >= 1.33:
        return "bg-green-50"  # Verde claro - CG < 75%
    else:
        return "bg-orange-100"  # Laranja


def get_cell_color(value: float, nominal: float, tol_plus: float, tol_minus: float) -> str:
    """
    Retorna cor da célula baseada no valor vs especificação.
    """
    lsl = nominal - abs(tol_minus)
    usl = nominal + abs(tol_plus)
    
    if value < lsl or value > usl:
        return "bg-red-200 text-red-900"  # Fora de especificação
    elif value < (lsl + 0.3 * abs(tol_minus)) or value > (usl - 0.3 * abs(tol_plus)):
        return "bg-yellow-100 text-yellow-900"  # Próximo ao limite
    else:
        return "bg-green-50"  # OK