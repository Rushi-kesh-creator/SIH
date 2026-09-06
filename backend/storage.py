import os
import re
from pathlib import Path
from uuid import uuid4

from dotenv import load_dotenv

load_dotenv()

RESUME_BUCKET = os.getenv("SUPABASE_RESUME_BUCKET", "resumes")
SIGNED_URL_EXPIRES = int(os.getenv("SUPABASE_RESUME_SIGNED_URL_EXPIRES", "3600"))


def _client():
    supabase_url = os.getenv("SUPABASE_URL")
    service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not service_role_key:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for resume storage"
        )

    from supabase import create_client

    return create_client(supabase_url, service_role_key)


def _safe_filename(original_filename: str) -> str:
    filename = re.sub(
        r"[^A-Za-z0-9._-]+", "_", Path(original_filename).name
    ).strip("._")
    return filename or "resume.pdf"


def build_resume_path(student_id: int, original_filename: str) -> str:
    return f"{RESUME_BUCKET}/{student_id}/{uuid4().hex}_{_safe_filename(original_filename)}"


def _object_path(resume_url: str) -> str:
    prefix = f"{RESUME_BUCKET}/"
    if not resume_url.startswith(prefix):
        raise ValueError("Resume storage path is invalid")
    return resume_url[len(prefix):]


def save_resume(student_id: int, original_filename: str, content: bytes) -> str:
    object_path = build_resume_path(student_id, original_filename)
    _client().storage.from_(RESUME_BUCKET).upload(
        _object_path(object_path),
        content,
        file_options={"content-type": "application/pdf", "upsert": "false"},
    )
    return object_path


def read_resume(resume_url: str) -> bytes | None:
    if not resume_url or not resume_url.startswith(f"{RESUME_BUCKET}/"):
        return None
    try:
        return _client().storage.from_(RESUME_BUCKET).download(_object_path(resume_url))
    except Exception:
        return None


def delete_resume(resume_url: str | None) -> None:
    if not resume_url or not resume_url.startswith(f"{RESUME_BUCKET}/"):
        return
    _client().storage.from_(RESUME_BUCKET).remove([_object_path(resume_url)])


def create_resume_signed_url(resume_url: str) -> str:
    if not resume_url or not resume_url.startswith(f"{RESUME_BUCKET}/"):
        raise ValueError("Resume storage path is invalid")
    result = _client().storage.from_(RESUME_BUCKET).create_signed_url(
        _object_path(resume_url),
        SIGNED_URL_EXPIRES,
    )
    return result.get("signedURL") or result.get("signedUrl") or result["signed_url"]


def resume_filename(resume_url: str | None) -> str | None:
    if not resume_url:
        return None
    return Path(resume_url).name.split("_", 1)[-1]