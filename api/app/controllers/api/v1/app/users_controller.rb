# frozen_string_literal: true

module Api
  module V1
    module App
      class UsersController < ApplicationController
        include Authenticatable

        skip_before_action :authenticate_user!, only: [:create]

        # "My profile" — authenticated, always the current user (see ADR 6).
        def show
          render json: serialize(current_user)
        end

        # Sign-up, deliberately public: creating your own account doesn't
        # require being authenticated.
        def create
          user = User.new(user_params)

          if user.save
            render json: serialize(user), status: :created
          else
            render json: { errors: user.errors.full_messages }, status: :unprocessable_content
          end
        end

        private

        def user_params
          params.permit(:email, :password)
        end

        def serialize(user)
          user.as_json(only: %i[id email last_login_at created_at])
        end
      end
    end
  end
end
