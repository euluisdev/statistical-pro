from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.services.groups_service import list_groups, create_group

router = APIRouter(prefix="/groups", tags=["groups"])

class CreateGroupReq(BaseModel):
    name: str

@router.get("", response_model=List[str])
def get_groups():
    return list_groups()

@router.post("", status_code=201)
def post_group(req: CreateGroupReq):
    try:
        ok, info = create_group(req.name)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not ok:
        raise HTTPException(status_code=409, detail=info)
    return {"created": info}
