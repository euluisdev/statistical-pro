from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import List

import os 
import shutil 

from app.services.pieces_service import list_pieces, create_piece, delete_piece, ensure_piece_dirs, sanitize_piece_name

router = APIRouter(prefix="/pieces", tags=["pieces"])

class CreatePieceReq(BaseModel):
    group: str
    part_number: str
    part_name: str
    model: str

@router.get("/{group}", response_model=List[dict])
def get_pieces(group: str):
    return list_pieces(group)


@router.post("", status_code=201)
def post_piece(req: CreatePieceReq):
    try:
        ok, info = create_piece(
            req.group,
            req.part_number,
            req.part_name,
            req.model
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not ok:
        raise HTTPException(status_code=409, detail=info)

    return {"created": info}

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

    # garante pastas
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
