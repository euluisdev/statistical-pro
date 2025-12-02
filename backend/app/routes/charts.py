from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse
import pandas as pd
from pydantic import BaseModel
from typing import Optional
import os 
from datetime import datetime
from app.services.pieces_service import(
    sanitize_piece_name, 
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