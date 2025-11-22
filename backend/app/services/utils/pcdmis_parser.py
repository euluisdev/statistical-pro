import pandas as pd
import re

def ler_relatorio_pcdmis(caminho_arquivo):
    # Abre o arquivo (tenta UTF-8 e depois Latin-1 se houver erro)
    try:
        with open(caminho_arquivo, "r", encoding="utf-8") as f:
            linhas = f.readlines()
    except UnicodeDecodeError:
        with open(caminho_arquivo, "r", encoding="latin-1") as f:
            linhas = f.readlines()

    data, hora = None, None
    id_loc, tipo_geo, nome_ponto = None, None, None
    dados = []

    for linha in linhas:
        linha = linha.strip()

        if linha.upper().startswith("DATA:"):
            data = linha.split(":", 1)[1].strip()
            continue
        if linha.upper().startswith("HORA:"):
            hora = linha.split(":", 1)[1].strip()
            continue

        if linha.upper().startswith("DIM "):
            m_loc = re.search(r"DIM\s+(LOC\d+)", linha, re.IGNORECASE)
            id_loc = m_loc.group(1).strip() if m_loc else "N/D"

            m_loc_text = re.search(r"LOCALIZAÇÃO\s+DE\s+(.*)", linha, re.IGNORECASE)
            if m_loc_text:
                resto = m_loc_text.group(1).strip()
                resto = re.sub(r"\s+DP=.*$", "", resto, flags=re.IGNORECASE).strip()
                parts = resto.split()
                if len(parts) >= 2:
                    tipo_geo = parts[0].strip()
                    nome_ponto = " ".join(parts[1:]).strip()
                elif len(parts) == 1:
                    tipo_geo = parts[0].strip()
                    nome_ponto = "N/D"
                else:
                    tipo_geo = "N/D"
                    nome_ponto = "N/D"
            else:
                tipo_geo = "N/D"
                nome_ponto = "N/D"

            continue

        if re.match(r"^[XYZDTM]\s", linha):
            partes = linha.split()
            if len(partes) >= 6:
                eixo = partes[0]
                def to_float(s):
                    s2 = s.replace(",", ".")
                    try:
                        return float(s2)
                    except:
                        return None

                nominal = to_float(partes[1])
                medido  = to_float(partes[2])
                desvio  = to_float(partes[3])
                tol_plus  = to_float(partes[4])
                tol_minus = to_float(partes[5])

                dados.append([
                    data, hora, id_loc, tipo_geo, nome_ponto,
                    eixo, nominal, medido, desvio, tol_plus, tol_minus
                ])

    df = pd.DataFrame(
        dados,
        columns=[
            "Data", "Hora", "Localização", "TipoGeométrico", "NomePonto",
            "Eixo", "Nominal", "Medido", "Desvio", "Tol+", "Tol-"
        ]
    )
    df["Tol-"] = df["Tol-"].apply(lambda x: -x if pd.notnull(x) else x)

    return df