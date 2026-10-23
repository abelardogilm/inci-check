# 9. OCR engine: self-hosted Tesseract in its own Docker service

## Status

Accepted

## Context

ADR 2 decided OCR runs on the backend, but left the actual engine open. Options considered, in the order they were actually tried:

1. **A cloud OCR API** (Google Cloud Vision, AWS Textract, ...). Best real-world accuracy on the kind of photo this app deals with — curved, glossy cosmetic packaging under inconsistent lighting, not flat scanned documents. Rejected: it needs an external account, an API key to manage, a per-request cost past a free tier (Cloud Vision: 1,000 units/month free, then $1.50/1,000 up to 5M — https://cloud.google.com/vision/pricing), and the app stops being runnable as a self-contained thing — a real downside specifically for a project meant to be shown and run end-to-end without a reviewer needing a cloud account.
2. **An LLM/vision-model-based "OCR."** Rejected outright, not just for this app's resource constraints: a multimodal model can hallucinate plausible-looking text that isn't actually on the label, which directly violates ADR 1's core promise — deterministic matching against text that was actually, confidently read, not guessed.
3. **PaddleOCR**, self-hosted. Tried first among the self-hosted deep-learning options. Dropped: PyPI has no Linux ARM64 wheel for `paddlepaddle` at all (only macOS ARM64 and Linux x86_64), so the Docker image failed to build on this Apple Silicon machine — and would fail the same way on an ARM64 Linux host (e.g. AWS Graviton), undermining the "runs anywhere via `docker compose up`" goal.
4. **EasyOCR**, self-hosted. Tried next — PyTorch does publish proper `manylinux2014_aarch64` wheels, so the image built on both architectures. Also dropped, for a different reason: the resulting image is close to 2GB and took ~20 minutes to build, dominated by PyTorch. That's a heavy, slow-to-build dependency for a personal/portfolio project — closer to a production accuracy budget than this project needs — and became a real problem in practice when the build nearly filled the local disk.

## Decision

**Tesseract** (`tesseract-ocr` via apt + the `pytesseract` wrapper), self-hosted in its own small Docker service — `ocr/`, a FastAPI app with a single `POST /ocr` endpoint — same shape as the rejected alternatives, just a much lighter engine underneath. The image is ~450MB (vs. ~2GB for the EasyOCR attempt) and builds in under two minutes instead of ~20.

This is a conscious accuracy trade-down, not an oversight: Tesseract's real-world accuracy on photographed, curved, glossy product packaging is behind both the cloud APIs and the deep-learning self-hosted options above. For a demo/portfolio project — not a tool making real safety-critical calls for real users — build weight, disk footprint, and iteration speed matter more here than squeezing out the last bit of OCR accuracy. The architecture (OCR fully isolated behind an HTTP service, the matcher in ADR 8 only ever sees extracted text) means swapping Tesseract for EasyOCR, PaddleOCR, or a cloud API later only touches this one service — nothing else needs to change if accuracy ever becomes the thing to optimize for.

## Consequences

- No external account, API key, or per-request cost; the whole app, OCR included, runs via `docker compose up`, builds natively on both ARM64 and x86_64, and builds fast.
- Pulls Docker into the project for the first time. Only the OCR service is containerized for now; dockerizing `api/`/`web/` for local dev is a separate decision, not bundled into this one.
- Accuracy on real cosmetic-product photos (as opposed to flat printed text) is the known weak point. Worth revisiting with real test photos before this is ever more than a demo.
- A real label photo (2026-10-23) found Tesseract misreading several characters it had no trouble with on cleaner test images — a word-initial capital "I" as lowercase "l", and separately a trailing "l" as "!". `app.py`'s `preprocess` (grayscale, 1.5x upscale, contrast boost) fixed the "!" misread but not the "I"/"l" one, which only `Allergen#ensure_confusable_i_aliases` on the Rails side (an explicit, enumerated alias, not fuzzy matching) could close — preprocessing alone isn't a complete answer to Tesseract's accuracy ceiling on this kind of photo.
- `pytesseract` returns a confidence per word, not per line — the service averages word confidences within each detected line to produce the per-line confidence ADR 1 wants for "flag doubtful reads." Deciding what to *do* with a low-confidence line is still next-layer work (the Rails side consuming this service), not this one.
