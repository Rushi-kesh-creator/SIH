from io import BytesIO
import sys
from pathlib import Path
from datetime import date

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
    Skill,
    Notification,
)

from auth import get_current_user

from storage import (
    create_resume_signed_url,
    delete_resume,
    resume_filename,
    save_resume,
    read_resume,
)

project_root = str(Path(__file__).resolve().parents[2])

if project_root not in sys.path:
    sys.path.insert(0, project_root)

from ml.resume_matcher.pdf_parser import extract_text_from_pdf


router = APIRouter(prefix="/students", tags=["Students"])


MAX_RESUME_SIZE = 5 * 1024 * 1024


# ============================================================
# STUDENT PROFILE
# ============================================================

class StudentProfile(BaseModel):
    phone: str | None = None
    college: str | None = None
    degree: str | None = None
    branch: str | None = None
    graduation_year: int | None = None
    cgpa: float | None = None
    bio: str | None = None
    resume_url: str | None = None


# ============================================================
# UPLOAD RESUME
# ============================================================

@router.post("/profile/resume")
async def upload_resume(
    resume: UploadFile = File(...),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=403,
            detail="Student access required"
        )

    filename = resume.filename or ""

    if not filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF resumes are accepted"
        )

    if resume.content_type != "application/pdf":
        raise HTTPException(
            status_code=400,
            detail="Resume content type must be application/pdf"
        )

    content = await resume.read(MAX_RESUME_SIZE + 1)

    if not content:
        raise HTTPException(
            status_code=400,
            detail="The uploaded resume is empty"
        )

    if len(content) > MAX_RESUME_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Resume must be 5 MB or smaller"
        )

    if not content.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is not a valid PDF"
        )

    try:
        extracted_text = extract_text_from_pdf(
            BytesIO(content)
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Could not extract resume text: {exc}"
        ) from exc

    student = db.query(Student).filter(
        Student.user_id == current_user["user_id"]
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )

    previous_resume_url = student.resume_url

    try:
        resume_url = save_resume(
            student.id,
            filename,
            content
        )

        student.resume_url = resume_url

        db.commit()

    except Exception as exc:
        db.rollback()

        try:
            if "resume_url" in locals():
                delete_resume(resume_url)
        except Exception:
            pass

        raise HTTPException(
            status_code=503,
            detail="Resume storage is unavailable"
        ) from exc

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


# ============================================================
# RESUME URL
# ============================================================

@router.get("/profile/resume-url")
def get_resume_url(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=403,
            detail="Student access required"
        )

    student = db.query(Student).filter(
        Student.user_id == current_user["user_id"]
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )

    if not student.resume_url:
        raise HTTPException(
            status_code=404,
            detail="No resume uploaded"
        )

    try:
        signed_url = create_resume_signed_url(
            student.resume_url
        )
    except (RuntimeError, ValueError, KeyError) as exc:
        raise HTTPException(
            status_code=503,
            detail="Resume storage is unavailable"
        ) from exc

    return {
        "resume_url": student.resume_url,
        "signed_url": signed_url,
        "filename": resume_filename(student.resume_url),
    }


# ============================================================
# DASHBOARD
# ============================================================

@router.get("/dashboard")
def get_dashboard(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=403,
            detail="Student access required"
        )

    student_record = db.query(
        Student,
        User.name
    ).join(
        User,
        User.id == Student.user_id
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
        query = db.query(
            func.count(Application.id)
        ).filter(
            Application.student_id == student_id,
            *filters
        )

        return query.scalar() or 0

    recent_applications = db.query(
        Application,
        Job.title.label("job_title"),
        Internship.title.label("internship_title")
    ).outerjoin(
        Job,
        Job.id == Application.job_id
    ).outerjoin(
        Internship,
        Internship.id == Application.internship_id
    ).filter(
        Application.student_id == student_id
    ).order_by(
        Application.created_at.desc(),
        Application.id.desc()
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
            "skills": db.query(
                func.count(StudentSkill.skill_id)
            ).filter(
                StudentSkill.student_id == student_id
            ).scalar() or 0,

            "certifications": db.query(
                func.count(Certification.id)
            ).filter(
                Certification.student_id == student_id
            ).scalar() or 0,

            "projects": db.query(
                func.count(StudentProject.id)
            ).filter(
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
                "type": (
                    "internship"
                    if application.internship_id
                    else "job"
                ),
                "opportunity_id": (
                    application.internship_id
                    or application.job_id
                ),
                "title": internship_title or job_title,
                "status": application.status,
                "created_at": application.created_at,
            }

            for application, job_title, internship_title
            in recent_applications
        ],
    }


