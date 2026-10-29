# 5. Seed data uses the EU's "classic 26" fragrance allergens

## Status

Accepted. Superseded in part by the 2026-10-29 updates below: the seed now
also includes the Regulation (EU) 2023/1545 fragrance expansion and a
curated set of non-fragrance skin-sensitizer allergens (preservatives,
hair-dye and nail-product chemicals, etc.) — the catalog's actual scope is
"things that cause contact allergy and can appear as a named ingredient on
a cosmetic label," not "EU fragrance allergens" specifically. The title of
this ADR stays as the historical record of the original, narrower
decision.

## Context

We need real data to seed the `Allergen`/`AllergenAlias` tables instead of only test fixtures. The EU Cosmetics Regulation (EC) No 1223/2009, Annex III, has long required 26 specific fragrance allergens to be named individually on cosmetic labels when present above a threshold — a public, authoritative, well-documented list with standard INCI names. Regulation (EU) 2023/1545 (July 2023) expanded that list to 82 substances, phased in from 31 July 2026.

Pulling the full 82-item list means transcribing it from the EUR-Lex amendment text, which only lists diffs against the prior Annex III rather than a single consolidated table — meaningfully higher risk of a transcription error for a list this size, for a seed whose only job is to make the app demoable with real data.

## Decision

Seed with the original 26 fragrance allergens (INCI names, with well-known trade names/synonyms as aliases where applicable — e.g. "Lyral" and "Lilial" as aliases of their INCI names). Source: EU Regulation (EC) No 1223/2009, Annex III, cross-checked against multiple cosmetics-regulatory summaries since this is a demo app, not a compliance tool.

## Consequences

- The seed is a real, citable regulatory list, not invented data — good for a portfolio demo.
- It is not the full current Annex III (82 substances) — expanding the seed to the full list is future work if/when it's worth the transcription effort, ideally sourced from a single consolidated table rather than the amendment diff.
- Two of the 26 (Lyral/HICC and Lilial/BMHCA) are now fully banned substances in EU cosmetics, not just allergens requiring labeling — kept in the seed since the app's job is matching against ingredients a user specifies as personal allergens, regardless of a substance's current regulatory status elsewhere.

## Update (2026-10-29): expanded to the full 82-substance list

The transcription-risk concern above was resolved by sourcing the actual
primary text instead of a secondary summary: the user supplied the
consolidated PDF of CELEX:32023R1545 (`docs/sources/CELEX_32023R1545_ES_TXT.pdf`)
and the full text of the November 2025 corrigendum (OJ L 2025/90876,
pasted inline in conversation — EUR-Lex's HTML/PDF endpoints returned
empty bodies to both `WebFetch` and a direct `curl`, likely a bot
challenge, so this was read from the PDF directly, page by page).

`api/db/seeds.rb` now seeds all 82 fragrance allergens:
- The original 26 (unchanged from the decision above).
- The 56 new allergens from entries 109, 114, 122, 124, 131, 133, 154, 157,
  175, 196, 324 (reused reference numbers for brand-new substances, not
  renames of what was there) and new entries 327-371 of the consolidated
  Annex III.

Sourcing choices worth flagging for future edits to this list:
- Each allergen's seeded `name` is the literal Name of Common Ingredients
  Glossary (INCI) text expected on a real product label — not the
  regulation's own "indicarse como 'X'" declared-name shorthand when that
  shorthand uses a `/` to mean "oil or extract, whichever applies" (e.g.
  the regulation says declare "Cedrus Atlantica Oil/Extract", but no real
  label prints that literal string — it prints one specific CIG name like
  "Cedrus Atlantica Bark Oil"). The one deliberate exception is **Rose
  Ketones**: the regulation requires that exact phrase on the label
  regardless of which underlying damascone/damascenone isomer is present,
  so that stayed the seeded name, consistent with `AllergenMatcher`'s
  exact-match design (ADR 8).
- The November 2025 corrigendum's three changes are folded in: "Rose
  ketone 4" is sourced as "Damascenone" (not "Damascone", the pre-
  corrigendum name — not that it matters for the app, since neither name
  is what's declared on-label), and "Pelargonium Graveolens Leaf Oil" /
  "Pogostemon Cablin Leaf Oil" are added as aliases on their existing
  entries (the corrigendum adds declarable names to the same substance,
  it does not introduce new substances).
- `api/spec/db/seeds_spec.rb` guards against future transcription slips:
  seed loads without error, totals exactly 82 allergens, no duplicate
  names, no alias colliding with another allergen's own name.

## Update (2026-10-29, same day): added non-fragrance skin-sensitizer allergens

Prompted by a real product label containing Methylisothiazolinone (MIT)
and Benzisothiazolinone (BIT) — preservatives, not fragrance — that the
catalog had no way to match. The user's explicit intent: the app should
warn about allergens "regardless of origin," without exposing a
fragrance/preservative/etc. category distinction in the UI (a flat list
stays simplest for someone who just wants to enter their own allergens).

Rather than invent a scope, this seeds from the **European Baseline
Series**, the standard patch-test panel maintained by the European
Society of Contact Dermatitis (ESCD) — an independent, clinically-curated
"what actually causes contact allergy" list, cross-referenced against
Wilkinson et al. 2023 (Contact Dermatitis, DOI 10.1111/cod.14255) and the
PMC-hosted 2021/2022 ESSCA/EBS/GEIDAC results paper (PMC13238334).

Deliberately **not** a full transcription of that series (~35 entries) —
most of it exists for diagnosing contact allergy to things that were
never cosmetic ingredients in the first place: metal salts (nickel,
cobalt, potassium dichromate — trace contaminants, not declared
ingredients), rubber-industry chemicals (thiuram mix, mercapto mix,
IPPD — glove/rubber allergy, not skincare), textile dye mix, and
prescription corticosteroids/antibiotics (budesonide, tixocortol
pivalate, neomycin). None of those would ever appear as a literal token
in a comma-separated cosmetic ingredient list for `AllergenMatcher`'s
exact-match design (ADR 8) to find — seeding them would look like
coverage without being real coverage, arguably worse than not having them
(a user adds "Nickel" expecting a match that is structurally impossible).

Seeded instead: every baseline-series entry with a genuine, single
INCI/CIG name realistically printed on a cosmetic label —
Methylisothiazolinone, Methylchloroisothiazolinone, Benzisothiazolinone,
Formaldehyde, Quaternium-15, Methyldibromo Glutaronitrile, the four
common parabens (Methyl/Ethyl/Propyl/Butylparaben), Lanolin, Colophonium,
P-Tert-Butylphenol Formaldehyde Resin, Hydroxyethyl Methacrylate (HEMA,
nail/gel products), P-Phenylenediamine (PPD, hair dye), Propolis, and
Decyl Glucoside. (Myroxylon Pereirae and HICC/Lyral were already in the
fragrance lists above — not duplicated.) Local anaesthetics (Caine mix
components) were also left out as a judgment call: plausible in medicated
lip/after-sun products but rare enough, and borderline enough on "is this
really a cosmetic," that they're easy to add later if it turns out to
matter.
