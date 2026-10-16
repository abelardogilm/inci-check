# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Admin::Allergens", type: :request do
  describe "GET /api/v1/admin/allergens" do
    it "rejects requests without admin credentials" do
      get "/api/v1/admin/allergens"

      expect(response).to have_http_status(:unauthorized)
    end

    it "returns all allergens with admin credentials" do
      create_list(:allergen, 2)

      get "/api/v1/admin/allergens", headers: admin_headers

      expect(response.parsed_body.size).to eq(2)
    end
  end

  describe "GET /api/v1/admin/allergens/:id" do
    it "returns the allergen with its alias names" do
      allergen = create(:allergen)
      create(:allergen_alias, allergen: allergen, name: "parfum")

      get "/api/v1/admin/allergens/#{allergen.id}", headers: admin_headers

      expect(response.parsed_body["aliases"]).to eq(["parfum"])
    end

    it "returns 404 for a missing allergen" do
      get "/api/v1/admin/allergens/0", headers: admin_headers

      expect(response).to have_http_status(:not_found)
    end
  end

  describe "POST /api/v1/admin/allergens" do
    it "rejects requests without admin credentials" do
      post "/api/v1/admin/allergens", params: { name: "Fragrance" }

      expect(response).to have_http_status(:unauthorized)
    end

    it "creates an allergen with a valid name" do
      post "/api/v1/admin/allergens", params: { name: "Fragrance" }, headers: admin_headers

      expect(response).to have_http_status(:created)
    end

    it "rejects a blank name" do
      post "/api/v1/admin/allergens", params: { name: "" }, headers: admin_headers

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "PATCH /api/v1/admin/allergens/:id" do
    it "updates the allergen's name" do
      allergen = create(:allergen, name: "Old name")

      patch "/api/v1/admin/allergens/#{allergen.id}", params: { name: "New name" }, headers: admin_headers

      expect(allergen.reload.name).to eq("New name")
    end
  end

  describe "DELETE /api/v1/admin/allergens/:id" do
    it "deletes the allergen" do
      allergen = create(:allergen)

      expect do
        delete "/api/v1/admin/allergens/#{allergen.id}", headers: admin_headers
      end.to change(Allergen, :count).by(-1)
    end
  end
end
