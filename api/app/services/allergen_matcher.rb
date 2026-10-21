# frozen_string_literal: true

# Matches a comma-separated ingredient list against the Allergen/AllergenAlias
# catalog. Deterministic, exact-match only — see docs/decisions/0008-allergen-matcher.md.
class AllergenMatcher
  Match = Struct.new(:token, :allergen, :matched_text, keyword_init: true)

  Result = Struct.new(:matches, :unmatched_tokens, keyword_init: true) do
    def allergens
      matches.map(&:allergen).uniq
    end

    def any_matches?
      matches.any?
    end
  end

  def self.call(text)
    new(text).call
  end

  def initialize(text)
    @text = text.to_s
  end

  def call
    classified = tokens.map { |token| [token, find(token)] }

    matches = build_matches(classified)
    unmatched_tokens = classified.filter_map { |token, found| token unless found }

    Result.new(matches: matches, unmatched_tokens: unmatched_tokens)
  end

  private

  def build_matches(classified)
    classified.filter_map do |token, found|
      next unless found

      Match.new(token: token, allergen: found[:allergen], matched_text: found[:matched_text])
    end
  end

  def tokens
    @text.split(",").map { |token| token.strip.sub(/\.\z/, "").strip }.reject(&:empty?)
  end

  def find(token)
    normalized = token.downcase

    if (allergen = allergens_by_name[normalized])
      return { allergen: allergen, matched_text: allergen.name }
    end

    return unless (alias_record = aliases_by_name[normalized])

    { allergen: alias_record.allergen, matched_text: alias_record.name }
  end

  def allergens_by_name
    @allergens_by_name ||= Allergen.all.index_by { |allergen| allergen.name.downcase }
  end

  def aliases_by_name
    @aliases_by_name ||= AllergenAlias.includes(:allergen).index_by(&:name)
  end
end
