from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
import pandas as pd
from pydantic import BaseModel
from typing import Optional
import os 
from datetime import datetime
from app.services.pieces_service import(
    sanitize_piece_name, list_pieces, 
) 
from app.services.statistics_service import calculate_statistics

router = APIRouter(prefix="/pieces", tags=["pieces"])

@router.get("/{group}/{piece}/report/cp-cpk")
def get_cp_cpk_report_data(
    group: str,
    piece: str,
    week: Optional[int] = Query(None),
    year: Optional[int] = Query(None)
):
    """
    Retorna dados agregados de CP e CPK por semana para gráficos.
    """
    group_safe = sanitize_piece_name(group)
    piece_safe = sanitize_piece_name(piece)

    analysis_dir = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "data", "groups", group_safe, "pieces", piece_safe, "analysis"
    )

    if not os.path.exists(analysis_dir):
        return {"weeks": []}

    weeks_data = []

    for file in sorted(os.listdir(analysis_dir)):
        if file.startswith("analysis_") and file.endswith(".csv"):
            try:
                parts = file.replace("analysis_", "").replace(".csv", "").split("_")
                if len(parts) != 2:
                    continue

                file_year = int(parts[0])
                file_week = int(parts[1].replace("W", ""))

                if week and year:
                    if file_week != week or file_year != year:
                        continue

                csv_path = os.path.join(analysis_dir, file)
                df = pd.read_csv(csv_path)

                stats = calculate_statistics(df)

                if stats and "summary" in stats:
                    weeks_data.append({
                        "year": file_year,
                        "week": file_week,
                        # CP
                        "cp_green": stats["summary"]["cp_green"],
                        "cp_green_percent": stats["summary"]["cp_green_percent"],
                        "cp_yellow": stats["summary"]["cp_yellow"],
                        "cp_yellow_percent": stats["summary"]["cp_yellow_percent"],
                        "cp_red": stats["summary"]["cp_red"],
                        "cp_red_percent": stats["summary"]["cp_red_percent"],
                        # CPK
                        "cpk_green": stats["summary"]["cpk_green"],
                        "cpk_green_percent": stats["summary"]["cpk_green_percent"],
                        "cpk_yellow": stats["summary"]["cpk_yellow"],
                        "cpk_yellow_percent": stats["summary"]["cpk_yellow_percent"],
                        "cpk_red": stats["summary"]["cpk_red"],
                        "cpk_red_percent": stats["summary"]["cpk_red_percent"],
                        "total": stats["summary"]["total_characteristics"]
                    })
            except Exception as e:
                print(f"Erro ao processar {file}: {e}")
                continue

    weeks_data.sort(key=lambda x: (x["year"], x["week"]))

    return {"weeks": weeks_data}


