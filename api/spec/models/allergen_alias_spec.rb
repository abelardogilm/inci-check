# frozen_string_literal: true

require "rails_helper"

RSpec.describe AllergenAlias, type: :model do
  it "is valid with an allergen and a name" do
    alias_record = build(:allergen_alias)
    expect(alias_record).to be_valid
  end

  it "requires an allergen" do
    alias_record = build(:allergen_alias, allergen: nil)
    expect(alias_record).not_to be_valid
  end

  it "requires a name" do
    alias_record = build(:allergen_alias, name: nil)
    expect(alias_record).not_to be_valid
  end

  it "requires a name unique across all allergens, case-insensitively" do
    create(:allergen_alias, name: "Parfum")
    duplicate = build(:allergen_alias, name: "parfum")

    expect(duplicate).not_to be_valid
  end
end
