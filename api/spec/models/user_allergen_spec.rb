# frozen_string_literal: true

require "rails_helper"

RSpec.describe UserAllergen, type: :model do
  it "is valid with a user and an allergen" do
    user_allergen = build(:user_allergen)
    expect(user_allergen).to be_valid
  end

  it "requires a user" do
    user_allergen = build(:user_allergen, user: nil)
    expect(user_allergen).not_to be_valid
  end

  it "requires an allergen" do
    user_allergen = build(:user_allergen, allergen: nil)
    expect(user_allergen).not_to be_valid
  end

  it "does not allow the same user to add the same allergen twice" do
    user = create(:user)
    allergen = create(:allergen)
    create(:user_allergen, user: user, allergen: allergen)

    duplicate = build(:user_allergen, user: user, allergen: allergen)

    expect(duplicate).not_to be_valid
  end

  it "allows the same allergen to be linked to different users" do
    allergen = create(:allergen)
    create(:user_allergen, allergen: allergen)

    other = build(:user_allergen, allergen: allergen)

    expect(other).to be_valid
  end
end
