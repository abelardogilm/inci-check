# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Admin::Sessions", type: :request do
  def login(password: Api::V1::Admin::BaseController::ADMIN_PASSWORD)
    post "/api/v1/admin/session",
         params: { username: Api::V1::Admin::BaseController::ADMIN_USERNAME, password: password }
  end

  describe "POST /api/v1/admin/session" do
    it "issues a token for valid credentials" do
      login

      expect(response).to have_http_status(:created)
    end

    it "returns a usable token" do
      login
      token = response.parsed_body["token"]

      get "/api/v1/admin/allergens", headers: { "Authorization" => "Bearer #{token}" }

      expect(response).to have_http_status(:ok)
    end

    it "rejects an invalid password" do
      login(password: "wrong")

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "a tampered or garbage token" do
    it "is rejected by a protected admin endpoint" do
      get "/api/v1/admin/allergens", headers: { "Authorization" => "Bearer not-a-real-token" }

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "DELETE /api/v1/admin/session" do
    it "responds with 204" do
      delete "/api/v1/admin/session", headers: admin_headers

      expect(response).to have_http_status(:no_content)
    end
  end
end
