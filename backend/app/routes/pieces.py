from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Query
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
from app.services.pieces_service import(
    list_pieces, 
    create_piece, 
    delete_piece, 
    ensure_piece_dirs, 
    sanitize_piece_name, 
    list_txt_files, 
    delete_txt_file
) 
from app.services.pcdmis_csv_service import extract_all_txt_to_csv, load_all_csv_as_dataframe, save_analysis_csv
from app.services.statistics_service import calculate_statistics

import os 
import shutil 
from datetime import datetime

router = APIRouter(prefix="/pieces", tags=["pieces"])

class CreatePieceReq(BaseModel):
    group: str
    part_number: str
    part_name: str
    model: str

@router.get("/{group}", response_model=List[dict])
def get_pieces(group: str):
    return list_pieces(group)



@router.delete("/{group}/{part_number}")
def delete_piece_route(group: str, part_number: str):
    ok, info = delete_piece(group, part_number)

    if not ok:
        raise HTTPException(status_code=404, detail=info)

    return {"deleted": info}

@router.post("/upload_txt")
async def upload_txt(
    group: str = Form(...),
    piece: str = Form(...),
    files: list[UploadFile] = File(...)
):
    group_safe = sanitize_piece_name(group)
    piece_safe = sanitize_piece_name(piece)

    #garante pastas
    txt_path = ensure_piece_dirs(group_safe, piece_safe)

    saved_files = []

    for file in files:
        if not file.filename.lower().endswith(".txt"):
            raise HTTPException(400, f"Arquivo inválido: {file.filename}")

        out_path = os.path.join(txt_path, file.filename)

        with open(out_path, "wb") as f:
            shutil.copyfileobj(file.file, f)

        saved_files.append(file.filename)

    return {
        "status": "ok",
        "saved": saved_files,
        "path": txt_path
    }
    

@router.get("/{group}/{piece}/txt")
def get_txt_files(group: str, piece: str):
    try:
        files = list_txt_files(group, piece)
        return files
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{group}/{piece}/txt/{filename}")
def delete_txt(group: str, piece: str, filename: str):
    ok, info = delete_txt_file(group, piece, filename)

    if not ok:
        raise HTTPException(status_code=404, detail=info)

    return {"deleted": info}

@router.post("/{group}/{piece}/extract_to_csv")
def extract_to_csv_route(group: str, piece: str):
    """
    Extrai TODOS os TXT (na pasta txt/) da peça para CSVs (pasta csv/).
    """
    saved = extract_all_txt_to_csv(group, piece)
    if saved is None:
        raise HTTPException(status_code=500, detail="Erro interno")
    return {"status": "ok", "saved": saved, "count": len(saved)}


@router.get("/{group}/{piece}/dataframe")
def get_piece_dataframe(group: str, piece: str):
    """
    Carrega todos os CSVs em csv/ e retorna os dados concatenados
    como JSON (lista de registros).
    """
    df = load_all_csv_as_dataframe(group, piece)
    if df.empty:
        return {"status": "empty", "rows": 0, "data": []}

    #tipos serializáveis
    records = df.fillna("").to_dict(orient="records")
    return {"status": "ok", "rows": len(records), "data": records}

@router.post("/{group}/{piece}/extract_analysis")
def extract_analysis_csv(group: str, piece: str):
    """
    DEPRECATED: Use /generate_analysis com parâmetros week/year.
    Mantido por compatibilidade.
    """
    import pandas as pd

    group_safe = sanitize_piece_name(group)
    piece_safe = sanitize_piece_name(piece)

    base_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "data", "groups", group_safe, "pieces", piece_safe
    )

    csv_dir = os.path.join(base_path, "csv")
    analysis_path = os.path.join(base_path, "analysis.csv")

    if not os.path.exists(csv_dir):
        raise HTTPException(404, "Nenhum CSV encontrado. Extraia os TXT primeiro.")

    dfs = []
    for file in os.listdir(csv_dir):
        if file.lower().endswith(".csv"):
            try:
                caminho_completo = os.path.join(csv_dir, file)
                df = pd.read_csv(caminho_completo)
                df["Origem"] = file
                dfs.append(df)
            except Exception as e:
                continue

    if not dfs:
        raise HTTPException(404, "Nenhum CSV válido encontrado.")

    df_total = pd.concat(dfs, ignore_index=True)
    df_total.to_csv(analysis_path, index=False)

    return {
        "status": "ok",
        "rows": len(df_total),
        "file": "analysis.csv",
        "path": analysis_path
    }

