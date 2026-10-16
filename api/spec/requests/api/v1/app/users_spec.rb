# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::App::Users", type: :request do
  describe "POST /api/v1/app/users" do
    it "creates a user with valid params, with no credentials required" do
      post "/api/v1/app/users", params: { email: "new@example.com", password: "password123" }

      expect(response).to have_http_status(:created)
    end

    it "returns the created user's email" do
      post "/api/v1/app/users", params: { email: "new@example.com", password: "password123" }

      expect(response.parsed_body["email"]).to eq("new@example.com")
    end

    it "never returns the password digest" do
      post "/api/v1/app/users", params: { email: "new@example.com", password: "password123" }

      expect(response.parsed_body).not_to have_key("password_digest")
    end

    it "rejects invalid params" do
      post "/api/v1/app/users", params: { email: "not-an-email", password: "password123" }

      expect(response).to have_http_status(:unprocessable_content)
    end
  end
end
