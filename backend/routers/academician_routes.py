from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db

from models import (
    User,
    Student,
    Skill,
    StudentSkill,
    AcademicProgram,
    LearningRecommendation,
)


router = APIRouter(
    prefix="/academicians",
    tags=["Academicians"],
)


# =========================================================
# PYDANTIC MODELS
# =========================================================

class AcademicianProfileUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1)


class AcademicProgramCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    skills: str | None = None
    duration: str | None = None
    provider: str | None = None
    website: str | None = None


class AcademicProgramUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None
    skills: str | None = None
    duration: str | None = None
    provider: str | None = None
    website: str | None = None
    status: str | None = None


class LearningRecommendationCreate(BaseModel):
    student_id: int
    title: str = Field(min_length=1, max_length=200)
    message: str | None = None
    skills: str | None = None


# =========================================================
# HELPERS
# =========================================================

def _get_academician(current_user, db: Session):
    if current_user["role"] != "academician":
        raise HTTPException(
            status_code=403,
            detail="Academician access required",
        )

    user = (
        db.query(User)
        .filter(
            User.id == current_user["user_id"],
            User.role == "academician",
        )
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="Academician profile not found",
        )

    return user


def _profile_response(user):
    completed = int(bool(user.name)) + int(bool(user.email))

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "profile_completion": completed,
        "profile_fields_available": 2,
    }


def _program_response(program):
    return {
        "id": program.id,
        "academician_id": program.academician_id,
        "title": program.title,
        "description": program.description,
        "skills": program.skills,
        "duration": program.duration,
        "provider": program.provider,
        "website": program.website,
        "status": program.status,
        "created_at": program.created_at,
    }


# =========================================================
# PROFILE
# =========================================================

