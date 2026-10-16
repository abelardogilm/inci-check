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
end
