from sqlalchemy import Column, Integer, String, DateTime, Float, Text, Date,Boolean,DateTime
from sqlalchemy.sql import func

from database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String)
    role = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    phone = Column(String)
    college = Column(String)
    degree = Column(String)
    branch = Column(String)
    graduation_year = Column(Integer)
    cgpa = Column(Float)
    bio = Column(Text)
    resume_url = Column(String)

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    website = Column(String)
    description = Column(Text)
    location = Column(String)

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String)

class StudentSkill(Base):
    __tablename__ = "student_skills"

    student_id = Column(Integer, primary_key=True)
    skill_id = Column(Integer, primary_key=True)

class Internship(Base):
    __tablename__ = "internships"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    location = Column(String)
    skills = Column(String)
    duration = Column(String)
    stipend = Column(String)
    status = Column(String)
    created_at = Column(DateTime, server_default=func.now())

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    location = Column(String)
    skills = Column(String)
    salary = Column(String)
    status = Column(String)
    created_at = Column(DateTime, server_default=func.now())

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False)
    job_id = Column(Integer)
    internship_id = Column(Integer)
    status = Column(String)
    created_at = Column(DateTime, server_default=func.now())

class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False)
    name = Column(String(160), nullable=False)
    issuer = Column(String(160))
    issue_date = Column(Date)
    credential_url = Column(String(500))

class StudentProject(Base):
    __tablename__ = "student_projects"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, nullable=False)
    title = Column(String(160), nullable=False)
    description = Column(Text)
    technologies = Column(String(500))
    project_url = Column(String(500))

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="info")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class AcademicProgram(Base):
    __tablename__ = "academic_programs"

    id = Column(Integer, primary_key=True, index=True)
    academician_id = Column(Integer, nullable=False, index=True)

    title = Column(String(200), nullable=False)
    description = Column(Text)
    skills = Column(String(500))
    duration = Column(String(100))
    provider = Column(String(160))
    website = Column(String(500))

    status = Column(String(50), default="active")
    created_at = Column(DateTime, server_default=func.now())


class LearningRecommendation(Base):
    __tablename__ = "learning_recommendations"

    id = Column(Integer, primary_key=True, index=True)

    academician_id = Column(Integer, nullable=False, index=True)
    student_id = Column(Integer, nullable=False, index=True)

    title = Column(String(200), nullable=False)
    message = Column(Text)
    skills = Column(String(500))

    created_at = Column(DateTime, server_default=func.now())
    