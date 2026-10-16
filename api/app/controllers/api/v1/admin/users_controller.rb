# frozen_string_literal: true

module Api
  module V1
    module Admin
      class UsersController < BaseController
        def show
          user = User.find(params.expect(:id))
          render json: serialize(user)
        end

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
          user.as_json(only: %i[id email last_login_at created_at updated_at])
        end
      end
    end
  end
end
