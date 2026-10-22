# frozen_string_literal: true

class Allergen < ApplicationRecord
  has_many :allergen_aliases, dependent: :destroy
  has_many :user_allergens, dependent: :destroy
  has_many :users, through: :user_allergens

  normalizes :name, with: ->(name) { name.strip }

  validates :name, presence: true, uniqueness: { case_sensitive: false }

  after_create :ensure_dehyphenated_alias

  # A hyphen in a name (e.g. "Alpha-Isomethyl Ionone") is ambiguous once a
  # label wraps mid-line: ScansController's OCR line reconstruction strips a
  # trailing "-" at a line break to rejoin words split across lines, which
  # also strips a hyphen that's genuinely part of the name if the wrap
  # happens to land right on it. This alias catches that case without
  # weakening AllergenMatcher's exact-match design (ADR 8).
  def ensure_dehyphenated_alias
    return unless name.include?("-")

    allergen_aliases.find_or_create_by!(name: name.delete("-"))
  end
end
