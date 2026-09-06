from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Company, Job, User


router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.get("")
def list_jobs(
    location: str | None = Query(default=None),
    skills: str | None = Query(default=None),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Student access required")

    query = db.query(Job, Company, User).outerjoin(
        Company, Company.id == Job.company_id
    ).outerjoin(
        User, User.id == Company.user_id
    ).filter(
        func.lower(Job.status).in_(["active", "published"])
    )

    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    if skills:
        query = query.filter(Job.skills.ilike(f"%{skills}%"))

    return [
        {
            "id": job.id,
            "company_id": job.company_id,
            "title": job.title,
            "description": job.description,
            "location": job.location,
            "skills": job.skills,
            "salary": job.salary,
            "status": job.status,
            "created_at": job.created_at,
            "company": {
                "name": company_user.name if company_user else None,
                "location": company.location if company else None,
                "website": company.website if company else None,
            },
        }
        for job, company, company_user in query.order_by(Job.created_at.desc()).all()
    ]


@router.get("/{job_id}")
def get_job(
    job_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Student access required")
    row = db.query(Job, Company, User).outerjoin(
        Company, Company.id == Job.company_id
    ).outerjoin(
        User, User.id == Company.user_id
    ).filter(
        Job.id == job_id,
        func.lower(Job.status).in_(["active", "published"]),
    ).first()
    if row is None:
        raise HTTPException(status_code=404, detail="Active job not found")
    job, company, company_user = row
    return {
        "type": "job",
        "id": job.id,
        "company_id": job.company_id,
        "title": job.title,
        "description": job.description,
        "location": job.location,
        "skills": job.skills,
        "salary": job.salary,
        "status": job.status,
        "created_at": job.created_at,
        "company": {
            "name": company_user.name if company_user else None,
            "location": company.location if company else None,
            "website": company.website if company else None,
        },
    }