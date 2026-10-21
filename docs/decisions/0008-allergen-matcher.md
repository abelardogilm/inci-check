# 8. Allergen matcher: deterministic, comma-split, exact-token matching

## Status

Accepted

## Context

This is the first implementation of the matching core described in ADR 1 — the part of the app that actually decides "does this product contain something you're allergic to," independent of OCR (ADR 2) or any API surface. Building it first, against plain text, means the riskiest and most novel part of the product gets proven out before committing to an OCR provider or wiring up endpoints — if the OCR layer changes later, this doesn't.

Cosmetic ingredient lists are a known, fairly rigid format: a comma-separated list of INCI names, e.g. "Aqua, Parfum, Glycerin, Limonene, Citric Acid." That structure is reliable enough to build a first version on.

## Decision

`AllergenMatcher` (`app/services/allergen_matcher.rb`) takes a raw text string and:

1. Splits it on commas into candidate ingredient tokens, trimming whitespace and a trailing period (labels often end the list with one).
2. Normalizes each token (strip + downcase) and looks it up against the full `Allergen` and `AllergenAlias` catalog, loaded once per call.
3. Returns every exact match — a token can match a canonical `Allergen.name` or an `AllergenAlias.name` — plus the list of tokens that matched nothing.

Matching is exact-string, not fuzzy: per ADR 1, a wrong match (false positive or negative) is worse than being strict, so there's no partial/fuzzy matching, typo tolerance, or substring matching here. Garbage in (a misread OCR token) should fail to match and surface as "unmatched," not silently match something close.

## Consequences

- Fast and fully deterministic — no external dependency, trivial to unit test exhaustively.
- Known gap: doesn't parse parenthetical annotations some EU labels use (e.g. "Hydroxyisohexyl 3-Cyclohexene Carboxaldehyde (Lyral)" as one comma-delimited item) — today that whole string is one token and won't match either name on its own. Worth revisiting once real labels are tested against it.
- Confidence/uncertainty handling (ADR 1's "flag doubtful reads, don't guess") is explicitly out of scope here — that's the OCR layer's job once it exists, deciding what text is trustworthy enough to even pass to this matcher. This matcher trusts whatever text it's given.
