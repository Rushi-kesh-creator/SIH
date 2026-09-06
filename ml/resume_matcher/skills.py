"""Curated skill extraction adapted from SIH2026 backend/utils/skill_extractor.py."""

import re


PROGRAMMING_LANGUAGES = {
    "python", "java", "javascript", "typescript", "c++", "c#", "c", "go", "rust", "ruby", "php", "swift",
    "kotlin", "scala", "r", "matlab", "perl", "haskell", "lua", "dart", "julia", "bash", "shell",
    "powershell", "objective-c", "groovy", "elixir", "clojure", "f#", "cobol", "fortran",
}
WEB_FRAMEWORKS = {
    "react", "angular", "vue", "next.js", "nuxt.js", "svelte", "django", "flask", "fastapi", "spring",
    "spring boot", "express", "node.js", "laravel", "rails", "ruby on rails", "asp.net", ".net", "gatsby",
    "remix", "astro", "nestjs", "strapi", "graphql", "rest api", "restful", "grpc", "soap", "websocket",
}
DATA_SCIENCE_ML = {
    "machine learning", "deep learning", "neural networks", "nlp", "natural language processing", "computer vision",
    "reinforcement learning", "supervised learning", "unsupervised learning", "transfer learning", "scikit-learn",
    "tensorflow", "pytorch", "keras", "xgboost", "lightgbm", "catboost", "pandas", "numpy", "scipy", "matplotlib",
    "seaborn", "plotly", "hugging face", "transformers", "bert", "gpt", "llm", "sentence transformers", "word2vec",
    "fasttext", "spacy", "nltk", "opencv", "pillow", "statsmodels", "mlflow", "kubeflow", "feature engineering",
    "model deployment", "a/b testing", "hypothesis testing", "regression", "classification", "clustering",
    "dimensionality reduction", "pca", "random forest", "gradient boosting", "svm", "support vector machine",
    "decision tree", "logistic regression", "linear regression", "time series", "anomaly detection", "recommendation system",
    "data augmentation", "hyperparameter tuning", "cross-validation", "embeddings", "cosine similarity", "semantic search",
}
DATABASES = {
    "sql", "mysql", "postgresql", "postgres", "sqlite", "mongodb", "redis", "cassandra", "dynamodb", "elasticsearch",
    "neo4j", "oracle", "mssql", "sql server", "firebase", "supabase", "snowflake", "bigquery", "redshift", "hive",
    "spark sql", "nosql", "vector database", "pinecone", "chroma", "weaviate", "qdrant",
}
CLOUD_DEVOPS = {
    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s", "terraform", "ansible", "jenkins", "ci/cd",
    "github actions", "gitlab ci", "circle ci", "travis ci", "helm", "istio", "prometheus", "grafana", "datadog", "nginx",
    "apache", "linux", "ubuntu", "debian", "centos", "serverless", "lambda", "ec2", "s3", "rds", "ecs", "eks",
    "cloudformation", "pulumi", "vagrant", "microservices", "service mesh", "api gateway", "load balancing", "auto scaling", "cdn",
}
DATA_ENGINEERING = {
    "apache spark", "hadoop", "kafka", "airflow", "dbt", "flink", "hive", "pig", "sqoop", "flume", "nifi", "databricks",
    "etl", "elt", "data pipeline", "data warehouse", "data lake", "data lakehouse", "streaming", "batch processing", "real-time processing",
}
TOOLS_PLATFORMS = {
    "git", "github", "gitlab", "bitbucket", "jira", "confluence", "slack", "trello", "figma", "postman", "swagger", "jupyter",
    "vs code", "visual studio", "intellij", "pycharm", "eclipse", "tableau", "power bi", "looker", "metabase", "excel",
    "google sheets", "notion", "linear", "asana",
}
SOFT_SKILLS = {
    "leadership", "communication", "teamwork", "problem solving", "critical thinking", "time management", "project management",
    "agile", "scrum", "kanban", "collaboration", "mentoring", "cross-functional", "stakeholder management", "presentation",
    "analytical", "detail-oriented", "adaptability", "creativity",
}
SECURITY = {
    "cybersecurity", "penetration testing", "ethical hacking", "soc", "siem", "vulnerability assessment", "ssl/tls", "oauth", "jwt",
    "encryption", "firewalls", "zero trust", "iam", "devsecops", "owasp", "iso 27001", "soc 2",
}
DOMAIN_SKILLS = {
    "product management", "system design", "distributed systems", "object-oriented programming", "oop", "functional programming",
    "design patterns", "data structures", "algorithms", "api design", "microservices architecture", "event-driven architecture",
    "domain-driven design", "test-driven development", "tdd", "bdd", "unit testing", "integration testing", "performance testing",
    "code review", "technical documentation", "open source", "blockchain", "web3", "iot", "edge computing", "quantum computing",
    "ar/vr", "mobile development", "ios development", "android development", "react native", "flutter", "xamarin",
}
SKILL_CATEGORY_MAP = {
    "Programming Languages": PROGRAMMING_LANGUAGES, "Web & Frameworks": WEB_FRAMEWORKS, "AI / ML / Data Science": DATA_SCIENCE_ML,
    "Databases": DATABASES, "Cloud & DevOps": CLOUD_DEVOPS, "Data Engineering": DATA_ENGINEERING, "Tools & Platforms": TOOLS_PLATFORMS,
    "Soft Skills": SOFT_SKILLS, "Security": SECURITY, "Domain Knowledge": DOMAIN_SKILLS,
}
ALL_SKILLS = set().union(*SKILL_CATEGORY_MAP.values())


def extract_skills(text: str) -> set[str]:
    if not text:
        return set()
    text_lower = text.lower()
    found = set()
    for skill in ALL_SKILLS:
        if len(skill) <= 2:
            pattern = r"(?<![a-z0-9])" + re.escape(skill) + r"(?![a-z0-9])"
        else:
            pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, text_lower):
            found.add(skill)
    return found


def get_skill_gaps(resume_skills: set[str], job_skills: set[str]) -> tuple[set[str], set[str]]:
    return resume_skills & job_skills, job_skills - resume_skills


def categorize_skills(skills: set[str]) -> dict[str, list[str]]:
    categorized = {}
    uncategorized = set(skills)
    for category, category_skills in SKILL_CATEGORY_MAP.items():
        matched = skills & category_skills
        if matched:
            categorized[category] = sorted(matched)
            uncategorized -= matched
    if uncategorized:
        categorized["Other"] = sorted(uncategorized)
    return categorized


def get_skill_coverage_score(resume_skills: set[str], job_skills: set[str]) -> float:
    if not job_skills:
        return 0.0
    matching, _ = get_skill_gaps(resume_skills, job_skills)
    return len(matching) / len(job_skills)