@router.post("/{group}/{piece}/generate_analysis")
def generate_analysis(
    group: str, 
    piece: str,
    week: Optional[int] = Query(None, description="Semana ISO (1-53)"),
    year: Optional[int] = Query(None, description="Ano (ex: 2024)")
):
    """
    Gera analysis_YYYY_WXX.csv com os dados da semana/ano especificados.
    Se week/year não forem passados, usa a semana atual.
    Se o arquivo já existir, sobrescreve.
    """
    import pandas as pd

    group_safe = sanitize_piece_name(group)
    piece_safe = sanitize_piece_name(piece)

    base_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "data", "groups", group_safe, "pieces", piece_safe
    )

    csv_dir = os.path.join(base_path, "csv")
    
    #create folder analysis/
    analysis_dir = os.path.join(base_path, "analysis")
    os.makedirs(analysis_dir, exist_ok=True)

    if not os.path.exists(csv_dir):
        raise HTTPException(404, "Nenhum CSV encontrado. Extraia os TXT primeiro.")

    if week is None or year is None:
        now = datetime.now()
        week = now.isocalendar()[1]  #semana ISO (1-53)
        year = now.year

    #validação
    if not (1 <= week <= 53):
        raise HTTPException(400, "Semana deve estar entre 1 e 53")
    if not (2020 <= year <= 2050):
        raise HTTPException(400, "Ano inválido")

    #name file with week/year
    filename = f"analysis_{year}_W{week:02d}.csv"
    analysis_path = os.path.join(analysis_dir, filename)

    #read all CSV file
    dfs = []
    for file in os.listdir(csv_dir):
        if file.lower().endswith(".csv"):
            try:
                df = pd.read_csv(os.path.join(csv_dir, file))
                df["Origem"] = file
                dfs.append(df)
            except Exception as e:
                print(f"Erro ao ler {file}: {e}")
                continue

    if not dfs:
        raise HTTPException(404, "Nenhum CSV válido encontrado.")

    df_total = pd.concat(dfs, ignore_index=True)
    
    # TODO: Futuramente filtrar por data/semana quando tiver a coluna
    
    df_total.to_csv(analysis_path, index=False)

    return {
        "status": "ok",
        "rows": len(df_total),
        "file": filename,
        "week": week,
        "year": year,
        "path": analysis_path
    }


@router.get("/{group}/{piece}/analysis")
def load_analysis_csv(
    group: str, 
    piece: str,
    week: Optional[int] = Query(None, description="Semana ISO (1-53)"),
    year: Optional[int] = Query(None, description="Ano (ex: 2024)")
):
    """
    Carrega o analysis de uma semana específica.
    Se não passar semana/ano, usa a semana atual.
    """
    import pandas as pd

    group_safe = sanitize_piece_name(group)
    piece_safe = sanitize_piece_name(piece)

    if week is None or year is None:
        now = datetime.now()
        week = now.isocalendar()[1]
        year = now.year

    filename = f"analysis_{year}_W{week:02d}.csv"
    
    analysis_dir = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "data", "groups", group_safe, "pieces", piece_safe, "analysis"
    )
    
    path = os.path.join(analysis_dir, filename)

    if not os.path.exists(path):
        raise HTTPException(404, f"{filename} não encontrado. Gere ele primeiro.")

    df = pd.read_csv(path)
    
    return {
        "week": week,
        "year": year,
        "file": filename,
        "rows": len(df),
        "data": df.to_dict(orient="records")
    }


