# frozen_string_literal: true

class Allergen < ApplicationRecord
  has_many :allergen_aliases, dependent: :destroy
  has_many :user_allergens, dependent: :destroy
  has_many :users, through: :user_allergens

  normalizes :name, with: ->(name) { name.strip }

  validates :name, presence: true, uniqueness: { case_sensitive: false }

  after_create :ensure_dehyphenated_alias
  after_create :ensure_confusable_i_aliases

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

  # A capital "I" starting a word is sometimes read by Tesseract as a
  # lowercase "l" — confirmed on a real label photo ("Ionone" -> "lonone").
  # Image preprocessing (grayscale/contrast/sharpen/scale, tried against the
  # same photo) didn't fix this specific confusion, so it's handled here
  # instead: one alias per combination of word-initial "I"s swapped for "l"
  # (a name can have more than one, and OCR may only mangle some of them —
  # "Alpha-Isomethyl Ionone" needs 3 variants, not just the all-swapped one).
  # Each variant is an explicit, enumerated alias, not pattern-based fuzzy
  # matching — keeps AllergenMatcher's exact-match design intact (ADR 8).
  def ensure_confusable_i_aliases
    positions = word_initial_capital_i_positions
    return if positions.empty?

    (1...(2**positions.size)).each do |mask|
      allergen_aliases.find_or_create_by!(name: swap_is(positions, mask))
    end
  end

  private

  def word_initial_capital_i_positions
    name.chars.each_index.select do |i|
      name[i] == "I" && (i.zero? || [" ", "-"].include?(name[i - 1]))
    end
  end

  def swap_is(positions, mask)
    chars = name.chars
    positions.each_with_index { |pos, bit| chars[pos] = "l" if mask[bit] == 1 }
    chars.join
  end
end
