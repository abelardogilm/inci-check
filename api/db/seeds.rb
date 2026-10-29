# frozen_string_literal: true

# EU Cosmetics Regulation (EC) No 1223/2009, Annex III: the original 26
# fragrance allergens that must be individually named on a cosmetic label
# above a threshold concentration. See docs/decisions/0005-allergen-seed-data.md
# for why this list started as a deliberate subset, and for the sourcing of
# its later expansion to the full post-2023/1545 list below.
FRAGRANCE_ALLERGENS = [
  { name: "Amyl Cinnamal", aliases: ["Amylcinnamaldehyde"] },
  { name: "Amylcinnamyl Alcohol", aliases: [] },
  { name: "Anisyl Alcohol", aliases: ["Anise Alcohol"] },
  { name: "Benzyl Alcohol", aliases: [] },
  { name: "Benzyl Benzoate", aliases: [] },
  { name: "Benzyl Cinnamate", aliases: [] },
  { name: "Benzyl Salicylate", aliases: [] },
  { name: "Cinnamal", aliases: ["Cinnamaldehyde"] },
  { name: "Cinnamyl Alcohol", aliases: [] },
  { name: "Citral", aliases: %w[Geranial Neral] },
  { name: "Citronellol", aliases: [] },
  { name: "Coumarin", aliases: [] },
  { name: "Eugenol", aliases: [] },
  { name: "Evernia Furfuracea Extract", aliases: ["Treemoss Extract"] },
  { name: "Evernia Prunastri Extract", aliases: ["Oakmoss Extract"] },
  { name: "Farnesol", aliases: [] },
  { name: "Geraniol", aliases: [] },
  { name: "Hexyl Cinnamal", aliases: ["Hexyl Cinnamaldehyde"] },
  { name: "Hydroxycitronellal", aliases: [] },
  { name: "Hydroxyisohexyl 3-Cyclohexene Carboxaldehyde", aliases: %w[Lyral HICC] },
  { name: "Isoeugenol", aliases: [] },
  { name: "Limonene", aliases: ["Dipentene"] },
  { name: "Linalool", aliases: [] },
  { name: "Methyl 2-Octynoate", aliases: ["Methyl Heptine Carbonate"] },
  { name: "Alpha-Isomethyl Ionone", aliases: ["Gamma Methylionone"] },
  { name: "Butylphenyl Methylpropional", aliases: %w[Lilial BMHCA] }
].freeze

# Kept separate from FRAGRANCE_ALLERGENS (merged below) so each list's
# regulatory sourcing/history stays independently readable and citable.