#chart cg-general group
@router.post("/group/{group}/generate-week-report")
def generate_group_week_report(
    group: str,
    week: int = Query(..., description="Semana ISO (1-53)"),
    year: int = Query(..., description="Ano (ex: 2025)")
):
    """
    Gera relatório de uma semana específica para TODAS as peças do grupo.
    Soma os pontos CG de todas as peças da mesma semana.
    """
    import pandas as pd
    from datetime import datetime

    group_safe = sanitize_piece_name(group)
    
    # Pega todas as peças do grupo
    pieces_list = list_pieces(group)
    
    if not pieces_list:
        raise HTTPException(404, "Nenhuma peça encontrada no grupo")

    # Acumuladores para a semana
    total_green = 0
    total_yellow = 0
    total_red = 0
    total_points = 0
    pieces_processed = 0

    # Para cada peça do grupo
    for piece_info in pieces_list:
        piece_number = piece_info["part_number"]
        piece_safe = sanitize_piece_name(piece_number)
        
        try:
            # 1. Gera análise da semana para esta peça
            analysis_dir = os.path.join(
                os.path.dirname(os.path.dirname(__file__)),
                "data", "groups", group_safe, "pieces", piece_safe, "analysis"
            )
            os.makedirs(analysis_dir, exist_ok=True)

            csv_dir = os.path.join(
                os.path.dirname(os.path.dirname(__file__)),
                "data", "groups", group_safe, "pieces", piece_safe, "csv"
            )

            if not os.path.exists(csv_dir):
                continue

            filename = f"analysis_{year}_W{week:02d}.csv"
            analysis_path = os.path.join(analysis_dir, filename)

            # Lê todos os CSVs da peça
            dfs = []
            for file in os.listdir(csv_dir):
                if file.lower().endswith(".csv"):
                    try:
                        df = pd.read_csv(os.path.join(csv_dir, file))
                        df["Origem"] = file
                        dfs.append(df)
                    except:
                        continue

            if not dfs:
                continue

            df_total = pd.concat(dfs, ignore_index=True)
            df_total.to_csv(analysis_path, index=False)

            # 2. Calcula estatísticas desta peça
            stats = calculate_statistics(df_total)

            if stats and "summary" in stats:
                # Soma os valores
                total_green += stats["summary"]["cg_green"]
                total_yellow += stats["summary"]["cg_yellow"]
                total_red += stats["summary"]["cg_red"]
                total_points += stats["summary"]["total_characteristics"]
                pieces_processed += 1

        except Exception as e:
            print(f"Erro ao processar peça {piece_number}: {e}")
            continue

    if pieces_processed == 0:
        raise HTTPException(404, "Nenhuma peça foi processada")

    # Calcula percentuais
    green_percent = round((total_green / total_points) * 100, 2) if total_points > 0 else 0
    yellow_percent = round((total_yellow / total_points) * 100, 2) if total_points > 0 else 0
    red_percent = round((total_red / total_points) * 100, 2) if total_points > 0 else 0

    # Salva resultado agregado do grupo
    group_reports_dir = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "data", "groups", group_safe, "reports"
    )
    os.makedirs(group_reports_dir, exist_ok=True)

    report_filename = f"group_report_{year}_W{week:02d}.json"
    report_path = os.path.join(group_reports_dir, report_filename)

    import json
    report_data = {
        "year": year,
        "week": week,
        "green": total_green,
        "green_percent": green_percent,
        "yellow": total_yellow,
        "yellow_percent": yellow_percent,
        "red": total_red,
        "red_percent": red_percent,
        "total": total_points,
        "pieces_processed": pieces_processed,
        "generated_at": datetime.now().isoformat()
    }

    with open(report_path, "w") as f:
        json.dump(report_data, f, indent=2)

    return {
        "status": "ok",
        "week": week,
        "year": year,
        "pieces_processed": pieces_processed,
        "data": report_data
    }


@router.get("/group/{group}/reports")
def get_group_reports(group: str):
    """
    Lista todos os relatórios gerados do grupo.
    """
    import json
    
    group_safe = sanitize_piece_name(group)
    
    group_reports_dir = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "data", "groups", group_safe, "reports"
    )

    if not os.path.exists(group_reports_dir):
        return {"weeks": []}

    weeks_data = []

    for file in sorted(os.listdir(group_reports_dir)):
        if file.startswith("group_report_") and file.endswith(".json"):
            try:
                with open(os.path.join(group_reports_dir, file), "r") as f:
                    data = json.load(f)
                    weeks_data.append(data)
            except:
                continue

    # Ordena por ano/semana
    weeks_data.sort(key=lambda x: (x["year"], x["week"]))

    return {"weeks": weeks_data}

