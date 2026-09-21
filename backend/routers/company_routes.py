from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Application, Company, Internship, Job, Student, User


COMPANY_ROLES = {"company",}
router = APIRouter(prefix="/companies", tags=["Companies"])


class CompanyProfileUpdate(BaseModel):
    website: str | None = None
    description: str | None = None
    location: str | None = None


VALID_OPPORTUNITY_STATUSES = {"active", "published", "closed", "inactive"}


class ApplicationStatusUpdate(BaseModel):
    status: str


class InternshipCreate(BaseModel):
    title: str = Field(min_length=1)
    description: str = Field(min_length=1)
    location: str = Field(min_length=1)
    skills: str = Field(min_length=1)
    duration: str | None = None
    stipend: str | None = None
    status: str = "active"


class InternshipUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1)
    description: str | None = Field(default=None, min_length=1)
    location: str | None = Field(default=None, min_length=1)
    skills: str | None = Field(default=None, min_length=1)
    duration: str | None = None
    stipend: str | None = None
    status: str | None = None


class JobCreate(BaseModel):
    title: str = Field(min_length=1)
    description: str = Field(min_length=1)
    location: str = Field(min_length=1)
    skills: str = Field(min_length=1)
    salary: str | None = None
    status: str = "active"


class JobUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1)
    description: str | None = Field(default=None, min_length=1)
    location: str | None = Field(default=None, min_length=1)
    skills: str | None = Field(default=None, min_length=1)
    salary: str | None = None
    status: str | None = None


def _validate_status(status: str):
    if status not in VALID_OPPORTUNITY_STATUSES:
        raise HTTPException(status_code=422, detail="Invalid opportunity status")


def _internship_response(internship):
    return {
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
    }


def _job_response(job):
    return {
        "id": job.id,
        "company_id": job.company_id,
        "title": job.title,
        "description": job.description,
        "location": job.location,
        "skills": job.skills,
        "salary": job.salary,
        "status": job.status,
        "created_at": job.created_at,
    }


def _company_application(application, student, student_user, opportunity, opportunity_type, resume_url=None):
    return {
        "application_id": application.id,
        "opportunity_type": opportunity_type,
        "opportunity_id": opportunity.id,
        "opportunity_title": opportunity.title,
        "student_id": student.id,
        "student_name": student_user.name,
        "student_email": student_user.email,
        "student_phone": student.phone,
        "student_college": student.college,
        "student_degree": student.degree,
        "student_branch": student.branch,
        "student_graduation_year": student.graduation_year,
        "student_cgpa": student.cgpa,
        "application_status": application.status,
        "applied_at": application.created_at,
        "resume_url": resume_url,
    }


def _company_application_row(application_id, company_id, db: Session):
    row = db.query(Application, Student, User, Job, Internship).join(
        Student, Student.id == Application.student_id
    ).join(
        User, User.id == Student.user_id
    ).outerjoin(
        Job, Job.id == Application.job_id
    ).outerjoin(
        Internship, Internship.id == Application.internship_id
    ).filter(
        Application.id == application_id,
        or_(Job.company_id == company_id, Internship.company_id == company_id),
    ).first()
    if row is None:
        raise HTTPException(status_code=404, detail="Application not found")
    application, student, student_user, job, internship = row
    if job is not None:
        return application, student, student_user, job, "job"
    return application, student, student_user, internship, "internship"


def _get_company(current_user, db: Session):
    if current_user["role"] not in COMPANY_ROLES:
        raise HTTPException(status_code=403, detail="Company access required")
    row = db.query(Company, User).join(
        User, User.id == Company.user_id
    ).filter(
        Company.user_id == current_user["user_id"]
    ).first()
    if row is None:
        raise HTTPException(status_code=404, detail="Company profile not found")
    return row


def _profile_response(company, user):
    return {
        "id": company.id,
        "user_id": company.user_id,
        "name": user.name,
        "email": user.email,
        "website": company.website,
        "description": company.description,
        "location": company.location,
    }


