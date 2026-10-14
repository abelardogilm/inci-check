# frozen_string_literal: true

module Api
  module V1
    module App
      # Sign-up only, deliberately public: creating your own account doesn't
      # require being authenticated. Viewing/updating "yourself" needs a
      # current_user, which arrives with the session/login work.
      class UsersController < ApplicationController
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
          user.as_json(only: %i[id email created_at])
        end
      end
    end
  end
end
