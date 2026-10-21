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


class OcrLine(BaseModel):
    text: str
    confidence: float


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
    """Group pytesseract's per-word output into per-line text + average confidence.

    `data` has the shape of pytesseract.image_to_data(..., output_type=Output.DICT):
    parallel lists including "text", "block_num", "par_num", "line_num", "conf".
    """
    lines: dict[tuple[int, int, int], dict[str, list]] = {}

    for i, word in enumerate(data["text"]):
        word = word.strip()
        if not word:
            continue

        key = (data["block_num"][i], data["par_num"][i], data["line_num"][i])
        line = lines.setdefault(key, {"words": [], "confidences": []})
        line["words"].append(word)

        confidence = float(data["conf"][i])
        if confidence >= 0:
            line["confidences"].append(confidence)

    return [
        OcrLine(
            text=" ".join(line["words"]),
            confidence=average_confidence(line["confidences"]),
        )
        for line in lines.values()
    ]


def average_confidence(confidences: list[float]) -> float:
    if not confidences:
        return 0.0

    # Tesseract reports confidence as 0-100; the service's contract is 0-1.
    return sum(confidences) / len(confidences) / 100