@router.get("/{group}/{piece}/analysis/list")
def list_analysis_files(group: str, piece: str):
    """
    Lista todos os arquivos de análise disponíveis (histórico).
    Retorna ordenado por ano/semana (mais recente primeiro).
    """
    group_safe = sanitize_piece_name(group)
    piece_safe = sanitize_piece_name(piece)

    analysis_dir = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "data", "groups", group_safe, "pieces", piece_safe, "analysis"
    )

    if not os.path.exists(analysis_dir):
        return {"files": []}

    files = []
    for f in os.listdir(analysis_dir):
        if f.startswith("analysis_") and f.endswith(".csv"):
            try:
                parts = f.replace("analysis_", "").replace(".csv", "").split("_")
                if len(parts) == 2:
                    year = int(parts[0])
                    week = int(parts[1].replace("W", ""))
                    
                    file_path = os.path.join(analysis_dir, f)
                    file_size = os.path.getsize(file_path)
                    modified_time = os.path.getmtime(file_path)
                    
                    files.append({
                        "filename": f,
                        "year": year,
                        "week": week,
                        "size": file_size,
                        "modified": datetime.fromtimestamp(modified_time).isoformat()
                    })
            except:
                continue

    #ordena ano/semana (mais recente primeiro)
    files.sort(key=lambda x: (x["year"], x["week"]), reverse=True)
    
    return {
        "count": len(files),
        "files": files
    }


@router.delete("/{group}/{piece}/analysis/{filename}")
def delete_analysis_file(group: str, piece: str, filename: str):
    """
    Deleta um arquivo de análise específico.
    """
    group_safe = sanitize_piece_name(group)
    piece_safe = sanitize_piece_name(piece)
    
    #protege contra path traversal
    filename_safe = os.path.basename(filename)
    
    if not filename_safe.startswith("analysis_") or not filename_safe.endswith(".csv"):
        raise HTTPException(400, "Nome de arquivo inválido")

    analysis_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "data", "groups", group_safe, "pieces", piece_safe, 
        "analysis", filename_safe
    )

    if not os.path.exists(analysis_path):
        raise HTTPException(404, f"Arquivo '{filename_safe}' não existe")

    try:
        os.remove(analysis_path)
    except Exception as e:
        raise HTTPException(500, f"Erro ao apagar arquivo: {e}")

    return {"deleted": filename_safe}

@router.post("/{group}/{piece}/calculate_statistics")
def calculate_piece_statistics(
    group: str, 
    piece: str,
    week: Optional[int] = Query(None),
    year: Optional[int] = Query(None)
):
    """
    Calcula estatísticas detalhadas do analysis.csv da semana especificada.
    Retorna dados processados prontos para exibição.
    """
    import pandas as pd

    group_safe = sanitize_piece_name(group)
    piece_safe = sanitize_piece_name(piece)

    # Se não passar, usa semana atual
    if week is None or year is None:
        from datetime import datetime
        now = datetime.now()
        week = now.isocalendar()[1]
        year = now.year

    filename = f"analysis_{year}_W{week:02d}.csv"
    
    analysis_dir = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "data", "groups", group_safe, "pieces", piece_safe, "analysis"
    )
    
    path = os.path.join(analysis_dir, filename)

    if not os.path.exists(path):
        raise HTTPException(404, f"{filename} não encontrado. Gere ele primeiro.")

    #read csv
    df = pd.read_csv(path)
    
    stats = calculate_statistics(df)
    
    #save result json
    stats_file = path.replace(".csv", "_stats.json")
    import json
    with open(stats_file, "w") as f:
        json.dump(stats, f, indent=2)
    
    return {
        "status": "ok",
        "week": week,
        "year": year,
        "statistics": stats
    }


