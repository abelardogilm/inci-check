# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::App::Sessions", type: :request do
  describe "POST /api/v1/app/session" do
    it "issues a token for valid credentials" do
      create(:user, email: "someone@example.com", password: "password123")

      post "/api/v1/app/session", params: { email: "someone@example.com", password: "password123" }

      expect(response).to have_http_status(:created)
    end

    it "returns a usable token" do
      create(:user, email: "someone@example.com", password: "password123")
      post "/api/v1/app/session", params: { email: "someone@example.com", password: "password123" }
      token = response.parsed_body["token"]

      get "/api/v1/app/user", headers: { "Authorization" => "Bearer #{token}" }

      expect(response).to have_http_status(:ok)
    end

    it "updates last_login_at" do
      user = create(:user, email: "someone@example.com", password: "password123")

      post "/api/v1/app/session", params: { email: "someone@example.com", password: "password123" }

      expect(user.reload.last_login_at).to be_present
    end

    it "rejects an invalid password" do
      create(:user, email: "someone@example.com", password: "password123")

      post "/api/v1/app/session", params: { email: "someone@example.com", password: "wrong" }

      expect(response).to have_http_status(:unauthorized)
    end

    it "rejects an unknown email" do
      post "/api/v1/app/session", params: { email: "nobody@example.com", password: "password123" }

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "a tampered or garbage token" do
    it "is rejected by a protected app endpoint" do
      get "/api/v1/app/user", headers: { "Authorization" => "Bearer not-a-real-token" }

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "a token for a deleted user" do
    it "is rejected by a protected app endpoint" do
      user = create(:user)
      headers = user_headers(user)
      user.destroy

      get "/api/v1/app/user", headers: headers

      expect(response).to have_http_status(:unauthorized)
    end
  end

  describe "DELETE /api/v1/app/session" do
    it "responds with 204" do
      delete "/api/v1/app/session", headers: user_headers(create(:user))

      expect(response).to have_http_status(:no_content)
    end
  end
end
