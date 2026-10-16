# frozen_string_literal: true

FactoryBot.define do
  factory :allergen_alias do
    allergen
    sequence(:name) { |n| "Allergen alias #{n}" }
  end
end
