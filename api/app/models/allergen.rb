# frozen_string_literal: true

class Allergen < ApplicationRecord
  has_many :allergen_aliases, dependent: :destroy
  has_many :user_allergens, dependent: :destroy
  has_many :users, through: :user_allergens

  normalizes :name, with: ->(name) { name.strip }

  validates :name, presence: true, uniqueness: { case_sensitive: false }
end
