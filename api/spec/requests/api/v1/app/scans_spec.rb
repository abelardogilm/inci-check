# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::App::Scans", type: :request do
  let(:user) { create(:user) }
  let(:image) { fixture_file_upload("label.png", "image/png") }

  def ocr_line(text)
    OcrClient::Line.new(text: text, confidence: 0.9, words: [])
  end

  describe "POST /api/v1/app/scans" do
    it "rejects requests without a token" do
      post "/api/v1/app/scans", params: { images: [image] }

      expect(response).to have_http_status(:unauthorized)
    end

    it "rejects requests with no images" do
      post "/api/v1/app/scans", params: {}, headers: user_headers(user)

      expect(response).to have_http_status(:unprocessable_content)
    end

    it "returns allergens matched in a single image" do
      allergen = create(:allergen, name: "Limonene")
      allow(OcrClient).to receive(:extract_lines).and_return([ocr_line("Aqua, Limonene")])

      post "/api/v1/app/scans", params: { images: [image] }, headers: user_headers(user)

      expect(response.parsed_body["allergens"].pluck("name")).to eq([allergen.name])
    end

    it "matches a multi-word allergen name wrapped across two OCR lines with no comma" do
      create(:allergen, name: "Amyl Cinnamal")
      lines = [ocr_line("Aqua, Amyl"), ocr_line("Cinnamal, Limonene")]
      allow(OcrClient).to receive(:extract_lines).and_return(lines)
      post "/api/v1/app/scans", params: { images: [image] }, headers: user_headers(user)
      expect(response.parsed_body["allergens"].pluck("name")).to include("Amyl Cinnamal")
    end

    it "matches a hyphenated allergen name even when OCR drops the hyphen at a line wrap" do
      create(:allergen, name: "Alpha-Isomethyl Ionone")
      lines = [ocr_line("Aqua, Alpha-"), ocr_line("Isomethyl Ionone, Limonene")]
      allow(OcrClient).to receive(:extract_lines).and_return(lines)
      post "/api/v1/app/scans", params: { images: [image] }, headers: user_headers(user)
      expect(response.parsed_body["allergens"].pluck("name")).to include("Alpha-Isomethyl Ionone")
    end

    it "flags an allergen that is on the user's personal list" do
      allergen = create(:allergen, name: "Limonene")
      create(:user_allergen, user: user, allergen: allergen)
      allow(OcrClient).to receive(:extract_lines).and_return([ocr_line("Aqua, Limonene")])

      post "/api/v1/app/scans", params: { images: [image] }, headers: user_headers(user)

      expect(response.parsed_body["allergens"].first["in_my_list"]).to be(true)
    end

    it "returns the text extracted from each processed image" do
      create(:allergen, name: "Limonene")
      allow(OcrClient).to receive(:extract_lines).and_return([ocr_line("Aqua, Limonene")])

      post "/api/v1/app/scans", params: { images: [image] }, headers: user_headers(user)

      expect(response.parsed_body["extracted_text"]).to eq(["Aqua, Limonene"])
    end

    it "does not flag an allergen that is not on the user's personal list" do
      create(:allergen, name: "Limonene")
      allow(OcrClient).to receive(:extract_lines).and_return([ocr_line("Aqua, Limonene")])

      post "/api/v1/app/scans", params: { images: [image] }, headers: user_headers(user)

      expect(response.parsed_body["allergens"].first["in_my_list"]).to be(false)
    end

    describe "a match found in only one of several images" do
      let!(:limonene) { create(:allergen, name: "Limonene") }
      let!(:fragrance) { create(:allergen, name: "Fragrance") }

      before do
        create(:allergen_alias, allergen: fragrance, name: "parfum")
        allow(OcrClient).to receive(:extract_lines).and_return(
          [ocr_line("Aqua, Limonene")], [ocr_line("Aqua, Parfum")]
        )

        post "/api/v1/app/scans", params: { images: [image, image] }, headers: user_headers(user)
      end

      it "is still returned, union-style" do
        expect(response.parsed_body["allergens"].pluck("name")).to include(limonene.name)
      end

      it "returns matches from every image, not just the first" do
        expect(response.parsed_body["allergens"].pluck("name")).to include(fragrance.name)
      end
    end

    it "does not duplicate an allergen matched in more than one image" do
      create(:allergen, name: "Limonene")
      same_allergen_twice = [[ocr_line("Aqua, Limonene")], [ocr_line("Glycerin, Limonene")]]
      allow(OcrClient).to receive(:extract_lines).and_return(*same_allergen_twice)
      post "/api/v1/app/scans", params: { images: [image, image] }, headers: user_headers(user)

      expect(response.parsed_body["allergens"].size).to eq(1)
    end

    describe "when the OCR service fails on one of several images" do
      before do
        create(:allergen, name: "Limonene")
        call_count = 0
        allow(OcrClient).to receive(:extract_lines) do
          call_count += 1
          call_count == 1 ? [ocr_line("Aqua, Limonene")] : raise(OcrClient::Error)
        end

        post "/api/v1/app/scans", params: { images: [image, image] }, headers: user_headers(user)
      end

      it "still processes the image that succeeded" do
        expect(response.parsed_body["images_processed"]).to eq(1)
      end

      it "reports the failed image" do
        expect(response.parsed_body["images_failed"]).to eq(1)
      end
    end

    it "fails with 422 when every image fails" do
      allow(OcrClient).to receive(:extract_lines).and_raise(OcrClient::Error)

      post "/api/v1/app/scans", params: { images: [image] }, headers: user_headers(user)

      expect(response).to have_http_status(:unprocessable_content)
    end
  end
end
