# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Admin::Users", type: :request do
  let(:admin_headers) do
    credentials = ActionController::HttpAuthentication::Basic.encode_credentials(
      Api::V1::Admin::BaseController::ADMIN_USERNAME,
      Api::V1::Admin::BaseController::ADMIN_PASSWORD
    )
    { "Authorization" => credentials }
  end

  describe "POST /api/v1/admin/users" do
    it "rejects requests without admin credentials" do
      post "/api/v1/admin/users", params: { email: "new@example.com", password: "password123" }

      expect(response).to have_http_status(:unauthorized)
    end

    it "creates a user with valid params and admin credentials" do
      post "/api/v1/admin/users",
           params: { email: "new@example.com", password: "password123" },
           headers: admin_headers

      expect(response).to have_http_status(:created)
    end

    it "never returns the password digest" do
      post "/api/v1/admin/users",
           params: { email: "new@example.com", password: "password123" },
           headers: admin_headers

      expect(response.parsed_body).not_to have_key("password_digest")
    end

    it "rejects invalid params" do
      post "/api/v1/admin/users",
           params: { email: "not-an-email", password: "password123" },
           headers: admin_headers

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "GET /api/v1/admin/users/:id" do
    it "rejects requests without admin credentials" do
      user = create(:user)

      get "/api/v1/admin/users/#{user.id}"

      expect(response).to have_http_status(:unauthorized)
    end

    it "responds with 200 given admin credentials" do
      user = create(:user)

      get "/api/v1/admin/users/#{user.id}", headers: admin_headers

      expect(response).to have_http_status(:ok)
    end

    it "returns the user's email given admin credentials" do
      user = create(:user)

      get "/api/v1/admin/users/#{user.id}", headers: admin_headers

      expect(response.parsed_body["email"]).to eq(user.email)
    end

    it "returns 404 for a missing user" do
      get "/api/v1/admin/users/0", headers: admin_headers

      expect(response).to have_http_status(:not_found)
    end
  end
end
