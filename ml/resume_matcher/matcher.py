"""Semantic matching and improvement suggestions adapted from SIH2026."""

import re

import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

from .embeddings import generate_embedding
from .skills import get_skill_coverage_score


def compute_cosine_similarity(embedding1: np.ndarray, embedding2: np.ndarray) -> float:
    return float(cosine_similarity(embedding1.reshape(1, -1), embedding2.reshape(1, -1))[0][0])


def compute_match_score(
    resume_text: str,
    job_text: str,
    model: SentenceTransformer,
    resume_skills: set[str] | None = None,
    job_skills: set[str] | None = None,
) -> dict:
    resume_embedding = generate_embedding(resume_text, model)
    job_embedding = generate_embedding(job_text, model)
    semantic_similarity = float(np.clip(compute_cosine_similarity(resume_embedding, job_embedding), 0.0, 1.0))
    skill_coverage = 0.0
    if resume_skills is not None and job_skills is not None:
        skill_coverage = get_skill_coverage_score(resume_skills, job_skills)
    if resume_skills is not None and job_skills is not None and job_skills:
        overall_score = (0.70 * semantic_similarity + 0.30 * skill_coverage) * 100
    else:
        overall_score = semantic_similarity * 100
    return {
        "semantic_similarity": semantic_similarity,
        "skill_coverage": skill_coverage,
        "overall_score": round(overall_score, 1),
        "embedding_dimension": int(resume_embedding.shape[0]),
    }


def interpret_score(score: float) -> tuple[str, str, str]:
    if score >= 80:
        return "Excellent Match", "#10B981", "Your profile is a strong fit for this role. Tailor your cover letter to highlight the key overlapping skills."
    if score >= 65:
        return "Good Match", "#3B82F6", "Solid alignment with the job requirements. A few targeted additions to your resume could make it stand out."
    if score >= 50:
        return "Partial Match", "#F59E0B", "There is some alignment, but notable skill gaps exist. Consider upskilling in the missing areas before applying."
    if score >= 35:
        return "Weak Match", "#EF4444", "Limited overlap detected. Significant resume or skill updates would be needed to be competitive for this role."
    return "Poor Match", "#6B7280", "The resume and job description appear to be in different domains. This role may require a significant career pivot or skills overhaul."


def generate_suggestions(
    resume_text: str,
    job_text: str,
    matching_skills: set[str],
    missing_skills: set[str],
    overall_score: float,
) -> list[dict[str, str]]:
    """Generate the source implementation's rule-based improvement suggestions."""
    suggestions = []
    resume_lower = resume_text.lower()
    job_lower = job_text.lower()

    if missing_skills:
        suggestions.append({
            "category": "Skills Gap",
            "priority": "High",
            "suggestion": f"Add these skills to your resume if you have experience with them: {', '.join(sorted(missing_skills)[:8])}. Include certifications, projects, or coursework where relevant.",
        })
    if not re.search(r"\d+%|\$\d+|\d+ (users|customers|projects|team)", resume_lower):
        suggestions.append({
            "category": "Impact Quantification",
            "priority": "High",
            "suggestion": "Add specific metrics such as improved model accuracy, reduced processing time, or team size to make achievements credible.",
        })
    strong_verbs = ["developed", "engineered", "architected", "implemented", "deployed", "optimized", "designed", "led", "delivered", "built", "automated", "scaled", "reduced", "improved", "launched", "created", "managed"]
    if sum(1 for verb in strong_verbs if verb in resume_lower) < 4:
        suggestions.append({
            "category": "Language Strength",
            "priority": "Medium",
            "suggestion": "Use stronger action verbs such as Engineered, Optimized, Deployed, Scaled, and Automated to open experience bullets.",
        })
    if overall_score < 65:
        suggestions.append({
            "category": "Keyword Optimization",
            "priority": "High",
            "suggestion": "Mirror the exact terminology used in the job posting so your resume language aligns with the role.",
        })
    if not any(keyword in resume_lower for keyword in ["summary", "objective", "profile", "about me"]):
        suggestions.append({
            "category": "Professional Summary",
            "priority": "Medium",
            "suggestion": "Add a tailored three to four sentence professional summary mentioning experience, relevant skills, and value.",
        })
    if any(keyword in job_lower for keyword in ["certification", "certified", "degree", "bachelor", "master", "phd"]):
        if not any(keyword in resume_lower for keyword in ["bachelor", "master", "phd", "degree", "b.tech", "b.e", "m.tech", "university", "college", "certification", "certified"]):
            suggestions.append({
                "category": "Education and Certifications",
                "priority": "Medium",
                "suggestion": "Clearly format your Education section and add relevant certifications if you have them.",
            })
    if not any(keyword in resume_lower for keyword in ["project", "github", "portfolio", "built"]):
        suggestions.append({
            "category": "Projects Portfolio",
            "priority": "Medium",
            "suggestion": "Add two or three relevant projects with the technology stack, problem solved, and a project link where available.",
        })
    suggestions.append({
        "category": "ATS Compatibility",
        "priority": "Low",
        "suggestion": "Use standard section headers, a single-column layout, and an ATS-friendly PDF or DOCX format.",
    })
    if matching_skills and len(matching_skills) >= 3:
        suggestions.append({
            "category": "Leverage Your Strengths",
            "priority": "Low",
            "suggestion": f"Highlight these matching skills in your summary, skills section, and relevant experience bullets: {', '.join(sorted(matching_skills)[:5])}.",
        })
    return suggestions