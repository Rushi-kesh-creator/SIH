"""Sentence Transformer loading and embedding generation."""

from functools import lru_cache

import numpy as np
from sentence_transformers import SentenceTransformer

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


@lru_cache(maxsize=2)
def load_model(model_name: str = MODEL_NAME) -> SentenceTransformer:
    """Load a model once per process and reuse it across requests."""
    try:
        return SentenceTransformer(model_name)
    except Exception as exc:
        raise RuntimeError(
            f"Failed to load model '{model_name}'. Ensure model access is available: {exc}"
        ) from exc


def generate_embedding(text: str, model: SentenceTransformer) -> np.ndarray:
    """Generate one dense embedding, matching the source truncation behavior."""
    if not text or not text.strip():
        raise ValueError("Cannot generate embedding for empty text.")
    return model.encode(text[:10000], convert_to_numpy=True, show_progress_bar=False)


def get_embedding_dimension(model: SentenceTransformer) -> int:
    return model.get_sentence_embedding_dimension()