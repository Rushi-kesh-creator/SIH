from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import User


router = APIRouter(prefix="/academicians", tags=["Academicians"])


class AcademicianProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1)


def _get_academician(current_user, db: Session):
    if current_user["role"] != "academician":
        raise HTTPException(status_code=403, detail="Academician access required")
    user = db.query(User).filter(
        User.id == current_user["user_id"],
        User.role == "academician",
    ).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Academician profile not found")
    return user


def _profile_response(user):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "profile_completion": int(bool(user.name)) + int(bool(user.email)),
        "profile_fields_available": 2,
    }


@router.get("/profile")
def get_academician_profile(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _profile_response(_get_academician(current_user, db))


@router.put("/profile")
def update_academician_profile(
    profile: AcademicianProfileUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = _get_academician(current_user, db)
    if profile.name is not None:
        user.name = profile.name
    db.commit()
    db.refresh(user)
    return _profile_response(user)


@router.get("/dashboard")
def get_academician_dashboard(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = _get_academician(current_user, db)
    return {
        "academician": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
        },
        "profile_completion": {
            "completed": int(bool(user.name)) + int(bool(user.email)),
            "available": 2,
        },
        "statistics": {},
        "message": "No academician-specific records are available in the current database schema.",
    }