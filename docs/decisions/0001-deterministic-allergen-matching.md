# 1. Allergen matching is deterministic, not AI-judged

## Status

Accepted

## Context

inci-check reads a photo of a cosmetic ingredient list via OCR and checks it against a user's personal allergen list. A wrong "safe" result could cause real harm.

## Decision

- OCR only extracts text. The safety decision itself comes from deterministic matching of extracted ingredients against a database of INCI names and known synonyms, not from an AI judgment call. This keeps results predictable and explainable.
- If the OCR output can't be read with confidence, the app flags it as unreadable instead of guessing. For an allergy use case, a false "safe" is worse than no answer.

## Consequences

- Requires maintaining a database of INCI names/synonyms rather than relying on a model's general knowledge.
- Low-confidence photos produce a "couldn't read this" result instead of a best-effort guess — this is intentional, not a bug.
