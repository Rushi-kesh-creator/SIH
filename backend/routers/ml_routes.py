import sys
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from auth import get_current_user

project_root = str(Path(__file__).resolve().parents[2])
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from ml.resume_matcher import match_resume_to_opportunity


router = APIRouter(prefix="/ml", tags=["Machine Learning"])


class MatchAnalysisRequest(BaseModel):
    resume_text: str = Field(min_length=1)
    opportunity_text: str = Field(min_length=1)


@router.post("/analyze")
def analyze_match(
    request: MatchAnalysisRequest,
    current_user=Depends(get_current_user),
):
    del current_user
    try:
        return match_resume_to_opportunity(
            request.resume_text,
            request.opportunity_text,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc