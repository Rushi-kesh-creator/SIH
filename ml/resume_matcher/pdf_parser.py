"""PDF text extraction adapted from SIH2026 backend/utils/pdf_parser.py."""

import io
import re

import PyPDF2


def clean_extracted_text(text: str) -> str:
    """Normalize common PDF extraction artifacts."""
    text = re.sub(r"[^\x20-\x7E\n\t]", " ", text)
    text = re.sub(r"-\n(\w)", r"\1", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return "\n".join(line.strip() for line in text.split("\n")).strip()


def extract_text_from_pdf(pdf_file) -> str:
    """Extract and clean text from a file-like PDF object."""
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(pdf_file.read()))
        if not reader.pages:
            raise ValueError("The PDF file contains no pages.")

        pages = []
        for page in reader.pages:
            try:
                page_text = page.extract_text()
                if page_text:
                    pages.append(page_text)
            except Exception:
                continue

        if not pages:
            raise ValueError("No readable text found in the PDF. The file may be scanned or image-based.")
        return clean_extracted_text("\n".join(pages))
    except PyPDF2.errors.PdfReadError as exc:
        raise ValueError(f"Could not read PDF file: {exc}") from exc
    except ValueError:
        raise
    except Exception as exc:
        raise ValueError(f"PDF extraction failed: {exc}") from exc