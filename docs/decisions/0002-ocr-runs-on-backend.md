# 2. OCR runs on the backend, not the client

## Status

Accepted

## Context

The end-to-end flow is: a client (web, and later possibly mobile) captures or uploads a photo of an ingredient list; the text must be extracted (OCR) and then matched against the user's allergen list ([ADR 1](0001-deterministic-allergen-matching.md)).

OCR could run in two places:

- **Client-side**, e.g. Tesseract.js in the browser or an on-device ML Kit model. Keeps the raw photo off the server, reduces backend load, and gives faster feedback.
- **Backend**, using a server-side OCR engine/service. Keeps the image upload, but centralizes the extraction logic.

ADR 1 already commits to a safety-critical property: a low-confidence read must be flagged, not guessed. That property depends on how trustworthy the OCR engine's confidence signal is, and on being able to tune or swap the engine without touching every client.

## Decision

OCR runs on the backend. The client uploads the photo (or, as a later optimization, pre-extracted text); the backend is the single place that extracts text, scores confidence, and feeds the deterministic allergen matcher.

## Consequences

- One place to improve OCR quality and confidence scoring — no client release needed to change engines or tune thresholds.
- Behavior is consistent across every client (web now, mobile or others later) instead of depending on each platform's local OCR capability.
- Easier to test: RSpec can exercise the matching pipeline against fixture images/OCR outputs.
- Images are uploaded to the backend, which costs more bandwidth/compute and more data handling than a client-only flow.
- Not a locked-in choice: the backend API can be designed to also accept pre-extracted text, so moving OCR to the client later is an incremental change, not a rearchitecture.

## Future consideration: separate admin UI

Out of scope for now, but worth noting: as the allergen/INCI database and user base grow, a separate admin UI (e.g. for curating INCI synonyms, reviewing flagged low-confidence reads, managing users) may become useful, distinct from the end-user `web/` app. Not needed for the current scope and not being built yet.
