from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Company, Internship, User


router = APIRouter(prefix="/internships", tags=["Internships"])


@router.get("")
def list_internships(
    location: str | None = Query(default=None),
    skills: str | None = Query(default=None),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Student access required")

    query = db.query(Internship, Company, User).outerjoin(
        Company, Company.id == Internship.company_id
    ).outerjoin(
        User, User.id == Company.user_id
    ).filter(
        func.lower(Internship.status).in_(["active", "published"])
    )

    if location:
        query = query.filter(Internship.location.ilike(f"%{location}%"))
    if skills:
        query = query.filter(Internship.skills.ilike(f"%{skills}%"))

    return [
        {
            "id": internship.id,
            "company_id": internship.company_id,
            "title": internship.title,
            "description": internship.description,
            "location": internship.location,
            "skills": internship.skills,
            "duration": internship.duration,
            "stipend": internship.stipend,
            "status": internship.status,
            "created_at": internship.created_at,
            "company": {
                "name": company_user.name if company_user else None,
                "location": company.location if company else None,
                "website": company.website if company else None,
            },
        }
        for internship, company, company_user in query.order_by(Internship.created_at.desc()).all()
    ]


@router.get("/{internship_id}")
def get_internship(
    internship_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Student access required")
    row = db.query(Internship, Company, User).outerjoin(
        Company, Company.id == Internship.company_id
    ).outerjoin(
        User, User.id == Company.user_id
    ).filter(
        Internship.id == internship_id,
        func.lower(Internship.status).in_(["active", "published"]),
    ).first()
    if row is None:
        raise HTTPException(status_code=404, detail="Active internship not found")
    internship, company, company_user = row
    return {
        "type": "internship",
        "id": internship.id,
        "company_id": internship.company_id,
        "title": internship.title,
        "description": internship.description,
        "location": internship.location,
        "skills": internship.skills,
        "duration": internship.duration,
        "stipend": internship.stipend,
        "status": internship.status,
        "created_at": internship.created_at,
        "company": {
            "name": company_user.name if company_user else None,
            "location": company.location if company else None,
            "website": company.website if company else None,
        },
    }