# frozen_string_literal: true

module Api
  module V1
    module App
      # Read-only catalog browsing, so the app can let a user pick their
      # allergens from it. Managing it is an admin concern (Admin::AllergensController).
      class AllergensController < ApplicationController
        include Authenticatable

        def index
          render json: Allergen.all.map { |allergen| serialize(allergen) }
        end

        private

        def serialize(allergen)
          allergen.as_json(only: %i[id name])
        end
      end
    end
  end
end
