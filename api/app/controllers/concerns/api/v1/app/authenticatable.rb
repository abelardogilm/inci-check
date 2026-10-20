# frozen_string_literal: true

module Api
  module V1
    module App
      # Shared current_user resolution for the app API, from a Bearer token
      # issued by SessionsController. See docs/decisions/0006-app-session-tokens.md.
      module Authenticatable
        extend ActiveSupport::Concern

        TOKEN_EXPIRY = 2.weeks

        included do
          before_action :authenticate_user!
        end

        def self.token_verifier
          Rails.application.message_verifier(:app_session)
        end

        private

        def current_user
          @current_user
        end

        def authenticate_user!
          @current_user = resolve_current_user
          return if @current_user

          render json: { error: "Unauthorized" }, status: :unauthorized
        end

        def resolve_current_user
          token = bearer_token
          return nil unless token

          payload = Authenticatable.token_verifier.verify(token)
          User.find_by(id: payload["user_id"])
        rescue ActiveSupport::MessageVerifier::InvalidSignature
          nil
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
