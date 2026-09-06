from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import Application, Company, Internship, Job, Student, User,Skill,StudentSkill


SUPPORTED_ROLES = {"student", "academician", "company", "industry", "admin"}
router = APIRouter(prefix="/admin", tags=["Administration"])


class RoleUpdate(BaseModel):
    role: str


def _require_admin(current_user, db: Session):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    user = db.query(User).filter(User.id == current_user["user_id"]).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Admin user not found")
    return user


def _safe_user(user):
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at,
    }


def _application_row(application, student, student_user, job, internship, company_user):
    opportunity = job or internship
    opportunity_type = "job" if job else "internship"
    return {
        "application_id": application.id,
        "student": {"id": student.id, "name": student_user.name, "email": student_user.email},
        "company": {"name": company_user.name if company_user else None},
        "opportunity": {
            "id": opportunity.id if opportunity else None,
            "title": opportunity.title if opportunity else None,
            "type": opportunity_type,
        },
        "status": application.status,
        "created_at": application.created_at,
    }


@router.get("/dashboard")
def admin_dashboard(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_admin(current_user, db)
    status_rows = db.query(Application.status, func.count(Application.id)).group_by(Application.status).all()
    recent_applications = []
    for application in db.query(Application).order_by(
        Application.created_at.desc(), Application.id.desc()
    ).limit(5).all():
        student = db.query(Student, User).join(
            User, User.id == Student.user_id
        ).filter(Student.id == application.student_id).first()
        if application.job_id:
            opportunity = db.query(Job).filter(Job.id == application.job_id).first()
        else:
            opportunity = db.query(Internship).filter(Internship.id == application.internship_id).first()
        company_user = None
        if opportunity:
            company_id = opportunity.company_id
            company_row = db.query(User).join(
                Company, Company.user_id == User.id
            ).filter(Company.id == company_id).first()
            company_user = company_row.name if company_row else None
        recent_applications.append({
            "application_id": application.id,
            "student_name": student[1].name if student else None,
            "company_name": company_user,
            "opportunity_title": opportunity.title if opportunity else None,
            "status": application.status,
            "created_at": application.created_at,
        })

    return {
        "statistics": {
            "total_users": db.query(func.count(User.id)).scalar() or 0,
            "total_students": db.query(func.count(Student.id)).scalar() or 0,
            "total_companies": db.query(func.count(Company.id)).scalar() or 0,
            "total_academicians": db.query(func.count(User.id)).filter(User.role == "academician").scalar() or 0,
            "total_internships": db.query(func.count(Internship.id)).scalar() or 0,
            "total_jobs": db.query(func.count(Job.id)).scalar() or 0,
            "total_applications": db.query(func.count(Application.id)).scalar() or 0,
            "applications_by_status": {status or "unknown": count for status, count in status_rows},
        },
        "recent_users": [_safe_user(user) for user in db.query(User).order_by(User.created_at.desc(), User.id.desc()).limit(5).all()],
        "recent_applications": recent_applications,
    }


@router.get("/users")
def list_users(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_admin(current_user, db)
    return [_safe_user(user) for user in db.query(User).order_by(User.created_at.desc(), User.id.desc()).all()]


@router.get("/users/{user_id}")
def get_user(
    user_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_admin(current_user, db)
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return _safe_user(user)


@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    payload: RoleUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    admin = _require_admin(current_user, db)
    if payload.role not in SUPPORTED_ROLES:
        raise HTTPException(status_code=422, detail="Invalid supported role")
    if user_id == admin.id and payload.role != "admin":
        raise HTTPException(status_code=409, detail="An admin cannot remove their own admin access")
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = payload.role
    db.commit()
    db.refresh(user)
    return _safe_user(user)


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    admin = _require_admin(current_user, db)
    if user_id == admin.id:
        raise HTTPException(status_code=409, detail="An admin cannot delete their own account")
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    student = db.query(Student).filter(Student.user_id == user_id).first()
    company = db.query(Company).filter(Company.user_id == user_id).first()
    if student or company:
        raise HTTPException(status_code=409, detail="User has related records and cannot be safely deleted")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}


@router.get("/applications")
def list_admin_applications(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_admin(current_user, db)
    result = []
    for application in db.query(Application).order_by(Application.created_at.desc(), Application.id.desc()).all():
        student = db.query(Student, User).join(User, User.id == Student.user_id).filter(Student.id == application.student_id).first()
        if application.job_id:
            opportunity = db.query(Job).filter(Job.id == application.job_id).first()
            company = db.query(Company, User).join(User, User.id == Company.user_id).filter(Company.id == opportunity.company_id).first() if opportunity else None
        else:
            opportunity = db.query(Internship).filter(Internship.id == application.internship_id).first()
            company = db.query(Company, User).join(User, User.id == Company.user_id).filter(Company.id == opportunity.company_id).first() if opportunity else None
        if student:
            student_record, student_user = student
            company_user = company[1] if company else None
            result.append(_application_row(application, student_record, student_user, opportunity if application.job_id else None, opportunity if application.internship_id else None, company_user))
    return result

@router.get("/skills")
def get_admin_skills(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    _require_admin(current_user, db)

    skills = (
        db.query(Skill)
        .order_by(Skill.name.asc())
        .all()
    )

    return [
        {
            "id": skill.id,
            "name": skill.name,
            "category": skill.category,
        }
        for skill in skills
    ]

@router.get("/internships")
def get_admin_internships(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    _require_admin(current_user, db)

    internships = (
        db.query(Internship)
        .order_by(Internship.created_at.desc())
        .all()
    )

    results = []

    for internship in internships:
        company = (
            db.query(Company)
            .filter(Company.id == internship.company_id)
            .first()
        )

        company_name = None

        if company:
            company_user = (
                db.query(User)
                .filter(User.id == company.user_id)
                .first()
            )

            if company_user:
                company_name = company_user.name

        results.append({
            "id": internship.id,
            "title": internship.title,
            "description": internship.description,
            "location": internship.location,
            "skills": internship.skills,
            "duration": internship.duration,
            "stipend": internship.stipend,
            "status": internship.status,
            "created_at": internship.created_at,
            "company_name": company_name,
        })

    return results

@router.get("/jobs")
def get_admin_jobs(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    _require_admin(current_user, db)

    jobs = (
        db.query(Job)
        .order_by(Job.created_at.desc())
        .all()
    )

    results = []

    for job in jobs:
        company = (
            db.query(Company)
            .filter(Company.id == job.company_id)
            .first()
        )

        company_name = None

        if company:
            company_user = (
                db.query(User)
                .filter(User.id == company.user_id)
                .first()
            )

            if company_user:
                company_name = company_user.name

        results.append({
            "id": job.id,
            "title": job.title,
            "description": job.description,
            "location": job.location,
            "skills": job.skills,
            "salary": job.salary,
            "status": job.status,
            "created_at": job.created_at,
            "company_name": company_name,
        })

    return results

@router.get("/skill-analytics")
def get_skill_analytics(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    _require_admin(current_user, db)

    # -----------------------------
    # Student skill distribution
    # -----------------------------
    student_skill_rows = (
        db.query(
            Skill.id,
            Skill.name,
            Skill.category,
            func.count(StudentSkill.student_id).label("student_count")
        )
        .outerjoin(StudentSkill, Skill.id == StudentSkill.skill_id)
        .group_by(Skill.id, Skill.name, Skill.category)
        .order_by(func.count(StudentSkill.student_id).desc(), Skill.name.asc())
        .all()
    )

    total_skills = db.query(Skill).count()

    students_with_skills = (
        db.query(StudentSkill.student_id)
        .distinct()
        .count()
    )

    skill_distribution = [
        {
            "id": row.id,
            "name": row.name,
            "category": row.category,
            "student_count": row.student_count,
        }
        for row in student_skill_rows
    ]

    # -----------------------------
    # Industry skill demand
    # -----------------------------
    opportunities = (
        db.query(Job.skills)
        .filter(Job.status.ilike("active"))
        .all()
    )

    opportunities += (
        db.query(Internship.skills)
        .filter(Internship.status.ilike("active"))
        .all()
    )

    demand_counts = {}

    for (skills_text,) in opportunities:
        if not skills_text:
            continue

        for skill_name in skills_text.split(","):
            normalized = skill_name.strip().lower()

            if not normalized:
                continue

            demand_counts[normalized] = demand_counts.get(normalized, 0) + 1

    industry_demand = []

    for skill in db.query(Skill).order_by(Skill.name.asc()).all():
        normalized = skill.name.strip().lower()

        industry_demand.append({
            "id": skill.id,
            "name": skill.name,
            "category": skill.category,
            "student_count": next(
                (
                    row.student_count
                    for row in student_skill_rows
                    if row.id == skill.id
                ),
                0
            ),
            "industry_demand": demand_counts.get(normalized, 0),
        })

    industry_demand.sort(
        key=lambda item: (
            item["industry_demand"],
            item["student_count"]
        ),
        reverse=True
    )

    return {
        "summary": {
            "total_skills": total_skills,
            "students_with_skills": students_with_skills,
            "active_jobs": db.query(Job)
                .filter(Job.status.ilike("active"))
                .count(),
            "active_internships": db.query(Internship)
                .filter(Internship.status.ilike("active"))
                .count(),
        },
        "skill_distribution": skill_distribution,
        "industry_demand": industry_demand,
    }

@router.get("/industry-demand")
def get_industry_demand(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    _require_admin(current_user, db)

    # Only active opportunities contribute to current industry demand.
    active_jobs = (
        db.query(Job)
        .filter(Job.status.ilike("active"))
        .all()
    )

    active_internships = (
        db.query(Internship)
        .filter(Internship.status.ilike("active"))
        .all()
    )

    # -------------------------------------------------
    # Skill demand
    # -------------------------------------------------
    skill_demand = {}

    def add_skills(skills_text):
        if not skills_text:
            return

        for skill in skills_text.split(","):
            skill = skill.strip()

            if not skill:
                continue

            normalized = skill.lower()

            if normalized not in skill_demand:
                skill_demand[normalized] = {
                    "name": skill,
                    "jobs": 0,
                    "internships": 0,
                    "total": 0,
                }

    for job in active_jobs:
        if job.skills:
            for skill in job.skills.split(","):
                skill = skill.strip()

                if not skill:
                    continue

                normalized = skill.lower()

                if normalized not in skill_demand:
                    skill_demand[normalized] = {
                        "name": skill,
                        "jobs": 0,
                        "internships": 0,
                        "total": 0,
                    }

                skill_demand[normalized]["jobs"] += 1
                skill_demand[normalized]["total"] += 1

    for internship in active_internships:
        if internship.skills:
            for skill in internship.skills.split(","):
                skill = skill.strip()

                if not skill:
                    continue

                normalized = skill.lower()

                if normalized not in skill_demand:
                    skill_demand[normalized] = {
                        "name": skill,
                        "jobs": 0,
                        "internships": 0,
                        "total": 0,
                    }

                skill_demand[normalized]["internships"] += 1
                skill_demand[normalized]["total"] += 1

    skill_demand_list = sorted(
        skill_demand.values(),
        key=lambda item: item["total"],
        reverse=True
    )

    # -------------------------------------------------
    # Location demand
    # -------------------------------------------------
    location_demand = {}

    for job in active_jobs:
        location = (job.location or "Not specified").strip()

        if location not in location_demand:
            location_demand[location] = {
                "location": location,
                "jobs": 0,
                "internships": 0,
                "total": 0,
            }

        location_demand[location]["jobs"] += 1
        location_demand[location]["total"] += 1

    for internship in active_internships:
        location = (internship.location or "Not specified").strip()

        if location not in location_demand:
            location_demand[location] = {
                "location": location,
                "jobs": 0,
                "internships": 0,
                "total": 0,
            }

        location_demand[location]["internships"] += 1
        location_demand[location]["total"] += 1

    location_demand_list = sorted(
        location_demand.values(),
        key=lambda item: item["total"],
        reverse=True
    )

    # -------------------------------------------------
    # Company demand
    # -------------------------------------------------
    company_demand = {}

    for job in active_jobs:
        company = db.query(Company).filter(
            Company.id == job.company_id
        ).first()

        company_name = "Unknown Company"

        if company:
            company_user = db.query(User).filter(
                User.id == company.user_id
            ).first()

            if company_user:
                company_name = company_user.name

        if company_name not in company_demand:
            company_demand[company_name] = {
                "company": company_name,
                "jobs": 0,
                "internships": 0,
                "total": 0,
            }

        company_demand[company_name]["jobs"] += 1
        company_demand[company_name]["total"] += 1

    for internship in active_internships:
        company = db.query(Company).filter(
            Company.id == internship.company_id
        ).first()

        company_name = "Unknown Company"

        if company:
            company_user = db.query(User).filter(
                User.id == company.user_id
            ).first()

            if company_user:
                company_name = company_user.name

        if company_name not in company_demand:
            company_demand[company_name] = {
                "company": company_name,
                "jobs": 0,
                "internships": 0,
                "total": 0,
            }

        company_demand[company_name]["internships"] += 1
        company_demand[company_name]["total"] += 1

    company_demand_list = sorted(
        company_demand.values(),
        key=lambda item: item["total"],
        reverse=True
    )

    return {
        "summary": {
            "active_jobs": len(active_jobs),
            "active_internships": len(active_internships),
            "total_active_opportunities": (
                len(active_jobs) + len(active_internships)
            ),
            "unique_skills_demanded": len(skill_demand_list),
            "locations": len(location_demand_list),
            "companies": len(company_demand_list),
        },
        "skill_demand": skill_demand_list,
        "location_demand": location_demand_list,
        "company_demand": company_demand_list,
    }

@router.get("/placement-analytics")
def get_placement_analytics(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    _require_admin(current_user, db)

    total_students = db.query(Student).count()
    total_applications = db.query(Application).count()

    # Count applications by status
    status_rows = (
        db.query(
            Application.status,
            func.count(Application.id)
        )
        .group_by(Application.status)
        .all()
    )

    status_counts = {}

    for status, count in status_rows:
        normalized_status = (status or "unknown").lower()
        status_counts[normalized_status] = count

    pending = status_counts.get("pending", 0)
    accepted = status_counts.get("accepted", 0)
    rejected = status_counts.get("rejected", 0)
    applied = status_counts.get("applied", 0)

    # Acceptance rate
    acceptance_rate = (
        round((accepted / total_applications) * 100, 2)
        if total_applications > 0
        else 0
    )

    # -------------------------------------------------
    # Applications by opportunity type
    # -------------------------------------------------
    job_applications = (
        db.query(Application)
        .filter(Application.job_id.isnot(None))
        .count()
    )

    internship_applications = (
        db.query(Application)
        .filter(Application.internship_id.isnot(None))
        .count()
    )

    # -------------------------------------------------
    # Applications by company
    # -------------------------------------------------
    company_counts = {}

    applications = db.query(Application).all()

    for application in applications:
        company_name = "Unknown Company"

        if application.job_id:
            job = db.query(Job).filter(
                Job.id == application.job_id
            ).first()

            if job:
                company = db.query(Company).filter(
                    Company.id == job.company_id
                ).first()

                if company:
                    company_user = db.query(User).filter(
                        User.id == company.user_id
                    ).first()

                    if company_user:
                        company_name = company_user.name

        elif application.internship_id:
            internship = db.query(Internship).filter(
                Internship.id == application.internship_id
            ).first()

            if internship:
                company = db.query(Company).filter(
                    Company.id == internship.company_id
                ).first()

                if company:
                    company_user = db.query(User).filter(
                        User.id == company.user_id
                    ).first()

                    if company_user:
                        company_name = company_user.name

        if company_name not in company_counts:
            company_counts[company_name] = {
                "company": company_name,
                "applications": 0,
                "accepted": 0,
                "pending": 0,
                "rejected": 0,
            }

        company_counts[company_name]["applications"] += 1

        status = (application.status or "").lower()

        if status == "accepted":
            company_counts[company_name]["accepted"] += 1
        elif status == "pending":
            company_counts[company_name]["pending"] += 1
        elif status == "rejected":
            company_counts[company_name]["rejected"] += 1

    company_demand = sorted(
        company_counts.values(),
        key=lambda item: item["applications"],
        reverse=True
    )

    # -------------------------------------------------
    # Recent placement activity
    # -------------------------------------------------
    recent_applications = (
        db.query(Application)
        .order_by(Application.created_at.desc())
        .limit(10)
        .all()
    )

    recent_activity = []

    for application in recent_applications:
        student = db.query(Student).filter(
            Student.id == application.student_id
        ).first()

        student_name = "Unknown Student"

        if student:
            student_user = db.query(User).filter(
                User.id == student.user_id
            ).first()

            if student_user:
                student_name = student_user.name

        opportunity_title = "Unknown Opportunity"
        opportunity_type = "unknown"

        if application.job_id:
            job = db.query(Job).filter(
                Job.id == application.job_id
            ).first()

            if job:
                opportunity_title = job.title
                opportunity_type = "job"

        elif application.internship_id:
            internship = db.query(Internship).filter(
                Internship.id == application.internship_id
            ).first()

            if internship:
                opportunity_title = internship.title
                opportunity_type = "internship"

        recent_activity.append({
            "application_id": application.id,
            "student": student_name,
            "opportunity": opportunity_title,
            "type": opportunity_type,
            "status": application.status,
            "created_at": application.created_at,
        })

    return {
        "summary": {
            "total_students": total_students,
            "total_applications": total_applications,
            "pending": pending,
            "accepted": accepted,
            "rejected": rejected,
            "applied": applied,
            "acceptance_rate": acceptance_rate,
        },
        "opportunity_type": {
            "jobs": job_applications,
            "internships": internship_applications,
        },
        "company_analytics": company_demand,
        "recent_activity": recent_activity,
    }

@router.get("/reports")
def get_admin_reports(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    _require_admin(current_user, db)

    total_users = db.query(User).count()
    total_students = db.query(Student).count()
    total_companies = db.query(Company).count()
    total_academicians = (
        db.query(User)
        .filter(User.role == "academician")
        .count()
    )

    total_skills = db.query(Skill).count()
    total_internships = db.query(Internship).count()
    active_internships = (
        db.query(Internship)
        .filter(Internship.status == "active")
        .count()
    )

    total_jobs = db.query(Job).count()
    active_jobs = (
        db.query(Job)
        .filter(Job.status == "active")
        .count()
    )

    total_applications = db.query(Application).count()

    accepted = (
        db.query(Application)
        .filter(Application.status == "accepted")
        .count()
    )

    pending = (
        db.query(Application)
        .filter(Application.status == "pending")
        .count()
    )

    rejected = (
        db.query(Application)
        .filter(Application.status == "rejected")
        .count()
    )

    applied = (
        db.query(Application)
        .filter(Application.status == "applied")
        .count()
    )

    acceptance_rate = (
        round((accepted / total_applications) * 100, 2)
        if total_applications > 0
        else 0
    )

    return {
        "users": {
            "total": total_users,
            "students": total_students,
            "companies": total_companies,
            "academicians": total_academicians,
        },
        "skills": {
            "total": total_skills,
        },
        "opportunities": {
            "total_internships": total_internships,
            "active_internships": active_internships,
            "total_jobs": total_jobs,
            "active_jobs": active_jobs,
        },
        "applications": {
            "total": total_applications,
            "accepted": accepted,
            "pending": pending,
            "rejected": rejected,
            "applied": applied,
            "acceptance_rate": acceptance_rate,
        },
    }

@router.get("/settings")
def get_admin_settings(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    admin = _require_admin(current_user, db)

    return {
        "profile": {
            "id": admin.id,
            "name": admin.name,
            "email": admin.email,
            "role": admin.role,
            "created_at": admin.created_at,
        },
        "security": {
            "authentication": "JWT",
            "session_status": "Active",
        },
        "portal": {
            "total_users": db.query(User).count(),
            "total_students": db.query(Student).count(),
            "total_companies": db.query(Company).count(),
            "total_skills": db.query(Skill).count(),
            "total_internships": db.query(Internship).count(),
            "total_jobs": db.query(Job).count(),
            "total_applications": db.query(Application).count(),
        },
    }