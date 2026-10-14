# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Users", type: :request do
  describe "POST /api/v1/users" do
    it "creates a user with valid params" do
      post "/api/v1/users", params: { email: "new@example.com", password: "password123" }

      expect(response).to have_http_status(:created)
    end

    it "returns the created user's email" do
      post "/api/v1/users", params: { email: "new@example.com", password: "password123" }

      expect(response.parsed_body["email"]).to eq("new@example.com")
    end

    it "never returns the password digest" do
      post "/api/v1/users", params: { email: "new@example.com", password: "password123" }

      expect(response.parsed_body).not_to have_key("password_digest")
    end

    it "rejects invalid params" do
      post "/api/v1/users", params: { email: "not-an-email", password: "password123" }

      expect(response).to have_http_status(:unprocessable_content)
    end
  end

  describe "GET /api/v1/users/:id" do
    it "responds with 200" do
      user = create(:user)

      get "/api/v1/users/#{user.id}"

      expect(response).to have_http_status(:ok)
    end

    it "returns the user's email" do
      user = create(:user)

      get "/api/v1/users/#{user.id}"

      expect(response.parsed_body["email"]).to eq(user.email)
    end

    it "returns 404 for a missing user" do
      get "/api/v1/users/0"

      expect(response).to have_http_status(:not_found)
    end
  end
end
