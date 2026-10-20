# frozen_string_literal: true

module Api
  module V1
    module Admin
      class SessionsController < ApplicationController
        TOKEN_EXPIRY = 24.hours

        def create
          if valid_credentials?(params[:username], params[:password])
            render json: { token: issue_token }, status: :created
          else
            render json: { error: "Invalid username or password" }, status: :unauthorized
          end
        end

        def destroy
          # Tokens are stateless and self-expiring (see ADR 4) — nothing to revoke server-side.
          head :no_content
        end

        private

        def valid_credentials?(username, password)
          ActiveSupport::SecurityUtils.secure_compare(username.to_s, BaseController::ADMIN_USERNAME) &&
            ActiveSupport::SecurityUtils.secure_compare(password.to_s, BaseController::ADMIN_PASSWORD)
        end

        def issue_token
          Rails.application.message_verifier(:admin_session).generate({ admin: true }, expires_in: TOKEN_EXPIRY)
        end
      end
    end
  end
end
