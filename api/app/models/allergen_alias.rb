# frozen_string_literal: true

class AllergenAlias < ApplicationRecord
  belongs_to :allergen

  normalizes :name, with: ->(name) { name.strip.downcase }

  validates :name, presence: true, uniqueness: true
end
