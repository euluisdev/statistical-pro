import os
import pandas as pd
from typing import List
from .utils.pcdmis_parser import ler_relatorio_pcdmis 
from .pieces_service import sanitize_piece_name  
BASE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "groups")

def ensure_csv_dir(group: str, piece: str) -> str:
    g = sanitize_piece_name(group)
    p = sanitize_piece_name(piece)
    csv_dir = os.path.join(BASE_DIR, g, "pieces", p, "csv")
    os.makedirs(csv_dir, exist_ok=True)
    return csv_dir

def extract_all_txt_to_csv(group: str, piece: str) -> List[str]:
    """
    Para cada TXT em data/groups/<group>/pieces/<piece>/txt,
    extrai usando ler_relatorio_pcdmis() e salva um CSV
    com o mesmo nome (troca .txt -> .csv) em .../csv/.
    Retorna lista de caminhos de CSV (nomes de arquivo).
    """
    g = sanitize_piece_name(group)
    p = sanitize_piece_name(piece)
    txt_dir = os.path.join(BASE_DIR, g, "pieces", p, "txt")
    if not os.path.isdir(txt_dir):
        return []

    csv_dir = ensure_csv_dir(group, piece)
    saved = []

    for fname in sorted(os.listdir(txt_dir)):
        if not fname.lower().endswith(".txt"):
            continue
        txt_path = os.path.join(txt_dir, fname)
        try:
            df = ler_relatorio_pcdmis(txt_path)  #retorna df
        except Exception as e:
            #falha em um arquivo não deve abortar tudo
            continue

        if df.empty:
            continue

        csv_name = os.path.splitext(fname)[0] + ".csv"
        csv_path = os.path.join(csv_dir, csv_name)
        df.to_csv(csv_path, index=False, encoding="utf-8")
        saved.append(csv_name)

    return saved

def load_all_csv_as_dataframe(group: str, piece: str) -> pd.DataFrame:
    """
    Carrega todos os CSV em data/groups/<group>/pieces/<piece>/csv/
    e retorna um DataFrame concatenado (pandas).
    """
    g = sanitize_piece_name(group)
    p = sanitize_piece_name(piece)
    csv_dir = os.path.join(BASE_DIR, g, "pieces", p, "csv")
    if not os.path.isdir(csv_dir):
        return pd.DataFrame()  # vazio

    files = [f for f in sorted(os.listdir(csv_dir)) if f.lower().endswith(".csv")]
    if not files:
        return pd.DataFrame()

    dfs = []
    for f in files:
        path = os.path.join(csv_dir, f)
        try:
            df = pd.read_csv(path, encoding="utf-8")
            df["RelatorioCSV"] = f
            dfs.append(df)
        except Exception:
            # pula arquivos inválidos
            continue

    if not dfs:
        return pd.DataFrame()

    df_all = pd.concat(dfs, ignore_index=True)
    return df_all
