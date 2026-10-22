# frozen_string_literal: true

# Reconstructs one image's OCR lines back into a single ingredient-list
# string for AllergenMatcher. A narrow label column regularly wraps a
# multi-word ingredient name across two OCR "lines" — sometimes at a space
# (printer just breaks the line), sometimes mid-word with a trailing hyphen
# (the printer hyphenates to save space). Plain concatenation needs to tell
# these apart: a space-wrapped name needs a space put back between the
# lines, a hyphen-wrapped one needs the lines spliced together with the
# trailing hyphen dropped, not kept — see docs/decisions/0010-scan-endpoint.md.
class ScanTextBuilder
  def self.call(texts)
    new(texts).call
  end

  def initialize(texts)
    @texts = texts
  end

  def call
    texts.reduce("") { |acc, line| join(acc, line) }
  end

  private

  attr_reader :texts

  def join(acc, line)
    return line if acc.empty?

    acc.end_with?("-") ? "#{acc.delete_suffix('-')}#{line}" : "#{acc} #{line}"
  end
end
