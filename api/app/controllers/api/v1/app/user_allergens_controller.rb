# frozen_string_literal: true

module Api
  module V1
    module App
      # The current user's personal allergen list — what ScansController
      # checks a label against (see its "in_my_list" flag).
      class UserAllergensController < ApplicationController
        include Authenticatable

        def index
          render json: current_user.allergens.map { |allergen| serialize(allergen) }
        end

        def create
          allergen = Allergen.find(params.expect(:allergen_id))
          user_allergen = current_user.user_allergens.new(allergen: allergen)

          if user_allergen.save
            render json: serialize(allergen), status: :created
          else
            render json: { errors: user_allergen.errors.full_messages }, status: :unprocessable_content
          end
        end

        # :id here is the allergen's id, not the join record's — the client
        # only ever knows allergens, not the UserAllergen join itself.
        def destroy
          user_allergen = current_user.user_allergens.find_by!(allergen_id: params.expect(:id))
          user_allergen.destroy
          head :no_content
        end

        private

        def serialize(allergen)
          allergen.as_json(only: %i[id name])
        end
      end
    end
  end
end
