# frozen_string_literal: true

require "rails_helper"

RSpec.describe OcrClient do
  let(:fixture_path) { Rails.root.join("spec/fixtures/files/label.png") }

  describe "#extract_lines" do
    context "with a successful response" do
      before do
        stub_request(:post, "http://localhost:8001/ocr").to_return(
          status: 200,
          headers: { "Content-Type" => "application/json" },
          body: {
            lines: [
              {
                text: "Aqua, Parfum",
                confidence: 0.9,
                words: [
                  { text: "Aqua,", confidence: 0.95 },
                  { text: "Parfum", confidence: 0.85 }
                ]
              }
            ]
          }.to_json
        )
      end

      it "returns the line's text" do
        lines = described_class.extract_lines(path: fixture_path.to_s, content_type: "image/png")
        expect(lines.first.text).to eq("Aqua, Parfum")
      end

      it "returns the line's confidence" do
        lines = described_class.extract_lines(path: fixture_path.to_s, content_type: "image/png")
        expect(lines.first.confidence).to eq(0.9)
      end

      it "returns the line's individual words" do
        lines = described_class.extract_lines(path: fixture_path.to_s, content_type: "image/png")
        expect(lines.first.words.map(&:text)).to eq(["Aqua,", "Parfum"])
      end
    end

    it "raises OcrClient::Error when the service responds with an error status" do
      stub_request(:post, "http://localhost:8001/ocr").to_return(status: 500)

      expect do
        described_class.extract_lines(path: fixture_path.to_s, content_type: "image/png")
      end.to raise_error(OcrClient::Error)
    end

    it "raises OcrClient::Error when the service is unreachable" do
      stub_request(:post, "http://localhost:8001/ocr").to_raise(Faraday::ConnectionFailed)

      expect do
        described_class.extract_lines(path: fixture_path.to_s, content_type: "image/png")
      end.to raise_error(OcrClient::Error)
    end
  end
end
