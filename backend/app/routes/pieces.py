from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List

from app.services.pieces_service import list_pieces, create_piece

router = APIRouter(prefix="/pieces", tags=["pieces"])

class CreatePieceReq(BaseModel):
    group: str
    part_number: str
    part_name: str
    model: str

@router.get("/{group}", response_model=List[str])
def get_pieces(group: str):
    """Lista as peças dentro de um grupo."""
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
