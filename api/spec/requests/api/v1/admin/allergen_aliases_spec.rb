# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Admin::AllergenAliases", type: :request do
  describe "POST /api/v1/admin/allergens/:allergen_id/aliases" do
    it "rejects requests without admin credentials" do
      allergen = create(:allergen)

      post "/api/v1/admin/allergens/#{allergen.id}/aliases", params: { name: "Parfum" }

      expect(response).to have_http_status(:unauthorized)
    end

    it "adds an alias to the allergen" do
      allergen = create(:allergen)

      expect do
        post "/api/v1/admin/allergens/#{allergen.id}/aliases", params: { name: "Parfum" }, headers: admin_headers
      end.to change(allergen.allergen_aliases, :count).by(1)
    end

    it "rejects a duplicate alias name" do
      create(:allergen_alias, name: "parfum")
      allergen = create(:allergen)

      post "/api/v1/admin/allergens/#{allergen.id}/aliases", params: { name: "Parfum" }, headers: admin_headers

      expect(response).to have_http_status(:unprocessable_content)
    end

    it "returns 404 for a missing allergen" do
      post "/api/v1/admin/allergens/0/aliases", params: { name: "Parfum" }, headers: admin_headers

      expect(response).to have_http_status(:not_found)
    end
  end

  describe "DELETE /api/v1/admin/allergens/:allergen_id/aliases/:id" do
    it "removes the alias" do
      allergen = create(:allergen)
      alias_record = create(:allergen_alias, allergen: allergen)

      expect do
        delete "/api/v1/admin/allergens/#{allergen.id}/aliases/#{alias_record.id}", headers: admin_headers
      end.to change(AllergenAlias, :count).by(-1)
    end

    it "returns 404 when the alias doesn't belong to the allergen" do
      allergen = create(:allergen)
      other_allergen_alias = create(:allergen_alias)

      delete "/api/v1/admin/allergens/#{allergen.id}/aliases/#{other_allergen_alias.id}", headers: admin_headers

      expect(response).to have_http_status(:not_found)
    end
  end
end