# The 56 fragrance allergens added by Regulation (EU) 2023/1545 (entries
# 109, 114, 122, 124, 131, 133, 154, 157, 175, 196, 324 replacing prior
# placeholders, and new entries 327-371) amending Annex III of Regulation
# (EC) No 1223/2009, cross-referenced against the consolidated PDF of
# CELEX:32023R1545 (not the amendment-diff text alone — see ADR 5) and the
# November 2025 corrigendum (OJ L 2025/90876, CELEX:32023R1545R(02)), which
# renamed "Rose ketone 4 (Damascone)" to "Rose ketone 4 (Damascenone)" and
# added "Pelargonium Graveolens Leaf Oil"/"Pogostemon Cablin Leaf Oil" as
# further declarable names on the existing entries (not new substances).
# Name chosen per entry is the literal Name of Common Ingredients Glossary
# (INCI) text expected on a real label, not the regulation's "/"-joined
# declared-name shorthand (e.g. "Cedrus Atlantica Oil/Extract") which never
# appears verbatim on packaging.
NEW_FRAGRANCE_ALLERGENS_2023_1545 = [
  { name: "Pinus Mugo Leaf Oil", aliases: ["Pinus Mugo Twig Leaf Extract", "Pinus Mugo Twig Leaf Oil"] },
  { name: "Pinus Pumila Needle Extract", aliases: ["Pinus Pumila Twig Leaf Extract", "Pinus Pumila Twig Leaf Oil"] },
  { name: "Cedrus Atlantica Bark Extract",
    aliases: ["Cedrus Atlantica Bark Oil", "Cedrus Atlantica Bark Water", "Cedrus Atlantica Leaf Extract",
              "Cedrus Atlantica Wood Extract", "Cedrus Atlantica Wood Oil"] },
  { name: "Turpentine", aliases: [] },
  { name: "Alpha-Terpinene", aliases: [] },
  { name: "Terpinolene", aliases: [] },
  { name: "Myroxylon Pereirae Oil",
    aliases: ["Myroxylon Balsamum Pereirae Balsam Extract", "Myroxylon Balsamum Pereirae Balsam Oil",
              "Myroxylon Pereirae Resin Extract", "Myroxylon Pereirae Resin", "Peru Balsam"] },
  # Declared on-label as "Rose Ketones" (a whole class of damascone/damascenone
  # isomers), not as any individual isomer name — see ADR 5 for why aliases
  # here stay minimal rather than enumerating every isomer from the corrigendum.
  { name: "Rose Ketones", aliases: %w[Damascone Damascenone] },
  { name: "3-Propylidenephthalide", aliases: [] },
  { name: "Lippia Citriodora Absolute", aliases: ["Verbena Absolute"] },
  { name: "Methyl Salicylate", aliases: [] },
  { name: "Acetyl Cedrene", aliases: [] },
  { name: "Amyl Salicylate", aliases: [] },
  { name: "Anethole", aliases: [] },
  { name: "Benzaldehyde", aliases: [] },
  { name: "Camphor", aliases: [] },
  { name: "Beta-Caryophyllene", aliases: [] },
  { name: "Carvone", aliases: [] },
  { name: "Dimethyl Phenethyl Acetate", aliases: [] },
  { name: "Hexadecanolactone", aliases: [] },
  { name: "Hexamethylindanopyran", aliases: [] },
  { name: "Linalyl Acetate", aliases: [] },
  { name: "Menthol", aliases: [] },
  { name: "Trimethylcyclopentenyl Methylisopentenol", aliases: [] },
  { name: "Salicylaldehyde", aliases: [] },
  { name: "Santalol", aliases: %w[Alpha-Santalol Beta-Santalol] },
  { name: "Sclareol", aliases: [] },
  { name: "Terpineol", aliases: %w[Alpha-Terpineol Beta-Terpineol Gamma-Terpineol] },
  { name: "Tetramethyl Acetyloctahydronaphthalenes", aliases: [] },
  { name: "Trimethylbenzenepropanol", aliases: [] },
  { name: "Vanillin", aliases: [] },
  { name: "Cananga Odorata Flower Oil", aliases: ["Cananga Odorata Flower Extract", "Ylang Ylang Oil"] },
  { name: "Cinnamomum Cassia Leaf Oil", aliases: [] },
  { name: "Cinnamomum Zeylanicum Bark Oil", aliases: [] },
  { name: "Citrus Aurantium Amara Flower Oil", aliases: ["Citrus Aurantium Dulcis Flower Oil", "Neroli Oil"] },
  { name: "Citrus Aurantium Amara Peel Oil",
    aliases: ["Citrus Aurantium Dulcis Peel Oil", "Citrus Sinensis Peel Oil", "Bitter Orange Oil"] },
  { name: "Citrus Aurantium Bergamia Peel Oil", aliases: ["Bergamot Oil"] },
  { name: "Citrus Limon Peel Oil", aliases: ["Lemon Oil"] },
  { name: "Cymbopogon Schoenanthus Oil",
    aliases: ["Cymbopogon Flexuosus Oil", "Cymbopogon Citratus Leaf Oil", "Lemongrass Oil"] },
  { name: "Eucalyptus Globulus Leaf Oil", aliases: ["Eucalyptus Globulus Leaf/Twig Oil"] },
  { name: "Eugenia Caryophyllus Leaf Oil",
    aliases: ["Eugenia Caryophyllus Flower Oil", "Eugenia Caryophyllus Stem Oil", "Eugenia Caryophyllus Bud Oil",
              "Clove Oil"] },
  { name: "Jasminum Grandiflorum Flower Extract",
    aliases: ["Jasminum Officinale Oil", "Jasminum Officinale Flower Extract", "Jasmine Oil"] },
  { name: "Juniperus Virginiana Oil", aliases: ["Juniperus Virginiana Wood Oil", "Cedarwood Oil"] },
  { name: "Laurus Nobilis Leaf Oil", aliases: ["Bay Oil"] },
  { name: "Lavandula Hybrida Oil",
    aliases: ["Lavandula Hybrida Extract", "Lavandula Hybrida Flower Extract",
              "Lavandula Intermedia Flower/Leaf/Stem Extract", "Lavandula Intermedia Flower/Leaf/Stem Oil",
              "Lavandula Intermedia Oil", "Lavandula Angustifolia Oil",
              "Lavandula Angustifolia Flower/Leaf/Stem Extract", "Lavender Oil"] },
  { name: "Mentha Piperita Oil", aliases: ["Peppermint Oil"] },
  { name: "Mentha Viridis Leaf Oil", aliases: ["Spearmint Oil"] },
  { name: "Narcissus Poeticus Extract",
    aliases: ["Narcissus Pseudonarcissus Flower Extract", "Narcissus Jonquilla Extract",
              "Narcissus Tazetta Extract"] },
  # Corrigendum (2025/90876) added "Pelargonium Graveolens Leaf Oil" as a
  # further declarable name on this same entry, not a new substance.
  { name: "Pelargonium Graveolens Oil",
    aliases: ["Pelargonium Graveolens Flower Oil", "Pelargonium Graveolens Leaf Oil", "Geranium Oil"] },
  # Corrigendum (2025/90876) added "Pogostemon Cablin Leaf Oil" as a further
  # declarable name on this same entry, not a new substance.
  { name: "Pogostemon Cablin Oil", aliases: ["Pogostemon Cablin Leaf Oil", "Patchouli Oil"] },
  { name: "Rosa Damascena Flower Oil",
    aliases: ["Rosa Damascena Flower Extract", "Rosa Alba Flower Oil", "Rosa Alba Flower Extract",
              "Rosa Canina Flower Oil", "Rosa Centifolia Flower Oil", "Rosa Centifolia Flower Extract",
              "Rosa Gallica Flower Oil", "Rosa Moschata Flower Oil", "Rosa Rugosa Flower Oil", "Rose Oil"] },
  { name: "Santalum Album Oil", aliases: ["Sandalwood Oil"] },
  { name: "Eugenyl Acetate", aliases: [] },
  { name: "Geranyl Acetate", aliases: [] },
  { name: "Isoeugenyl Acetate", aliases: [] },
  { name: "Pinene", aliases: %w[Alpha-Pinene Beta-Pinene] }
].freeze

