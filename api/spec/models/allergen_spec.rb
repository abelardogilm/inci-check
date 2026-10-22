# frozen_string_literal: true

require "rails_helper"

RSpec.describe Allergen, type: :model do
  it "is valid with a name" do
    allergen = build(:allergen)
    expect(allergen).to be_valid
  end

  it "requires a name" do
    allergen = build(:allergen, name: nil)
    expect(allergen).not_to be_valid
  end

  it "requires a unique name, case-insensitively" do
    create(:allergen, name: "Fragrance")
    duplicate = build(:allergen, name: "fragrance")

    expect(duplicate).not_to be_valid
  end

  it "strips surrounding whitespace from the name" do
    allergen = create(:allergen, name: "  Fragrance  ")
    expect(allergen.name).to eq("Fragrance")
  end

  it "destroys its aliases when destroyed" do
    allergen = create(:allergen)
    create(:allergen_alias, allergen: allergen)

    expect { allergen.destroy }.to change(AllergenAlias, :count).by(-1)
  end

  it "adds a dehyphenated alias when created with a hyphenated name" do
    allergen = create(:allergen, name: "Alpha-Isomethyl Ionone")

    expect(allergen.allergen_aliases.pluck(:name)).to include("alphaisomethyl ionone")
  end

  it "does not add an alias for a name without a hyphen" do
    allergen = create(:allergen, name: "Limonene")

    expect(allergen.allergen_aliases).to be_empty
  end

  it "is idempotent when called again on an already-dehyphenated allergen" do
    allergen = create(:allergen, name: "Alpha-Isomethyl Ionone")

    expect { allergen.ensure_dehyphenated_alias }.not_to change(AllergenAlias, :count)
  end
end
