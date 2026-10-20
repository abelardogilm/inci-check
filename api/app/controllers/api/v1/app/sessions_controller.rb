# frozen_string_literal: true

module Api
  module V1
    module App
      class SessionsController < ApplicationController
        def create
          user = User.find_by(email: params[:email])

          if user&.authenticate(params[:password])
            user.update!(last_login_at: Time.current)
            render json: { token: issue_token(user) }, status: :created
          else
            render json: { error: "Invalid email or password" }, status: :unauthorized
          end
        end

        def destroy
          # Tokens are stateless and self-expiring (see ADR 6) — nothing to revoke server-side.
          head :no_content
        end

        private

        def issue_token(user)
          Authenticatable.token_verifier.generate({ user_id: user.id }, expires_in: Authenticatable::TOKEN_EXPIRY)
        end
      end
    end
  end
end
