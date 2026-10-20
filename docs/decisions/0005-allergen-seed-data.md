# 5. Seed data uses the EU's "classic 26" fragrance allergens

## Status

Accepted

## Context

We need real data to seed the `Allergen`/`AllergenAlias` tables instead of only test fixtures. The EU Cosmetics Regulation (EC) No 1223/2009, Annex III, has long required 26 specific fragrance allergens to be named individually on cosmetic labels when present above a threshold — a public, authoritative, well-documented list with standard INCI names. Regulation (EU) 2023/1545 (July 2023) expanded that list to 82 substances, phased in from 31 July 2026.

Pulling the full 82-item list means transcribing it from the EUR-Lex amendment text, which only lists diffs against the prior Annex III rather than a single consolidated table — meaningfully higher risk of a transcription error for a list this size, for a seed whose only job is to make the app demoable with real data.

## Decision

Seed with the original 26 fragrance allergens (INCI names, with well-known trade names/synonyms as aliases where applicable — e.g. "Lyral" and "Lilial" as aliases of their INCI names). Source: EU Regulation (EC) No 1223/2009, Annex III, cross-checked against multiple cosmetics-regulatory summaries since this is a demo app, not a compliance tool.

## Consequences

- The seed is a real, citable regulatory list, not invented data — good for a portfolio demo.
- It is not the full current Annex III (82 substances) — expanding the seed to the full list is future work if/when it's worth the transcription effort, ideally sourced from a single consolidated table rather than the amendment diff.
- Two of the 26 (Lyral/HICC and Lilial/BMHCA) are now fully banned substances in EU cosmetics, not just allergens requiring labeling — kept in the seed since the app's job is matching against ingredients a user specifies as personal allergens, regardless of a substance's current regulatory status elsewhere.
