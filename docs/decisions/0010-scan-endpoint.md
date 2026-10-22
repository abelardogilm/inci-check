# 10. Scan endpoint: accepts multiple images, unions the matches

## Status

Accepted

## Context

The two previous layers — `AllergenMatcher` (ADR 8, text in, allergens out) and the OCR service (ADR 9, image in, text + confidence out) — have been built and tested independently. This is the layer that connects them behind an authenticated app endpoint, and it's also where a real-world finding from testing the OCR service against deliberately degraded photos needs an answer.

Testing the OCR service against a curved, blurry, glare-affected synthetic label photo found that Tesseract can misread a word *confidently* — "Parfum" came back as "Partum" with 0.88 word confidence, not a low score that per-word filtering could catch. Only an actually garbled word showed low confidence. So per-word confidence (also added in this round of work) helps, but doesn't eliminate the risk of a missed allergen from a single bad photo — and per ADR 1, a missed allergen (false negative) is the failure mode that matters most here.

## Decision

`POST /api/v1/app/scans` accepts **one to several images** (a product label is curved — one angle can catch glare or blur that another won't) rather than a single photo. For each image: call the OCR service, feed its extracted text to `AllergenMatcher`, and take the **union** of allergens matched across all submitted images. If "Parfum" misreads in photo 1 but reads correctly in photo 2, the union still catches it.

This fixes the false-negative risk found above without touching `AllergenMatcher`'s exact-match design (ADR 8) or adding fuzzy/typo-tolerant matching, which would reopen the false-positive-risk trade-off that decision deliberately avoided.

Implementation notes:
- `OcrClient` (`app/services/ocr_client.rb`) wraps the HTTP call to the OCR service (Faraday). `OCR_SERVICE_URL` env var, defaulting to `http://localhost:8001` for local dev (the OCR container is not yet part of the Rails app's own container story — see ADR 9's consequences).
- A line's text from each OCR response is joined into one comma-separated blob per image before being handed to `AllergenMatcher`, so an ingredient list that Tesseract split across multiple "lines" (seen in testing, caused by label curvature) still matches correctly — matching happens per image, not per OCR-detected line.
- If OCR fails for one submitted image (service error, undecodable file), that image is skipped and the rest still get processed; the response reports which images failed. Only if *every* image fails does the endpoint return an error.

## Consequences

- The endpoint is costlier per request (N calls to the OCR service instead of one) in exchange for meaningfully better real-world reliability — an acceptable trade for a safety-relevant check.
- The eventual app UI needs to ask for 2-3 photos per scan, not one — a product/UX decision this locks in, not just a backend detail.
- Still doesn't address a word that's *confidently* misread the same way in every submitted photo (e.g. a defect specific to how that word looks, not lighting) — union only helps when the failure mode varies across shots. Worth knowing as a residual limit, not solving here.
- Confirmed by manual testing (2026-10-22, see the UI work in PR #17): a photo rotated ~45° is read as empty by the OCR service — not a misread, no text at all — so this failure mode also hits every submitted photo identically and the union doesn't help. `extracted_text` is now returned by this endpoint (and shown behind a debug toggle in the UI) specifically so a case like this is visible instead of silently reading as "no allergens found".
- **Possible future improvement, not implemented**: deskewing (auto-detecting and correcting image rotation, e.g. via OpenCV, before handing the image to Tesseract) would likely fix the rotated-photo case above. Not pursued now — it adds a preprocessing step and a heavier dependency, which cuts against the deliberate accuracy-for-weight trade-off in [ADR 9](0009-ocr-engine.md). Worth reconsidering if rotated photos turn out to be a common real-world input rather than an edge case.