@router.get("/profile")
def get_academician_profile(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = _get_academician(current_user, db)

    return _profile_response(user)


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


# =========================================================
# DASHBOARD
# =========================================================

@router.get("/dashboard")
def get_academician_dashboard(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = _get_academician(current_user, db)

    total_students = db.query(Student.id).count()

    students_with_skills = (
        db.query(func.count(func.distinct(StudentSkill.student_id)))
        .scalar()
        or 0
    )

    total_programs = (
        db.query(AcademicProgram.id)
        .filter(
            AcademicProgram.academician_id == user.id
        )
        .count()
    )

    total_recommendations = (
        db.query(LearningRecommendation.id)
        .filter(
            LearningRecommendation.academician_id == user.id
        )
        .count()
    )

    return {
        "academician": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
        },
        "profile_completion": {
            "completed": int(bool(user.name))
            + int(bool(user.email)),
            "available": 2,
        },
        "statistics": {
            "total_students": total_students,
            "students_with_skills": students_with_skills,
            "academic_programs": total_programs,
            "recommendations": total_recommendations,
        },
    }


# =========================================================
# ACADEMIC PROGRAMS
# =========================================================

@router.get("/programs")
def get_academic_programs(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = _get_academician(current_user, db)

    programs = (
        db.query(AcademicProgram)
        .filter(
            AcademicProgram.academician_id == user.id
        )
        .order_by(
            AcademicProgram.created_at.desc()
        )
        .all()
    )

    return [
        _program_response(program)
        for program in programs
    ]


@router.post("/programs")
def create_academic_program(
    payload: AcademicProgramCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = _get_academician(current_user, db)

    program = AcademicProgram(
        academician_id=user.id,
        title=payload.title,
        description=payload.description,
        skills=payload.skills,
        duration=payload.duration,
        provider=payload.provider,
        website=payload.website,
        status="active",
    )

    db.add(program)
    db.commit()
    db.refresh(program)

    return {
        "message": "Academic program created successfully",
        "program": _program_response(program),
    }


@router.put("/programs/{program_id}")
def update_academic_program(
    program_id: int,
    payload: AcademicProgramUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = _get_academician(current_user, db)

    program = (
        db.query(AcademicProgram)
        .filter(
            AcademicProgram.id == program_id,
            AcademicProgram.academician_id == user.id,
        )
        .first()
    )

    if program is None:
        raise HTTPException(
            status_code=404,
            detail="Academic program not found",
        )

    update_data = payload.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(program, field, value)

    db.commit()
    db.refresh(program)

    return {
        "message": "Academic program updated successfully",
        "program": _program_response(program),
    }


@router.delete("/programs/{program_id}")
def delete_academic_program(
    program_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = _get_academician(current_user, db)

    program = (
        db.query(AcademicProgram)
        .filter(
            AcademicProgram.id == program_id,
            AcademicProgram.academician_id == user.id,
        )
        .first()
    )

    if program is None:
        raise HTTPException(
            status_code=404,
            detail="Academic program not found",
        )

    db.delete(program)
    db.commit()

    return {
        "message": "Academic program deleted successfully"
    }


# =========================================================
# STUDENTS
# =========================================================

@router.get("/students")
def get_academician_students(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_academician(current_user, db)

    students = (
        db.query(Student, User)
        .join(
            User,
            User.id == Student.user_id,
        )
        .order_by(User.name.asc())
        .all()
    )

    result = []

    for student, user in students:

        skill_count = (
            db.query(StudentSkill)
            .filter(
                StudentSkill.student_id == student.id
            )
            .count()
        )

        result.append(
            {
                "student_id": student.id,
                "user_id": user.id,
                "name": user.name,
                "email": user.email,
                "college": student.college,
                "degree": student.degree,
                "branch": student.branch,
                "graduation_year": student.graduation_year,
                "cgpa": student.cgpa,
                "skill_count": skill_count,
            }
        )

    return result


@router.get("/students/{student_id}/skills")
def get_student_skills(
    student_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_academician(current_user, db)

    student = (
        db.query(Student, User)
        .join(
            User,
            User.id == Student.user_id,
        )
        .filter(Student.id == student_id)
        .first()
    )

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found",
        )

    student_record, user = student

    skills = (
        db.query(Skill)
        .join(
            StudentSkill,
            StudentSkill.skill_id == Skill.id,
        )
        .filter(
            StudentSkill.student_id == student_id
        )
        .order_by(Skill.name.asc())
        .all()
    )

    return {
        "student": {
            "id": student_record.id,
            "name": user.name,
            "email": user.email,
            "college": student_record.college,
            "degree": student_record.degree,
            "branch": student_record.branch,
            "graduation_year": student_record.graduation_year,
            "cgpa": student_record.cgpa,
        },
        "skills": [
            {
                "id": skill.id,
                "name": skill.name,
                "category": skill.category,
            }
            for skill in skills
        ],
    }


# =========================================================
# LEARNING RECOMMENDATIONS
# =========================================================

@router.get("/recommendations")
def get_learning_recommendations(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = _get_academician(current_user, db)

    recommendations = (
        db.query(
            LearningRecommendation,
            Student,
            User,
        )
        .join(
            Student,
            Student.id == LearningRecommendation.student_id,
        )
        .join(
            User,
            User.id == Student.user_id,
        )
        .filter(
            LearningRecommendation.academician_id == user.id
        )
        .order_by(
            LearningRecommendation.created_at.desc()
        )
        .all()
    )

    result = []

    for recommendation, student, student_user in recommendations:
        result.append(
            {
                "id": recommendation.id,
                "student_id": student.id,
                "student_name": student_user.name,
                "student_email": student_user.email,
                "title": recommendation.title,
                "message": recommendation.message,
                "skills": recommendation.skills,
                "created_at": recommendation.created_at,
            }
        )

    return result


@router.post("/recommendations")
def create_learning_recommendation(
    payload: LearningRecommendationCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = _get_academician(current_user, db)

    student = (
        db.query(Student)
        .filter(
            Student.id == payload.student_id
        )
        .first()
    )

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found",
        )

    recommendation = LearningRecommendation(
        academician_id=user.id,
        student_id=payload.student_id,
        title=payload.title,
        message=payload.message,
        skills=payload.skills,
    )

    db.add(recommendation)
    db.commit()
    db.refresh(recommendation)

    return {
        "message": "Learning recommendation created successfully",
        "recommendation": {
            "id": recommendation.id,
            "student_id": recommendation.student_id,
            "title": recommendation.title,
            "message": recommendation.message,
            "skills": recommendation.skills,
            "created_at": recommendation.created_at,
        },
    }


@router.delete("/recommendations/{recommendation_id}")
def delete_learning_recommendation(
    recommendation_id: int,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = _get_academician(current_user, db)

    recommendation = (
        db.query(LearningRecommendation)
        .filter(
            LearningRecommendation.id == recommendation_id,
            LearningRecommendation.academician_id == user.id,
        )
        .first()
    )

    if recommendation is None:
        raise HTTPException(
            status_code=404,
            detail="Learning recommendation not found",
        )

    db.delete(recommendation)
    db.commit()

    return {
        "message": "Learning recommendation deleted successfully"
    }