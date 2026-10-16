# frozen_string_literal: true

FactoryBot.define do
  factory :allergen do
    sequence(:name) { |n| "Allergen #{n}" }
  end
end
