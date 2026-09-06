import sys
from io import BytesIO
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Company, Internship, Job, Skill, Student, StudentSkill, User
from storage import read_resume

project_root = str(Path(__file__).resolve().parents[2])
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from ml.resume_matcher import match_resume_to_opportunity
from ml.resume_matcher.pdf_parser import extract_text_from_pdf


router = APIRouter(prefix="/students", tags=["Student Recommendations"])


def _company_details(company, company_user):
    return {
        "name": company_user.name if company_user else None,
        "location": company.location if company else None,
        "website": company.website if company else None,
    }


def _opportunity_text(title, description, skills):
    return " ".join(value for value in (title, description, skills) if value).strip()


def _student_text(student, user, skill_names):
    profile_parts = [
        user.name if user else None,
        student.bio,
        student.college,
        student.degree,
        student.branch,
    ]
    if skill_names:
        profile_parts.append("Skills: " + ", ".join(skill_names))
    return " ".join(value for value in profile_parts if value).strip()


@router.get("/recommended-opportunities")
def recommended_opportunities(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user["role"] != "student":
        raise HTTPException(status_code=403, detail="Student access required")

    student_record = db.query(Student, User).outerjoin(
        User, User.id == Student.user_id
    ).filter(
        Student.user_id == current_user["user_id"]
    ).first()

    if not student_record:
        raise HTTPException(status_code=404, detail="Student profile not found")

    student, user = student_record
    skill_names = [
        skill_name
        for (skill_name,) in db.query(Skill.name).join(
            StudentSkill, StudentSkill.skill_id == Skill.id
        ).filter(
            StudentSkill.student_id == student.id
        ).order_by(Skill.name).all()
    ]
    profile_text = _student_text(student, user, skill_names)
    resume_text = None
    if student.resume_url:
        stored_resume = read_resume(student.resume_url)
        if stored_resume:
            try:
                resume_text = extract_text_from_pdf(BytesIO(stored_resume))
            except ValueError:
                resume_text = None
    student_text = resume_text or profile_text

    internships = db.query(Internship, Company, User).outerjoin(
        Company, Company.id == Internship.company_id
    ).outerjoin(
        User, User.id == Company.user_id
    ).filter(
        func.lower(Internship.status).in_(["active", "published"])
    ).all()
    jobs = db.query(Job, Company, User).outerjoin(
        Company, Company.id == Job.company_id
    ).outerjoin(
        User, User.id == Company.user_id
    ).filter(
        func.lower(Job.status).in_(["active", "published"])
    ).all()

    opportunities = []
    processing_errors = []
    for internship, company, company_user in internships:
        opportunity_text = _opportunity_text(
            internship.title, internship.description, internship.skills
        )
        if not student_text or not opportunity_text:
            continue
        try:
            match = match_resume_to_opportunity(student_text, opportunity_text)
        except (RuntimeError, ValueError) as exc:
            processing_errors.append({"type": "internship", "id": internship.id, "detail": str(exc)})
            continue
        opportunities.append({
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
            "company": _company_details(company, company_user),
            **match,
        })

    for job, company, company_user in jobs:
        opportunity_text = _opportunity_text(job.title, job.description, job.skills)
        if not student_text or not opportunity_text:
            continue
        try:
            match = match_resume_to_opportunity(student_text, opportunity_text)
        except (RuntimeError, ValueError) as exc:
            processing_errors.append({"type": "job", "id": job.id, "detail": str(exc)})
            continue
        opportunities.append({
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
            "company": _company_details(company, company_user),
            **match,
        })

    opportunities.sort(key=lambda opportunity: opportunity["overall_score"], reverse=True)

    response = {
        "resume_text_available": bool(resume_text),
        "resume_url_available": bool(student.resume_url),
        "profile_text_available": bool(profile_text),
        "opportunities_analyzed": len(opportunities),
        "opportunities": opportunities,
    }
    if not student_text:
        response["message"] = "No resume text, profile information, or skills are available for matching."
    if processing_errors:
        response["processing_errors"] = processing_errors
    return response