# ============================================================
# GET PROFILE
# ============================================================

@router.get("/profile")
def get_profile(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=403,
            detail="Student access required"
        )

    result = db.query(
        Student,
        User
    ).join(
        User,
        User.id == Student.user_id
    ).filter(
        Student.user_id == current_user["user_id"]
    ).first()

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )

    student, user = result

    return {
        "name": user.name,
        "email": user.email,
        "phone": student.phone,
        "college": student.college,
        "degree": student.degree,
        "branch": student.branch,
        "graduation_year": student.graduation_year,
        "cgpa": student.cgpa,
        "bio": student.bio,
        "resume_url": student.resume_url,
    }


# ============================================================
# UPDATE PROFILE
# ============================================================

@router.put("/profile")
def update_profile(
    profile: StudentProfile,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=403,
            detail="Student access required"
        )

    student = db.query(Student).filter(
        Student.user_id == current_user["user_id"]
    ).first()

    if not student:
        student = Student(
            user_id=current_user["user_id"]
        )

        db.add(student)

    for field, value in profile.model_dump(
        exclude_unset=True
    ).items():
        setattr(student, field, value)

    db.commit()
    db.refresh(student)

    return {
        "message": "Student profile updated successfully",
        "profile": student
    }


# ============================================================
# CERTIFICATIONS
# ============================================================

class CertificationCreate(BaseModel):
    name: str
    issuer: str | None = None
    issue_date: str | None = None
    credential_url: str | None = None


@router.get("/certifications")
def get_certifications(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=403,
            detail="Student access required"
        )

    student = db.query(Student).filter(
        Student.user_id == current_user["user_id"]
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )

    certifications = db.query(
        Certification
    ).filter(
        Certification.student_id == student.id
    ).order_by(
        Certification.issue_date.desc(),
        Certification.id.desc()
    ).all()

    return {
        "certifications": [
            {
                "id": certification.id,
                "name": certification.name,
                "issuer": certification.issuer,
                "issue_date": certification.issue_date,
                "credential_url": certification.credential_url,
            }

            for certification in certifications
        ]
    }


@router.post("/certifications")
def add_certification(
    certification: CertificationCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=403,
            detail="Student access required"
        )

    student = db.query(Student).filter(
        Student.user_id == current_user["user_id"]
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )

    new_certification = Certification(
        student_id=student.id,
        name=certification.name,
        issuer=certification.issuer,
        issue_date=certification.issue_date,
        credential_url=certification.credential_url,
    )

    db.add(new_certification)
    db.commit()
    db.refresh(new_certification)

    return {
        "message": "Certification added successfully",

        "certification": {
            "id": new_certification.id,
            "name": new_certification.name,
            "issuer": new_certification.issuer,
            "issue_date": new_certification.issue_date,
            "credential_url": new_certification.credential_url,
        },
    }


# ============================================================
# PROJECTS
# ============================================================

class StudentProjectCreate(BaseModel):
    title: str
    description: str | None = None
    technologies: str | None = None
    project_url: str | None = None


@router.get("/projects")
def get_student_projects(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=403,
            detail="Student access required"
        )

    student = db.query(Student).filter(
        Student.user_id == current_user["user_id"]
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )

    projects = db.query(
        StudentProject
    ).filter(
        StudentProject.student_id == student.id
    ).order_by(
        StudentProject.id.desc()
    ).all()

    return {
        "projects": [
            {
                "id": project.id,
                "title": project.title,
                "description": project.description,
                "technologies": project.technologies,
                "project_url": project.project_url,
            }

            for project in projects
        ]
    }


