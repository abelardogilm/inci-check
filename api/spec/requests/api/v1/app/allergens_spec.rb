# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::App::Allergens", type: :request do
  describe "GET /api/v1/app/allergens" do
    it "rejects requests without a token" do
      get "/api/v1/app/allergens"

      expect(response).to have_http_status(:unauthorized)
    end

    it "returns the allergen catalog" do
      allergen = create(:allergen)

      get "/api/v1/app/allergens", headers: user_headers(create(:user))

      expect(response.parsed_body.pluck("name")).to eq([allergen.name])
    end
  end
end
