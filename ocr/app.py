"""Minimal OCR service: wraps Tesseract (via pytesseract) behind a small HTTP API.

See docs/decisions/0009-ocr-engine.md for why this exists as its own
service, and why Tesseract specifically — a deliberate accuracy
trade-down for a lightweight, fast-to-build demo project.
"""

import io

import pytesseract
from fastapi import FastAPI, File, HTTPException, UploadFile
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel

app = FastAPI(title="inci-check OCR service")


class OcrWord(BaseModel):
    text: str
    confidence: float


class OcrLine(BaseModel):
    text: str
    confidence: float
    words: list[OcrWord]


class OcrResponse(BaseModel):
    lines: list[OcrLine]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/ocr", response_model=OcrResponse)
async def run_ocr(file: UploadFile = File(...)) -> OcrResponse:
    contents = await file.read()

    try:
        image = Image.open(io.BytesIO(contents))
        image.load()
    except UnidentifiedImageError:
        raise HTTPException(status_code=422, detail="Could not decode image") from None

    data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
    return OcrResponse(lines=group_into_lines(data))


def group_into_lines(data: dict) -> list[OcrLine]:
    """Group pytesseract's per-word output into lines, keeping each word's own
    confidence alongside the line's average.

    A line's average can hide a single badly-misread word inside an otherwise
    confident line (e.g. "Parfum" read as "Partum") — exposing per-word
    confidence lets a consumer distrust that one word instead of the whole
    line. See the "expose confidence per word" conversation this came from.

    `data` has the shape of pytesseract.image_to_data(..., output_type=Output.DICT):
    parallel lists including "text", "block_num", "par_num", "line_num", "conf".
    """
    lines: dict[tuple[int, int, int], list[OcrWord]] = {}

    for i, text in enumerate(data["text"]):
        text = text.strip()
        if not text:
            continue

        key = (data["block_num"][i], data["par_num"][i], data["line_num"][i])
        confidence = float(data["conf"][i])
        words = lines.setdefault(key, [])
        words.append(OcrWord(text=text, confidence=to_unit_scale(confidence)))

    return [
        OcrLine(
            text=" ".join(word.text for word in words),
            confidence=average_confidence(
                [word.confidence for word in words if word.confidence >= 0]
            ),
            words=words,
        )
        for words in lines.values()
    ]


def to_unit_scale(confidence: float) -> float:
    """Tesseract reports confidence as 0-100 (or -1 for "no confidence
    available"); the service's contract is 0-1, preserving -1 as a sentinel.
    """
    return confidence if confidence < 0 else confidence / 100


def average_confidence(confidences: list[float]) -> float:
    if not confidences:
        return 0.0

    return sum(confidences) / len(confidences)