@router.post("/projects")
def add_student_project(
    project: StudentProjectCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=403,
            detail="Student access required"
        )

    student = db.query(Student).filter(
        Student.user_id == current_user["user_id"]
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )

    new_project = StudentProject(
        student_id=student.id,
        title=project.title,
        description=project.description,
        technologies=project.technologies,
        project_url=project.project_url,
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return {
        "message": "Project added successfully",

        "project": {
            "id": new_project.id,
            "title": new_project.title,
            "description": new_project.description,
            "technologies": new_project.technologies,
            "project_url": new_project.project_url,
        },
    }


# ============================================================
# MANUALLY SAVED STUDENT SKILLS
# ============================================================

@router.get("/skills")
def get_student_skills(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=403,
            detail="Student access required"
        )

    student = db.query(Student).filter(
        Student.user_id == current_user["user_id"]
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )

    skills = db.query(Skill).join(
        StudentSkill,
        StudentSkill.skill_id == Skill.id
    ).filter(
        StudentSkill.student_id == student.id
    ).order_by(
        Skill.name.asc()
    ).all()

    return {
        "skills": [
            {
                "id": skill.id,
                "name": skill.name,
                "category": skill.category,
            }

            for skill in skills
        ]
    }


# ============================================================
# RESUME-DETECTED SKILLS
# ============================================================

@router.get("/skills/resume")
def get_resume_skills(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=403,
            detail="Student access required"
        )

    student = db.query(Student).filter(
        Student.user_id == current_user["user_id"]
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )

    # --------------------------------------------------------
    # No resume
    # --------------------------------------------------------

    if not student.resume_url:
        return {
            "skills": [],
            "resume_uploaded": False,
            "resume_text_available": False,
            "message": "Upload a resume to detect skills.",
        }

    # --------------------------------------------------------
    # Read resume
    # --------------------------------------------------------

    try:
        stored_resume = read_resume(
            student.resume_url
        )
    except Exception:
        stored_resume = None

    if not stored_resume:
        return {
            "skills": [],
            "resume_uploaded": True,
            "resume_text_available": False,
            "message": "Unable to read the uploaded resume.",
        }

    # --------------------------------------------------------
    # Extract PDF text
    # --------------------------------------------------------

    try:
        resume_text = extract_text_from_pdf(
            BytesIO(stored_resume)
        )
    except ValueError:
        return {
            "skills": [],
            "resume_uploaded": True,
            "resume_text_available": False,
            "message": "Unable to extract text from the resume.",
        }

    if not resume_text.strip():
        return {
            "skills": [],
            "resume_uploaded": True,
            "resume_text_available": False,
            "message": "No readable text was found in the resume.",
        }

    # --------------------------------------------------------
    # Normalize text
    # --------------------------------------------------------

    import re

    text = resume_text.lower()

    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]

    # --------------------------------------------------------
    # Supported Skills headings
    # --------------------------------------------------------

    skill_headings = {
        "skills",
        "technical skills",
        "technical skill",
        "key skills",
        "skills & technologies",
        "skills and technologies",
        "technical skills & tools",
        "technical skills and tools",
        "core skills",
        "professional skills",
        "technical expertise",
        "technical proficiencies",
        "skills & tools",
        "skills and tools",
    }

    skill_start = None

    for index, line in enumerate(lines):

        normalized = re.sub(
            r"[^a-z& ]",
            "",
            line.lower()
        ).strip()

        if normalized in skill_headings:
            skill_start = index + 1
            break

    # --------------------------------------------------------
    # No Skills heading found
    # --------------------------------------------------------

    if skill_start is None:
        return {
            "skills": [],
            "resume_uploaded": True,
            "resume_text_available": True,
            "skills_section_found": False,
            "message": "No Skills section was found in the resume.",
        }

    # --------------------------------------------------------
    # Sections that end the Skills section
    # --------------------------------------------------------

    end_headings = {
        "education",
        "experience",
        "work experience",
        "professional experience",
        "projects",
        "project",
        "certifications",
        "certification",
        "achievements",
        "internships",
        "internship",
        "summary",
        "professional summary",
        "objective",
        "career objective",
        "languages",
        "interests",
        "declaration",
        "publications",
        "employment",
        "work history",
    }

    skill_lines = []

    for line in lines[skill_start:]:

        normalized = re.sub(
            r"[^a-z& ]",
            "",
            line.lower()
        ).strip()

        if normalized in end_headings:
            break

        skill_lines.append(line)

    skill_section = " ".join(skill_lines)

    # --------------------------------------------------------
    # Empty Skills section
    # --------------------------------------------------------

    if not skill_section.strip():
        return {
            "skills": [],
            "resume_uploaded": True,
            "resume_text_available": True,
            "skills_section_found": True,
            "message": "The Skills section is empty.",
        }

    # --------------------------------------------------------
    # Load all skills from database
    # --------------------------------------------------------

    all_skills = db.query(
        Skill
    ).order_by(
        Skill.name.asc()
    ).all()

    detected_skills = []

    # --------------------------------------------------------
    # Detect skills ONLY inside Skills section
    # --------------------------------------------------------

    for skill in all_skills:

        skill_name = skill.name.strip()

        if not skill_name:
            continue

        skill_name_lower = skill_name.lower()

        # Special handling for C.
        # We don't want every letter "c" in the resume
        # to be detected as the C programming language.
        if skill_name_lower == "c":

            pattern = r"(?<![a-z])c(?![a-z])"

        else:

            pattern = (
                r"(?<![a-z0-9])"
                + re.escape(skill_name_lower)
                + r"(?![a-z0-9])"
            )

        if re.search(
            pattern,
            skill_section
        ):

            detected_skills.append({
                "id": skill.id,
                "name": skill.name,
                "category": skill.category,
            })

    # --------------------------------------------------------
    # Return detected resume skills
    # --------------------------------------------------------

    return {
        "skills": detected_skills,
        "resume_uploaded": True,
        "resume_text_available": True,
        "skills_section_found": True,
    }