@router.post("", status_code=201)
async def post_piece(
    group: str = Form(...),
    part_number: str = Form(...),
    part_name: str = Form(...),
    model: str = Form(...),
    image: UploadFile = File(None)  
):
    try:
        group_safe = sanitize_piece_name(group)
        part_safe = sanitize_piece_name(part_number)
        
        ok, info = create_piece(
            group,
            part_number,
            part_name,
            model
        )
        
        if not ok:
            raise HTTPException(status_code=409, detail=info)
        
        #if send img - save in the folder imagens/
        if image and image.filename:
            #se pasta existe
            image_dir = os.path.join(
                os.path.dirname(os.path.dirname(__file__)),
                "data", "groups", group_safe, "pieces", part_safe, "imagens"
            )
            os.makedirs(image_dir, exist_ok=True)
            
            #get extensão original
            ext = os.path.splitext(image.filename)[1]
            image_path = os.path.join(image_dir, f"peca{ext}")
            
            #save img
            with open(image_path, "wb") as f:
                shutil.copyfileobj(image.file, f)
            
            return {"created": info, "image": f"peca{ext}"}
        
        return {"created": info}
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    


@router.get("/{group}/{piece}/imagens")
def get_piece_image(group: str, piece: str):
    """
    Retorna a imagem da peça.
    """
    group_safe = sanitize_piece_name(group)
    piece_safe = sanitize_piece_name(piece)
    
    image_dir = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "data", "groups", group_safe, "pieces", piece_safe, "imagens"
    )
    
    if not os.path.exists(image_dir):
        raise HTTPException(404, "Pasta de imagens não encontrada")
    
    # Procura por qualquer arquivo que comece com "peca"
    for file in os.listdir(image_dir):
        if file.startswith("peca"):
            image_path = os.path.join(image_dir, file)
            return FileResponse(image_path)
    
    raise HTTPException(404, "Imagem não encontrada")

@router.get("/{group}/{piece}/report")
def get_report_data(
    group: str,
    piece: str,
    week: Optional[int] = Query(None),
    year: Optional[int] = Query(None)
):
    """
    Retorna dados agregados por semana para gerar o gráfico de relatório.
    """
    import pandas as pd
    from datetime import datetime

    group_safe = sanitize_piece_name(group)
    piece_safe = sanitize_piece_name(piece)

    analysis_dir = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "data", "groups", group_safe, "pieces", piece_safe, "analysis"
    )

    if not os.path.exists(analysis_dir):
        return {"weeks": []}

    #list all file of analysis disponíveis
    weeks_data = []

    for file in sorted(os.listdir(analysis_dir)):
        if file.startswith("analysis_") and file.endswith(".csv"):
            try:
                #extrai semana/ano do nome
                parts = file.replace("analysis_", "").replace(".csv", "").split("_")
                if len(parts) != 2:
                    continue

                file_year = int(parts[0])
                file_week = int(parts[1].replace("W", ""))

                #se semana/ano - filtra
                if week and year:
                    if file_week != week or file_year != year:
                        continue

                #carrega o CSV
                csv_path = os.path.join(analysis_dir, file)
                df = pd.read_csv(csv_path)

                #calcula estatísticas
                stats = calculate_statistics(df)

                if stats and "summary" in stats:
                    weeks_data.append({
                        "year": file_year,
                        "week": file_week,
                        "green": stats["summary"]["cg_green"],
                        "green_percent": stats["summary"]["cg_green_percent"],
                        "yellow": stats["summary"]["cg_yellow"],
                        "yellow_percent": stats["summary"]["cg_yellow_percent"],
                        "red": stats["summary"]["cg_red"],
                        "red_percent": stats["summary"]["cg_red_percent"],
                        "total": stats["summary"]["total_characteristics"]
                    })
            except Exception as e:
                print(f"Erro ao processar {file}: {e}")
                continue

    #ordena por ano/semana
    weeks_data.sort(key=lambda x: (x["year"], x["week"]))

    return {"weeks": weeks_data}