@router.get("/profile")
def get_company_profile(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    company, user = _get_company(current_user, db)
    return _profile_response(company, user)


@router.put("/profile")
def update_company_profile(
    profile: CompanyProfileUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    company, user = _get_company(current_user, db)
    for field, value in profile.model_dump(exclude_unset=True).items():
        setattr(company, field, value)
    db.commit()
    db.refresh(company)
    return _profile_response(company, user)


@router.get("/dashboard")
def get_company_dashboard(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    company, user = _get_company(current_user, db)
    internship_count = db.query(func.count(Internship.id)).filter(
        Internship.company_id == company.id
    )
    job_count = db.query(func.count(Job.id)).filter(Job.company_id == company.id)
    company_applications = db.query(Application.id).outerjoin(
        Job, Job.id == Application.job_id
    ).outerjoin(
        Internship, Internship.id == Application.internship_id
    ).filter(
        or_(Job.company_id == company.id, Internship.company_id == company.id)
    )

    def application_count(*filters):
        return company_applications.filter(*filters).with_entities(
            func.count(Application.id)
        ).scalar() or 0

    return {
        "company": {
            "id": company.id,
            "name": user.name,
            "email": user.email,
            "location": company.location,
        },
        "statistics": {
            "total_internships": internship_count.scalar() or 0,
            "active_internships": internship_count.filter(
                func.lower(Internship.status).in_(["active", "published"])
            ).scalar() or 0,
            "total_jobs": job_count.scalar() or 0,
            "active_jobs": job_count.filter(
                func.lower(Job.status).in_(["active", "published"])
            ).scalar() or 0,
            "total_applications": application_count(),
            "pending_applications": application_count(
                func.lower(Application.status) == "pending"
            ),
            "accepted_applications": application_count(
                func.lower(Application.status) == "accepted"
            ),
            "rejected_applications": application_count(
                func.lower(Application.status) == "rejected"
            ),
        },
    }


@router.get("/internships")
def list_company_internships(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    company, _ = _get_company(current_user, db)
    return [
        _internship_response(internship)
        for internship in db.query(Internship).filter(
            Internship.company_id == company.id
        ).order_by(Internship.created_at.desc(), Internship.id.desc()).all()
    ]


@router.post("/internships", status_code=201)
def create_company_internship(
    payload: InternshipCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    company, _ = _get_company(current_user, db)
    _validate_status(payload.status)
    internship = Internship(company_id=company.id, **payload.model_dump())
    db.add(internship)
    db.commit()
    db.refresh(internship)
    return _internship_response(internship)


@router.put("/internships/{internship_id}")
def update_company_internship(
    internship_id: int,
    payload: InternshipUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    company, _ = _get_company(current_user, db)
    internship = db.query(Internship).filter(
        Internship.id == internship_id,
        Internship.company_id == company.id,
    ).first()
    if internship is None:
        raise HTTPException(status_code=404, detail="Internship not found")
    values = payload.model_dump(exclude_unset=True)
    if "status" in values:
        _validate_status(values["status"])
    for field, value in values.items():
        setattr(internship, field, value)
    db.commit()
    db.refresh(internship)
    return _internship_response(internship)


@router.delete("/internships/{internship_id}")
def close_company_internship(
    internship_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    company, _ = _get_company(current_user, db)
    internship = db.query(Internship).filter(
        Internship.id == internship_id,
        Internship.company_id == company.id,
    ).first()
    if internship is None:
        raise HTTPException(status_code=404, detail="Internship not found")
    internship.status = "closed"
    db.commit()
    db.refresh(internship)
    return _internship_response(internship)


@router.get("/jobs")
def list_company_jobs(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    company, _ = _get_company(current_user, db)
    return [
        _job_response(job)
        for job in db.query(Job).filter(
            Job.company_id == company.id
        ).order_by(Job.created_at.desc(), Job.id.desc()).all()
    ]


@router.post("/jobs", status_code=201)
def create_company_job(
    payload: JobCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    company, _ = _get_company(current_user, db)
    _validate_status(payload.status)
    job = Job(company_id=company.id, **payload.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    return _job_response(job)


@router.put("/jobs/{job_id}")
def update_company_job(
    job_id: int,
    payload: JobUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    company, _ = _get_company(current_user, db)
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.company_id == company.id,
    ).first()
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    values = payload.model_dump(exclude_unset=True)
    if "status" in values:
        _validate_status(values["status"])
    for field, value in values.items():
        setattr(job, field, value)
    db.commit()
    db.refresh(job)
    return _job_response(job)


@router.delete("/jobs/{job_id}")
def close_company_job(
    job_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    company, _ = _get_company(current_user, db)
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.company_id == company.id,
    ).first()
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    job.status = "closed"
    db.commit()
    db.refresh(job)
    return _job_response(job)


@router.get("/applications")
def list_company_applications(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    company, _ = _get_company(current_user, db)
    rows = db.query(Application, Student, User, Job, Internship).join(
        Student, Student.id == Application.student_id
    ).join(
        User, User.id == Student.user_id
    ).outerjoin(
        Job, Job.id == Application.job_id
    ).outerjoin(
        Internship, Internship.id == Application.internship_id
    ).filter(
        or_(Job.company_id == company.id, Internship.company_id == company.id)
    ).order_by(Application.created_at.desc(), Application.id.desc()).all()
    return [
        _company_application(
            application,
            student,
            student_user,
            job or internship,
            "job" if job else "internship",
            student.resume_url,
        )
        for application, student, student_user, job, internship in rows
    ]


@router.get("/applications/{application_id}")
def get_company_application(
    application_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    company, _ = _get_company(current_user, db)
    application, student, student_user, opportunity, opportunity_type = _company_application_row(
        application_id, company.id, db
    )
    resume_signed_url = None
    if student.resume_url:
        try:
            from storage import create_resume_signed_url

            resume_signed_url = create_resume_signed_url(student.resume_url)
        except (RuntimeError, ValueError, KeyError):
            resume_signed_url = None
    response = _company_application(
        application,
        student,
        student_user,
        opportunity,
        opportunity_type,
        student.resume_url,
    )
    response["resume_signed_url"] = resume_signed_url
    response["student_bio"] = student.bio
    response["opportunity"] = {
        "title": opportunity.title,
        "type": opportunity_type,
        "location": opportunity.location,
        "skills": opportunity.skills,
        "description": opportunity.description,
        "duration": opportunity.duration if opportunity_type == "internship" else None,
        "stipend": opportunity.stipend if opportunity_type == "internship" else None,
        "salary": opportunity.salary if opportunity_type == "job" else None,
    }
    return response


@router.put("/applications/{application_id}/status")
def update_company_application_status(
    application_id: int,
    payload: ApplicationStatusUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    company, _ = _get_company(current_user, db)
    if payload.status not in {"pending", "accepted", "rejected"}:
        raise HTTPException(status_code=422, detail="Invalid application status")
    application, student, student_user, opportunity, opportunity_type = _company_application_row(
        application_id, company.id, db
    )
    if application.status != "pending" and payload.status != application.status:
        raise HTTPException(status_code=409, detail="Only pending applications can change status")
    application.status = payload.status
    db.commit()
    db.refresh(application)
    return {
        "application_id": application.id,
        "application_status": application.status,
        "opportunity_type": opportunity_type,
        "opportunity_id": opportunity.id,
    }