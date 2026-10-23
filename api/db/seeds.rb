# frozen_string_literal: true

# EU Cosmetics Regulation (EC) No 1223/2009, Annex III: the original 26
# fragrance allergens that must be individually named on a cosmetic label
# above a threshold concentration. See docs/decisions/0005-allergen-seed-data.md
# for why this list (not the 2023/1545 expansion to 82) and its sourcing.
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
  { name: "Citral", aliases: ["Geranial"] },
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

FRAGRANCE_ALLERGENS.each do |entry|
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
