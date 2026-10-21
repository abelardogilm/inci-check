# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::App::UserAllergens", type: :request do
  let(:user) { create(:user) }

  describe "GET /api/v1/app/user_allergens" do
    it "rejects requests without a token" do
      get "/api/v1/app/user_allergens"

      expect(response).to have_http_status(:unauthorized)
    end

    it "returns only the current user's allergens" do
      mine = create(:allergen, name: "Limonene")
      create(:user_allergen, user: user, allergen: mine)
      create(:user_allergen, allergen: create(:allergen, name: "Linalool"))
      get "/api/v1/app/user_allergens", headers: user_headers(user)

      expect(response.parsed_body.pluck("name")).to eq([mine.name])
    end
  end

  describe "POST /api/v1/app/user_allergens" do
    it "adds an allergen to the user's list" do
      allergen = create(:allergen)

      post "/api/v1/app/user_allergens", params: { allergen_id: allergen.id }, headers: user_headers(user)

      expect(response).to have_http_status(:created)
    end

    it "persists the addition" do
      allergen = create(:allergen)

      post "/api/v1/app/user_allergens", params: { allergen_id: allergen.id }, headers: user_headers(user)

      expect(user.allergens.reload).to include(allergen)
    end

    it "rejects adding the same allergen twice" do
      allergen = create(:allergen)
      create(:user_allergen, user: user, allergen: allergen)

      post "/api/v1/app/user_allergens", params: { allergen_id: allergen.id }, headers: user_headers(user)

      expect(response).to have_http_status(:unprocessable_content)
    end

    it "returns 404 for an unknown allergen" do
      post "/api/v1/app/user_allergens", params: { allergen_id: 0 }, headers: user_headers(user)

      expect(response).to have_http_status(:not_found)
    end
  end

  describe "DELETE /api/v1/app/user_allergens/:id" do
    it "removes the allergen from the user's list" do
      allergen = create(:allergen)
      create(:user_allergen, user: user, allergen: allergen)

      delete "/api/v1/app/user_allergens/#{allergen.id}", headers: user_headers(user)

      expect(user.allergens.reload).to be_empty
    end

    it "does not let a user remove another user's allergen" do
      allergen = create(:allergen)
      create(:user_allergen, user: create(:user), allergen: allergen)

      delete "/api/v1/app/user_allergens/#{allergen.id}", headers: user_headers(user)

      expect(response).to have_http_status(:not_found)
    end
  end
end
