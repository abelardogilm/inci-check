# frozen_string_literal: true

require "rails_helper"

RSpec.describe ScanTextBuilder do
  it "returns a single line's text unchanged" do
    expect(described_class.call(["Aqua, Parfum, Limonene"])).to eq("Aqua, Parfum, Limonene")
  end

  it "joins multiple lines with a space" do
    expect(described_class.call(["Aqua,", "Parfum,", "Limonene"])).to eq("Aqua, Parfum, Limonene")
  end

  it "rejoins a word that a narrow column wrapped across two lines with no comma" do
    expect(described_class.call(["Aqua, Isopropyl", "Myristate, Limonene"]))
      .to eq("Aqua, Isopropyl Myristate, Limonene")
  end

  it "splices a hyphen-wrapped word back together, dropping the trailing hyphen" do
    expect(described_class.call(["Methyl 2-Octyno-", "ate, Limonene"]))
      .to eq("Methyl 2-Octynoate, Limonene")
  end

  it "handles several hyphen-wrapped lines in a row" do
    expect(described_class.call(["Al-", "pha-", "Isomethyl Ionone"]))
      .to eq("AlphaIsomethyl Ionone")
  end

  it "returns an empty string for no lines" do
    expect(described_class.call([])).to eq("")
  end
end
