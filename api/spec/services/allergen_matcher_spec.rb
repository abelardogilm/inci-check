# frozen_string_literal: true

require "rails_helper"

RSpec.describe AllergenMatcher do
  let!(:limonene) { create(:allergen, name: "Limonene") }
  let!(:fragrance) { create(:allergen, name: "Fragrance") }

  before { create(:allergen_alias, allergen: fragrance, name: "parfum") }

  describe ".call" do
    it "matches an ingredient against a canonical allergen name" do
      result = described_class.call("Aqua, Limonene, Glycerin")

      expect(result.allergens).to contain_exactly(limonene)
    end

    it "matches regardless of the input's casing" do
      result = described_class.call("AQUA, lImOnEnE, Glycerin")

      expect(result.allergens).to contain_exactly(limonene)
    end

    it "matches an ingredient against a known alias" do
      result = described_class.call("Aqua, Parfum, Glycerin")

      expect(result.allergens).to contain_exactly(fragrance)
    end

    it "records the original token on a match" do
      match = described_class.call("Parfum").matches.first
      expect(match.token).to eq("Parfum")
    end

    it "records the catalog text that was matched" do
      match = described_class.call("Parfum").matches.first
      expect(match.matched_text).to eq("parfum")
    end

    it "records the matched allergen" do
      match = described_class.call("Parfum").matches.first
      expect(match.allergen).to eq(fragrance)
    end

    it "finds multiple distinct matches in one list" do
      result = described_class.call("Limonene, Aqua, Parfum")

      expect(result.allergens).to contain_exactly(limonene, fragrance)
    end

    it "does not match an ingredient that isn't in the catalog" do
      result = described_class.call("Aqua, Glycerin")

      expect(result.matches).to be_empty
    end

    it "lists unmatched tokens separately" do
      result = described_class.call("Aqua, Limonene")

      expect(result.unmatched_tokens).to eq(["Aqua"])
    end

    it "tolerates extra whitespace around ingredients" do
      result = described_class.call("  Aqua ,   Limonene  ,Glycerin")

      expect(result.allergens).to contain_exactly(limonene)
    end

    it "strips a trailing period from the last ingredient" do
      result = described_class.call("Aqua, Limonene.")

      expect(result.allergens).to contain_exactly(limonene)
    end

    it "ignores blank segments from stray commas" do
      result = described_class.call("Aqua,, Limonene,")

      expect(result.allergens).to contain_exactly(limonene)
    end

    it "returns no matches for blank input" do
      expect(described_class.call("").matches).to be_empty
    end

    it "returns no unmatched tokens for blank input" do
      expect(described_class.call("").unmatched_tokens).to be_empty
    end

    it "does not consider a match found when there are none" do
      result = described_class.call("Aqua, Glycerin")

      expect(result.any_matches?).to be(false)
    end

    it "considers a match found when there is at least one" do
      result = described_class.call("Aqua, Limonene")

      expect(result.any_matches?).to be(true)
    end
  end
end