# ============================================================
# ADD MANUAL STUDENT SKILL
# ============================================================

class AddStudentSkill(BaseModel):
    skill_id: int


@router.post("/skills")
def add_student_skill(
    payload: AddStudentSkill,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=403,
            detail="Student access required"
        )

    student = db.query(Student).filter(
        Student.user_id == current_user["user_id"]
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )

    skill = db.query(Skill).filter(
        Skill.id == payload.skill_id
    ).first()

    if not skill:
        raise HTTPException(
            status_code=404,
            detail="Skill not found"
        )

    existing = db.query(StudentSkill).filter(
        StudentSkill.student_id == student.id,
        StudentSkill.skill_id == skill.id
    ).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Skill already added"
        )

    student_skill = StudentSkill(
        student_id=student.id,
        skill_id=skill.id,
    )

    db.add(student_skill)
    db.commit()

    return {
        "message": "Skill added successfully",

        "skill": {
            "id": skill.id,
            "name": skill.name,
            "category": skill.category,
        },
    }


# ============================================================
# AVAILABLE SKILLS
# ============================================================

@router.get("/skills/available")
def get_available_skills(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=403,
            detail="Student access required"
        )

    skills = db.query(
        Skill
    ).order_by(
        Skill.name.asc()
    ).all()

    return {
        "skills": [
            {
                "id": skill.id,
                "name": skill.name,
                "category": skill.category,
            }

            for skill in skills
        ]
    }


# ============================================================
# REMOVE MANUAL STUDENT SKILL
# ============================================================

@router.delete("/skills/{skill_id}")
def remove_student_skill(
    skill_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=403,
            detail="Student access required"
        )

    student = db.query(Student).filter(
        Student.user_id == current_user["user_id"]
    ).first()

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student profile not found"
        )

    student_skill = db.query(StudentSkill).filter(
        StudentSkill.student_id == student.id,
        StudentSkill.skill_id == skill_id
    ).first()

    if not student_skill:
        raise HTTPException(
            status_code=404,
            detail="Skill is not associated with this student"
        )

    db.delete(student_skill)
    db.commit()

    return {
        "message": "Skill removed successfully"
    }


# ============================================================
# NOTIFICATIONS
# ============================================================

@router.get("/notifications")
def get_notifications(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=403,
            detail="Student access required"
        )

    notifications = db.query(
        Notification
    ).filter(
        Notification.user_id == current_user["user_id"]
    ).order_by(
        Notification.created_at.desc()
    ).all()

    return {
        "notifications": [
            {
                "id": notification.id,
                "title": notification.title,
                "message": notification.message,
                "notification_type": notification.notification_type,
                "is_read": notification.is_read,
                "created_at": notification.created_at,
            }

            for notification in notifications
        ]
    }


@router.put("/notifications/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=403,
            detail="Student access required"
        )

    notification = db.query(
        Notification
    ).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user["user_id"]
    ).first()

    if not notification:
        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    notification.is_read = True

    db.commit()

    return {
        "message": "Notification marked as read"
    }