# Non-fragrance contact allergens from the European Baseline Series — the
# standard patch-test panel maintained by the European Society of Contact
# Dermatitis (ESCD), cross-referenced against Wilkinson et al. 2023
# ("The European baseline series and recommended additions: 2023",
# Contact Dermatitis, DOI 10.1111/cod.14255) and the PMC-hosted 2021/2022
# ESSCA/EBS/GEIDAC results paper (PMC13238334) for the fuller substance
# list. See docs/decisions/0005-allergen-seed-data.md for why the app's
# allergen catalog isn't scoped to fragrances specifically, and for which
# baseline-series entries were deliberately left out.
#
# Unlike Annex III, this series exists for diagnostic patch testing, not
# cosmetic-label declaration — most of its ~35 entries (metal salts like
# nickel/cobalt/potassium dichromate, rubber-industry chemicals, textile
# dyes, prescription corticosteroids, "mix" reagents that aren't
# themselves INCI names) would never appear as a literal ingredient-list
# token for AllergenMatcher's exact-match design (ADR 8) to find — adding
# them would give a false sense of coverage, not real protection. Only
# entries with a genuine, single INCI/CIG name realistically found on a
# cosmetic label are included here. Entries already covered by the
# fragrance lists above (Myroxylon Pereirae, HICC/Lyral) are not repeated.
SKIN_SENSITIZER_ALLERGENS = [
  { name: "Methylisothiazolinone", aliases: %w[MIT MI] },
  { name: "Methylchloroisothiazolinone", aliases: %w[CMIT Chloromethylisothiazolinone] },
  { name: "Benzisothiazolinone", aliases: ["BIT"] },
  { name: "Formaldehyde", aliases: ["Formalin"] },
  { name: "Quaternium-15", aliases: [] },
  { name: "Methyldibromo Glutaronitrile", aliases: ["MDBGN"] },
  { name: "Methylparaben", aliases: [] },
  { name: "Ethylparaben", aliases: [] },
  { name: "Propylparaben", aliases: [] },
  { name: "Butylparaben", aliases: [] },
  { name: "Lanolin", aliases: ["Lanolin Alcohol", "Wool Alcohols"] },
  { name: "Colophonium", aliases: ["Rosin"] },
  { name: "P-Tert-Butylphenol Formaldehyde Resin", aliases: ["PTBP Resin"] },
  { name: "Hydroxyethyl Methacrylate", aliases: ["HEMA", "2-Hydroxyethyl Methacrylate"] },
  { name: "P-Phenylenediamine", aliases: ["PPD"] },
  { name: "Propolis", aliases: ["Propolis Extract", "Propolis Wax"] },
  { name: "Decyl Glucoside", aliases: [] }
].freeze

ALL_ALLERGENS = (FRAGRANCE_ALLERGENS + NEW_FRAGRANCE_ALLERGENS_2023_1545 + SKIN_SENSITIZER_ALLERGENS).freeze

ALL_ALLERGENS.each do |entry|
  allergen = Allergen.find_or_create_by!(name: entry[:name])
  # These only fire on first creation (after_create callbacks) — call them
  # explicitly too so re-seeding an already-existing allergen still
  # backfills aliases added since it was first seeded.
  allergen.ensure_dehyphenated_alias
  allergen.ensure_confusable_i_aliases

  entry[:aliases].each do |alias_name|
    allergen.allergen_aliases.find_or_create_by!(name: alias_name)
  end
end

Rails.logger.debug { "Seeded #{Allergen.count} allergens with #{AllergenAlias.count} aliases." }
