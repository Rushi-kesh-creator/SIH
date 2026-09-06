"""Stable application-facing interface for the reusable ML pipeline."""

from .embeddings import load_model
from .matcher import compute_match_score, generate_suggestions, interpret_score
from .skills import categorize_skills, extract_skills, get_skill_gaps


def analyze_resume(resume_text: str) -> dict:
    """Extract source-derived skills and categories from resume text."""
    if not resume_text or not resume_text.strip():
        raise ValueError("Resume text cannot be empty.")
    skills = extract_skills(resume_text)
    return {
        "skills": sorted(skills),
        "categorized_skills": categorize_skills(skills),
        "skill_count": len(skills),
    }


def match_resume_to_opportunity(resume_text: str, opportunity_text: str) -> dict:
    """Analyze a resume against an opportunity using the source scoring pipeline."""
    if not resume_text or not resume_text.strip():
        raise ValueError("Resume text cannot be empty.")
    if not opportunity_text or not opportunity_text.strip():
        raise ValueError("Opportunity text cannot be empty.")

    resume_skills = extract_skills(resume_text)
    opportunity_skills = extract_skills(opportunity_text)
    matching_skills, missing_skills = get_skill_gaps(resume_skills, opportunity_skills)
    score = compute_match_score(
        resume_text,
        opportunity_text,
        load_model(),
        resume_skills=resume_skills,
        job_skills=opportunity_skills,
    )
    label, color, description = interpret_score(score["overall_score"])
    return {
        **score,
        "matching_skills": sorted(matching_skills),
        "missing_skills": sorted(missing_skills),
        "suggestions": generate_suggestions(
            resume_text, opportunity_text, matching_skills, missing_skills, score["overall_score"]
        ),
        "interpretation": {"label": label, "color": color, "description": description},
    }