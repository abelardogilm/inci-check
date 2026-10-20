# frozen_string_literal: true

module Api
  module V1
    module Admin
      class AllergensController < BaseController
        def index
          render json: Allergen.all.map { |allergen| serialize(allergen) }
        end

        def show
          allergen = Allergen.find(params.expect(:id))
          render json: serialize(allergen)
        end

        def create
          allergen = Allergen.new(allergen_params)

          if allergen.save
            render json: serialize(allergen), status: :created
          else
            render json: { errors: allergen.errors.full_messages }, status: :unprocessable_content
          end
        end

        def update
          allergen = Allergen.find(params.expect(:id))

          if allergen.update(allergen_params)
            render json: serialize(allergen)
          else
            render json: { errors: allergen.errors.full_messages }, status: :unprocessable_content
          end
        end

        def destroy
          allergen = Allergen.find(params.expect(:id))
          allergen.destroy
          head :no_content
        end

        private

        def allergen_params
          params.permit(:name)
        end

        def serialize(allergen)
          allergen.as_json(only: %i[id name created_at updated_at])
                  .merge(aliases: allergen.allergen_aliases.pluck(:name))
        end
      end
    end
  end
end