#cg for piece top five
@router.get("/group/{group}/pieces-report")
def get_group_pieces_report(
    group: str,
    week: int = Query(..., description="Semana ISO (1-53)"),
    year: int = Query(..., description="Ano (ex: 2025)")
):
    """
    Retorna CG de cada peça do grupo para uma semana específica.
    Usado para gráfico "CG Por Peça".
    """
    import pandas as pd

    group_safe = sanitize_piece_name(group)
    
    # Pega todas as peças do grupo
    pieces_list = list_pieces(group)
    
    if not pieces_list:
        return {"pieces": []}

    pieces_data = []

    # Para cada peça do grupo
    for piece_info in pieces_list:
        piece_number = piece_info["part_number"]
        piece_name = piece_info.get("part_name", piece_number)
        piece_safe = sanitize_piece_name(piece_number)
        
        try:
            # Caminho do analysis da semana
            analysis_dir = os.path.join(
                os.path.dirname(os.path.dirname(__file__)),
                "data", "groups", group_safe, "pieces", piece_safe, "analysis"
            )

            filename = f"analysis_{year}_W{week:02d}.csv"
            analysis_path = os.path.join(analysis_dir, filename)

            if not os.path.exists(analysis_path):
                continue

            # Lê e calcula estatísticas
            df = pd.read_csv(analysis_path)
            stats = calculate_statistics(df)

            if stats and "summary" in stats:
                # Caminho da imagem
                image_dir = os.path.join(
                    os.path.dirname(os.path.dirname(__file__)),
                    "data", "groups", group_safe, "pieces", piece_safe, "imagens"
                )
                
                image_filename = None
                if os.path.exists(image_dir):
                    for img_file in os.listdir(image_dir):
                        if img_file.startswith("peca"):
                            image_filename = img_file
                            break

                pieces_data.append({
                    "part_number": piece_number,
                    "part_name": piece_name,
                    "green": stats["summary"]["cg_green"],
                    "green_percent": stats["summary"]["cg_green_percent"],
                    "yellow": stats["summary"]["cg_yellow"],
                    "yellow_percent": stats["summary"]["cg_yellow_percent"],
                    "red": stats["summary"]["cg_red"],
                    "red_percent": stats["summary"]["cg_red_percent"],
                    "total": stats["summary"]["total_characteristics"],
                    "image": image_filename
                })
                
        except Exception as e:
            print(f"Erro ao processar peça {piece_number}: {e}")
            continue

    #ordem do pior desempenho (mais vermelho + amarelo)
    pieces_data.sort(key=lambda x: (x["red"], x["yellow"]), reverse=True)

    return {
        "pieces": pieces_data,
        "week": week,
        "year": year,
        "total_pieces": len(pieces_data)
    }  



#chart cp group
@router.post("/group/{group}/generate-week-cp-report")
def generate_group_week_cp_report(
    group: str,
    week: int = Query(..., description="Semana ISO (1-53)"),
    year: int = Query(..., description="Ano (ex: 2025)")
):
    """
    Gera relatório CP de uma semana específica para TODAS as peças do grupo.
    Soma os pontos CP de todas as peças da mesma semana.
    """
    import pandas as pd
    from datetime import datetime

    group_safe = sanitize_piece_name(group)
    
    pieces_list = list_pieces(group)
    
    if not pieces_list:
        raise HTTPException(404, "Nenhuma peça encontrada no grupo")

    total_green = 0
    total_yellow = 0
    total_red = 0
    total_points = 0
    pieces_processed = 0

    for piece_info in pieces_list:
        piece_number = piece_info["part_number"]
        piece_safe = sanitize_piece_name(piece_number)
        
        try:
            analysis_dir = os.path.join(
                os.path.dirname(os.path.dirname(__file__)),
                "data", "groups", group_safe, "pieces", piece_safe, "analysis"
            )
            os.makedirs(analysis_dir, exist_ok=True)

            csv_dir = os.path.join(
                os.path.dirname(os.path.dirname(__file__)),
                "data", "groups", group_safe, "pieces", piece_safe, "csv"
            )

            if not os.path.exists(csv_dir):
                continue

            filename = f"analysis_{year}_W{week:02d}.csv"
            analysis_path = os.path.join(analysis_dir, filename)

            dfs = []
            for file in os.listdir(csv_dir):
                if file.lower().endswith(".csv"):
                    try:
                        df = pd.read_csv(os.path.join(csv_dir, file))
                        df["Origem"] = file
                        dfs.append(df)
                    except:
                        continue

            if not dfs:
                continue

            df_total = pd.concat(dfs, ignore_index=True)
            df_total.to_csv(analysis_path, index=False)

            stats = calculate_statistics(df_total)

            if stats and "summary" in stats:
                total_green += stats["summary"]["cp_green"]
                total_yellow += stats["summary"]["cp_yellow"]
                total_red += stats["summary"]["cp_red"]
                total_points += stats["summary"]["total_characteristics"]
                pieces_processed += 1

        except Exception as e:
            print(f"Erro ao processar peça {piece_number}: {e}")
            continue

    if pieces_processed == 0:
        raise HTTPException(404, "Nenhuma peça foi processada")

    green_percent = round((total_green / total_points) * 100, 2) if total_points > 0 else 0
    yellow_percent = round((total_yellow / total_points) * 100, 2) if total_points > 0 else 0
    red_percent = round((total_red / total_points) * 100, 2) if total_points > 0 else 0

    group_reports_dir = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "data", "groups", group_safe, "reports_cp"
    )
    os.makedirs(group_reports_dir, exist_ok=True)

    report_filename = f"group_cp_report_{year}_W{week:02d}.json"
    report_path = os.path.join(group_reports_dir, report_filename)

    import json
    report_data = {
        "year": year,
        "week": week,
        "green": total_green,
        "green_percent": green_percent,
        "yellow": total_yellow,
        "yellow_percent": yellow_percent,
        "red": total_red,
        "red_percent": red_percent,
        "total": total_points,
        "pieces_processed": pieces_processed,
        "generated_at": datetime.now().isoformat()
    }

    with open(report_path, "w") as f:
        json.dump(report_data, f, indent=2)

    return {
        "status": "ok",
        "week": week,
        "year": year,
        "pieces_processed": pieces_processed,
        "data": report_data
    }

