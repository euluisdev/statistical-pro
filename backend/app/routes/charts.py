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


@router.get("/group/{group}/report")
def get_group_report_data(
    group: str,
    week: Optional[int] = Query(None),
    year: Optional[int] = Query(None)
):
    """
    Retorna dados agregados de CG de TODAS as peças do grupo.
    Soma os pontos verdes, amarelos e vermelhos de todas as peças.
    """
    import pandas as pd
    from datetime import datetime

    group_safe = sanitize_piece_name(group)
    
    # Pega todas as peças do grupo
    pieces_list = list_pieces(group)
    
    if not pieces_list:
        return {"weeks": [], "pieces": []}

    weeks_aggregate = {}  #{(year, week): {green: 0, yellow: 0, red: 0, total: 0}}

    # Para cada peça do grupo
    for piece_info in pieces_list:
        piece_number = piece_info["part_number"]
        piece_safe = sanitize_piece_name(piece_number)
        
        analysis_dir = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            "data", "groups", group_safe, "pieces", piece_safe, "analysis"
        )

        if not os.path.exists(analysis_dir):
            continue

        #para cada arquivo de análise da peça
        for file in os.listdir(analysis_dir):
            if file.startswith("analysis_") and file.endswith(".csv"):
                try:
                    parts = file.replace("analysis_", "").replace(".csv", "").split("_")
                    if len(parts) != 2:
                        continue

                    file_year = int(parts[0])
                    file_week = int(parts[1].replace("W", ""))

                    #se especificou filtro ele aplica
                    if week and year:
                        if file_week != week or file_year != year:
                            continue

                    csv_path = os.path.join(analysis_dir, file)
                    df = pd.read_csv(csv_path)

                    stats = calculate_statistics(df)

                    if stats and "summary" in stats:
                        key = (file_year, file_week)
                        
                        if key not in weeks_aggregate:
                            weeks_aggregate[key] = {
                                "year": file_year,
                                "week": file_week,
                                "green": 0,
                                "yellow": 0,
                                "red": 0,
                                "total": 0
                            }
                        
                        #soma os valores
                        weeks_aggregate[key]["green"] += stats["summary"]["cg_green"]
                        weeks_aggregate[key]["yellow"] += stats["summary"]["cg_yellow"]
                        weeks_aggregate[key]["red"] += stats["summary"]["cg_red"]
                        weeks_aggregate[key]["total"] += stats["summary"]["total_characteristics"]
                        
                except Exception as e:
                    print(f"Erro ao processar {file}: {e}")
                    continue

    #converte para lista e calcula percentuais
    weeks_data = []
    for data in weeks_aggregate.values():
        total = data["total"]
        if total > 0:
            data["green_percent"] = round((data["green"] / total) * 100, 2)
            data["yellow_percent"] = round((data["yellow"] / total) * 100, 2)
            data["red_percent"] = round((data["red"] / total) * 100, 2)
        else:
            data["green_percent"] = 0
            data["yellow_percent"] = 0
            data["red_percent"] = 0
        
        weeks_data.append(data)

    # Ordena por ano/semana
    weeks_data.sort(key=lambda x: (x["year"], x["week"]))

    return {
        "weeks": weeks_data,
        "pieces": [p["part_number"] for p in pieces_list],
        "total_pieces": len(pieces_list)
    }