from io import BytesIO
import sys
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import func, or_
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models import (
    Application,
    Certification,
    Internship,
    Job,
    Student,
    StudentProject,
    StudentSkill,
    User,
)
from auth import get_current_user
from storage import (
    create_resume_signed_url,
    delete_resume,
    resume_filename,
    save_resume,
)

project_root = str(Path(__file__).resolve().parents[2])
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from ml.resume_matcher.pdf_parser import extract_text_from_pdf

router = APIRouter(prefix="/students", tags=["Students"])

MAX_RESUME_SIZE = 5 * 1024 * 1024


class StudentProfile(BaseModel):
    phone: str | None = None
    college: str | None = None
    degree: str | None = None
    branch: str | None = None
    graduation_year: int | None = None
    cgpa: float | None = None
    bio: str | None = None
    resume_url: str | None = None


@router.post("/profile/resume")
async def upload_resume(
    resume: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Student access required")

    filename = resume.filename or ""
    if not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF resumes are accepted")
    if resume.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Resume content type must be application/pdf")

    content = await resume.read(MAX_RESUME_SIZE + 1)
    if not content:
        raise HTTPException(status_code=400, detail="The uploaded resume is empty")
    if len(content) > MAX_RESUME_SIZE:
        raise HTTPException(status_code=400, detail="Resume must be 5 MB or smaller")
    if not content.startswith(b"%PDF-"):
        raise HTTPException(status_code=400, detail="The uploaded file is not a valid PDF")

    try:
        extracted_text = extract_text_from_pdf(BytesIO(content))
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Could not extract resume text: {exc}") from exc

    student = db.query(Student).filter(
        Student.user_id == current_user["user_id"]
    ).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")

    previous_resume_url = student.resume_url
    try:
        resume_url = save_resume(student.id, filename, content)
        student.resume_url = resume_url
        db.commit()
    except Exception as exc:
        db.rollback()
        try:
            if "resume_url" in locals():
                delete_resume(resume_url)
        except Exception:
            pass
        raise HTTPException(status_code=503, detail="Resume storage is unavailable") from exc

    if previous_resume_url and previous_resume_url != resume_url:
        try:
            delete_resume(previous_resume_url)
        except Exception:
            pass

    try:
        signed_url = create_resume_signed_url(resume_url)
    except (RuntimeError, ValueError, KeyError):
        signed_url = None

    return {
        "message": "Resume uploaded successfully",
        "resume_url": resume_url,
        "signed_url": signed_url,
        "extracted_text_available": bool(extracted_text.strip()),
        "filename": filename,
    }


@router.get("/profile/resume-url")
def get_resume_url(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Student access required")

    student = db.query(Student).filter(
        Student.user_id == current_user["user_id"]
    ).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    if not student.resume_url:
        raise HTTPException(status_code=404, detail="No resume uploaded")

    try:
        signed_url = create_resume_signed_url(student.resume_url)
    except (RuntimeError, ValueError, KeyError) as exc:
        raise HTTPException(status_code=503, detail="Resume storage is unavailable") from exc

    return {
        "resume_url": student.resume_url,
        "signed_url": signed_url,
        "filename": resume_filename(student.resume_url),
    }


@router.get("/dashboard")
def get_dashboard(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Student access required")

    student_record = db.query(Student, User.name).join(
        User, User.id == Student.user_id
    ).filter(
        Student.user_id == current_user["user_id"]
    ).first()

    if not student_record:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )

    student, student_name = student_record
    student_id = student.id

    def application_count(*filters):
        query = db.query(func.count(Application.id)).filter(
            Application.student_id == student_id,
            *filters
        )
        return query.scalar() or 0

    recent_applications = db.query(
        Application,
        Job.title.label("job_title"),
        Internship.title.label("internship_title")
    ).outerjoin(
        Job, Job.id == Application.job_id
    ).outerjoin(
        Internship, Internship.id == Application.internship_id
    ).filter(
        Application.student_id == student_id
    ).order_by(
        Application.created_at.desc(), Application.id.desc()
    ).limit(5).all()

    return {
        "student": {
            "name": student_name,
            "college": student.college,
            "degree": student.degree,
            "branch": student.branch,
            "cgpa": student.cgpa,
        },
        "counts": {
            "skills": db.query(func.count(StudentSkill.skill_id)).filter(
                StudentSkill.student_id == student_id
            ).scalar() or 0,
            "certifications": db.query(func.count(Certification.id)).filter(
                Certification.student_id == student_id
            ).scalar() or 0,
            "projects": db.query(func.count(StudentProject.id)).filter(
                StudentProject.student_id == student_id
            ).scalar() or 0,
            "applications": application_count(),
            "pending_applications": application_count(
                func.lower(Application.status) == "pending"
            ),
            "accepted_applications": application_count(
                func.lower(Application.status) == "accepted"
            ),
            "rejected_applications": application_count(
                func.lower(Application.status) == "rejected"
            ),
            "internship_applications": application_count(
                Application.internship_id.isnot(None)
            ),
            "job_applications": application_count(
                Application.job_id.isnot(None)
            ),
        },
        "recent_applications": [
            {
                "id": application.id,
                "type": "internship" if application.internship_id else "job",
                "opportunity_id": application.internship_id or application.job_id,
                "title": internship_title or job_title,
                "status": application.status,
                "created_at": application.created_at,
            }
            for application, job_title, internship_title in recent_applications
        ],
    }


@router.get("/profile")
def get_profile(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Student access required")

    student = db.query(Student).filter(
        Student.user_id == current_user["user_id"]
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )

    return student


@router.put("/profile")
def update_profile(
    profile: StudentProfile,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Student access required")

    student = db.query(Student).filter(
        Student.user_id == current_user["user_id"]
    ).first()

    if not student:
        student = Student(
            user_id=current_user["user_id"]
        )
        db.add(student)

    for field, value in profile.model_dump(exclude_unset=True).items():
        setattr(student, field, value)

    db.commit()
    db.refresh(student)

    return {
        "message": "Student profile updated successfully",
        "profile": student
    }