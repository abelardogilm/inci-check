# frozen_string_literal: true

class AllergenAlias < ApplicationRecord
  belongs_to :allergen

  normalizes :name, with: ->(name) { name.strip }

  validates :name, presence: true, uniqueness: { case_sensitive: false }
end
