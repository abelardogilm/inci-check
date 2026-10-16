# frozen_string_literal: true

module Api
  module V1
    module Admin
      class AllergenAliasesController < BaseController
        def create
          allergen = Allergen.find(params.expect(:allergen_id))
          alias_record = allergen.allergen_aliases.new(alias_params)

          if alias_record.save
            render json: serialize(alias_record), status: :created
          else
            render json: { errors: alias_record.errors.full_messages }, status: :unprocessable_content
          end
        end

        def destroy
          allergen = Allergen.find(params.expect(:allergen_id))
          alias_record = allergen.allergen_aliases.find(params.expect(:id))
          alias_record.destroy
          head :no_content
        end

        private

        def alias_params
          params.permit(:name)
        end

        def serialize(alias_record)
          alias_record.as_json(only: %i[id name allergen_id created_at updated_at])
        end
      end
    end
  end
end
