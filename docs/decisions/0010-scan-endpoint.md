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
