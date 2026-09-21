from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import (
    Application,
    Company,
    Internship,
    Job,
    Student,
    User,
    Notification,
)


router = APIRouter(prefix="/applications", tags=["Applications"])


class ApplicationCreate(BaseModel):
    job_id: int | None = None
    internship_id: int | None = None


def _student_id(current_user, db: Session) -> int:
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Student access required")
    student = db.query(Student.id).filter(
        Student.user_id == current_user["user_id"]
    ).scalar()
    if student is None:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student


def _company_details(company, company_user):
    return {
        "name": company_user.name if company_user else None,
        "location": company.location if company else None,
        "website": company.website if company else None,
    }


def _application_response(application, opportunity, company, company_user, opportunity_type):
    return {
        "id": application.id,
        "type": opportunity_type,
        "opportunity_id": opportunity.id if opportunity else None,
        "opportunity_title": opportunity.title if opportunity else None,
        "company": _company_details(company, company_user),
        "location": opportunity.location if opportunity else None,
        "status": application.status,
        "created_at": application.created_at,
        "job_id": application.job_id,
        "internship_id": application.internship_id,
    }


@router.post("")
def create_application(
    payload: ApplicationCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student_id = _student_id(current_user, db)

    if (payload.job_id is None) == (payload.internship_id is None):
        raise HTTPException(
            status_code=422,
            detail="Provide exactly one of job_id or internship_id",
        )

    if payload.job_id is not None:
        opportunity = db.query(Job).filter(
            Job.id == payload.job_id,
            func.lower(Job.status).in_(["active", "published"]),
        ).first()

        if opportunity is None:
            raise HTTPException(
                status_code=404,
                detail="Active job not found",
            )

        duplicate_filter = Application.job_id == payload.job_id

    else:
        opportunity = db.query(Internship).filter(
            Internship.id == payload.internship_id,
            func.lower(Internship.status).in_(["active", "published"]),
        ).first()

        if opportunity is None:
            raise HTTPException(
                status_code=404,
                detail="Active internship not found",
            )

        duplicate_filter = Application.internship_id == payload.internship_id

    duplicate = db.query(Application.id).filter(
        Application.student_id == student_id,
        duplicate_filter,
    ).first()

    if duplicate:
        raise HTTPException(
            status_code=409,
            detail="You have already applied to this opportunity",
        )

    application = Application(
        student_id=student_id,
        job_id=payload.job_id,
        internship_id=payload.internship_id,
        status="pending",
        created_at=datetime.now(timezone.utc),
    )

    db.add(application)
    db.flush()

    notification = Notification(
        user_id=current_user["user_id"],
        title="Application Submitted",
        message=f"Your application for {opportunity.title} has been submitted successfully.",
        notification_type="success",
    )

    db.add(notification)
    db.commit()
    db.refresh(application)

    return {
        "message": "Application submitted successfully",
        "application": {
            "id": application.id,
            "type": "job" if application.job_id else "internship",
            "opportunity_id": application.job_id or application.internship_id,
            "status": application.status,
            "created_at": application.created_at,
        },
    }

@router.get("")
def list_applications(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student_id = _student_id(current_user, db)
    applications = db.query(Application).filter(
        Application.student_id == student_id
    ).order_by(Application.created_at.desc(), Application.id.desc()).all()
    result = []
    for application in applications:
        if application.job_id:
            row = db.query(Job, Company, User).outerjoin(
                Company, Company.id == Job.company_id
            ).outerjoin(
                User, User.id == Company.user_id
            ).filter(Job.id == application.job_id).first()
            opportunity, company, company_user = row or (None, None, None)
            result.append(_application_response(application, opportunity, company, company_user, "job"))
        else:
            row = db.query(Internship, Company, User).outerjoin(
                Company, Company.id == Internship.company_id
            ).outerjoin(
                User, User.id == Company.user_id
            ).filter(Internship.id == application.internship_id).first()
            opportunity, company, company_user = row or (None, None, None)
            result.append(_application_response(application, opportunity, company, company_user, "internship"))
    return result


@router.get("/{application_id}")
def get_application(
    application_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    student_id = _student_id(current_user, db)
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.student_id == student_id,
    ).first()
    if application is None:
        raise HTTPException(status_code=404, detail="Application not found")

    if application.job_id:
        row = db.query(Job, Company, User).outerjoin(
            Company, Company.id == Job.company_id
        ).outerjoin(
            User, User.id == Company.user_id
        ).filter(Job.id == application.job_id).first()
        opportunity, company, company_user = row or (None, None, None)
        return _application_response(application, opportunity, company, company_user, "job")

    row = db.query(Internship, Company, User).outerjoin(
        Company, Company.id == Internship.company_id
    ).outerjoin(
        User, User.id == Company.user_id
    ).filter(Internship.id == application.internship_id).first()
    opportunity, company, company_user = row or (None, None, None)
    return _application_response(application, opportunity, company, company_user, "internship")