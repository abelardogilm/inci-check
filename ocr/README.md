# OCR service

Self-hosted OCR (Tesseract, via `pytesseract`) behind a small FastAPI wrapper. See [ADR 9](../docs/decisions/0009-ocr-engine.md) for why — a deliberate accuracy-for-weight trade-down appropriate for a demo project.

Every image is preprocessed (grayscale, upscaled 1.5x, contrast boosted) before Tesseract sees it — see `preprocess()` in `app.py`.

## Running it

From the repo root:

```sh
docker compose up ocr
```

## API

- `GET /health` — `{"status": "ok"}`
- `POST /ocr` — multipart form, field `file` (an image). Returns each detected line with its text and average confidence, plus the confidence of each individual word — a line's average can hide one badly-misread word (e.g. "Parfum" read as "Partum" with *high* word confidence, since Tesseract confidently recognized the wrong characters):

```json
{
  "lines": [
    {
      "text": "Aqua, Parfum, Limonene",
      "confidence": 0.93,
      "words": [
        { "text": "Aqua,", "confidence": 0.95 },
        { "text": "Parfum,", "confidence": 0.9 },
        { "text": "Limonene", "confidence": 0.94 }
      ]
    }
  ]
}
```

## Manual test

```sh
curl -F "file=@/path/to/label.jpg" http://localhost:8001/ocr
```

## Tests and linting

Needs a local `tesseract` binary (`brew install tesseract` / `apt-get install tesseract-ocr`). With that, from `ocr/`:

```sh
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
pytest
ruff check . && ruff format --check .
```

No local `tesseract`? Run the same commands inside the Docker image instead, mounting the source so edits are picked up:

```sh
docker compose run --rm --entrypoint="" -v "$(pwd):/app" ocr \
  sh -c "pip install --quiet pytest httpx ruff && python -m pytest tests/ -v"
```