#cp from group
@router.get("/group/{group}/cp-reports")
def get_group_cp_reports(group: str):
    """
    Lista todos os relatórios CP gerados do grupo.
    """
    import json
    
    group_safe = sanitize_piece_name(group)
    
    group_reports_dir = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "data", "groups", group_safe, "reports_cp"
    )

    if not os.path.exists(group_reports_dir):
        return {"weeks": []}

    weeks_data = []

    for file in sorted(os.listdir(group_reports_dir)):
        if file.startswith("group_cp_report_") and file.endswith(".json"):
            try:
                with open(os.path.join(group_reports_dir, file), "r") as f:
                    data = json.load(f)
                    weeks_data.append(data)
            except:
                continue

    weeks_data.sort(key=lambda x: (x["year"], x["week"]))

    return {"weeks": weeks_data}


@router.get("/group/{group}/pieces-cp-report")
def get_group_pieces_cp_report(
    group: str,
    week: int = Query(..., description="Semana ISO (1-53)"),
    year: int = Query(..., description="Ano (ex: 2025)")
):
    """
    Retorna CP de cada peça do grupo para uma semana específica.
    Usado para gráfico "CP Por Peça".
    """
    import pandas as pd

    group_safe = sanitize_piece_name(group)
    
    pieces_list = list_pieces(group)
    
    if not pieces_list:
        return {"pieces": []}

    pieces_data = []

    for piece_info in pieces_list:
        piece_number = piece_info["part_number"]
        piece_name = piece_info.get("part_name", piece_number)
        piece_safe = sanitize_piece_name(piece_number)
        
        try:
            analysis_dir = os.path.join(
                os.path.dirname(os.path.dirname(__file__)),
                "data", "groups", group_safe, "pieces", piece_safe, "analysis"
            )

            filename = f"analysis_{year}_W{week:02d}.csv"
            analysis_path = os.path.join(analysis_dir, filename)

            if not os.path.exists(analysis_path):
                continue

            df = pd.read_csv(analysis_path)
            stats = calculate_statistics(df)

            if stats and "summary" in stats:
                image_dir = os.path.join(
                    os.path.dirname(os.path.dirname(__file__)),
                    "data", "groups", group_safe, "pieces", piece_safe, "imagens"
                )
                
                image_filename = None
                if os.path.exists(image_dir):
                    for img_file in os.listdir(image_dir):
                        if img_file.startswith("peca"):
                            image_filename = img_file
                            break

                pieces_data.append({
                    "part_number": piece_number,
                    "part_name": piece_name,
                    "green": stats["summary"]["cp_green"],
                    "green_percent": stats["summary"]["cp_green_percent"],
                    "yellow": stats["summary"]["cp_yellow"],
                    "yellow_percent": stats["summary"]["cp_yellow_percent"],
                    "red": stats["summary"]["cp_red"],
                    "red_percent": stats["summary"]["cp_red_percent"],
                    "total": stats["summary"]["total_characteristics"],
                    "image": image_filename
                })
                
        except Exception as e:
            print(f"Erro ao processar peça {piece_number}: {e}")
            continue

    pieces_data.sort(key=lambda x: (x["red"], x["yellow"]), reverse=True)

    return {
        "pieces": pieces_data,
        "week": week,
        "year": year,
        "total_pieces": len(pieces_data)
    }  
 
  