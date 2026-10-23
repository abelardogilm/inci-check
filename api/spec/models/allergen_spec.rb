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

  it "adds a confusable-I alias when the name has one word-initial capital I" do
    allergen = create(:allergen, name: "Isoeugenol")

    expect(allergen.allergen_aliases.pluck(:name)).to include("lsoeugenol")
  end

  it "adds one alias per combination of word-initial capital Is for a name with several" do
    allergen = create(:allergen, name: "Alpha-Isomethyl Ionone")

    expect(allergen.allergen_aliases.pluck(:name)).to include(
      "alpha-lsomethyl ionone", "alpha-isomethyl lonone", "alpha-lsomethyl lonone"
    )
  end

  it "does not add a confusable-I alias for a capital I that isn't word-initial" do
    allergen = create(:allergen, name: "FooIbar")

    expect(allergen.allergen_aliases).to be_empty
  end

  it "is idempotent when called again for confusable-I aliases" do
    allergen = create(:allergen, name: "Isoeugenol")

    expect { allergen.ensure_confusable_i_aliases }.not_to change(AllergenAlias, :count)
  end
end
