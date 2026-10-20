# frozen_string_literal: true

module Api
  module V1
    module Admin
      # Gate for the admin API: a Bearer token issued by SessionsController,
      # signed and time-limited via Rails' built-in message verifier.
      # Credentials are still a single shared pair from env vars, same
      # caveat as ADR 3 — see docs/decisions/0004-admin-session-tokens.md.
      class BaseController < ApplicationController
        ADMIN_USERNAME = ENV.fetch("ADMIN_USERNAME", "admin")
        ADMIN_PASSWORD = ENV.fetch("ADMIN_PASSWORD") do
          raise "ADMIN_PASSWORD must be set in production" if Rails.env.production?

          "admin_password_change_me"
        end

        before_action :authenticate_admin!

        private

        def authenticate_admin!
          return if valid_token?

          render json: { error: "Unauthorized" }, status: :unauthorized
        end

        def valid_token?
          token = bearer_token
          return false unless token

          Rails.application.message_verifier(:admin_session).verify(token)
          true
        rescue ActiveSupport::MessageVerifier::InvalidSignature
          false
        end

        def bearer_token
          header = request.authorization
          return nil unless header&.start_with?("Bearer ")

          header.delete_prefix("Bearer ")
        end
      end
    end
  end
end
