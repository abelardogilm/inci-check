# frozen_string_literal: true

require "rails_helper"

# Guards against transcription slips in db/seeds.rb's regulatory allergen
# lists (duplicate entries, a name colliding with an alias, etc.) — see
# docs/decisions/0005-allergen-seed-data.md for why this data is hand-
# transcribed from regulatory text rather than generated.
RSpec.describe "seeding the allergen catalog", type: :model do
  it "loads cleanly" do
    expect { load Rails.root.join("db/seeds.rb") }.not_to raise_error
  end

  it "seeds the full fragrance + skin-sensitizer allergen list" do
    load Rails.root.join("db/seeds.rb")

    expect(Allergen.count).to eq(99)
  end

  it "includes Methylisothiazolinone" do
    load Rails.root.join("db/seeds.rb")

    expect(Allergen.exists?(name: "Methylisothiazolinone")).to be true
  end

  it "includes Benzisothiazolinone" do
    load Rails.root.join("db/seeds.rb")

    expect(Allergen.exists?(name: "Benzisothiazolinone")).to be true
  end

  it "has no duplicate allergen names, case-insensitively" do
    load Rails.root.join("db/seeds.rb")

    names = Allergen.pluck(:name).map(&:downcase)
    expect(names.uniq.size).to eq(names.size)
  end

  it "has no alias name colliding with another allergen's own name" do
    load Rails.root.join("db/seeds.rb")

    allergen_names = Allergen.pluck(:name).to_set(&:downcase)
    alias_names = AllergenAlias.pluck(:name).map(&:downcase)

    expect(alias_names.select { |name| allergen_names.include?(name) }).to be_empty
  end
end
