# frozen_string_literal: true

module Api
  module V1
    module App
      # Accepts one or more label photos, matches each against the allergen
      # catalog, and returns the union of what was found. See ADR 10 for why
      # multiple images instead of one.
      class ScansController < ApplicationController
        include Authenticatable

        def create
          images = Array(params[:images])
          return render_error("At least one image is required") if images.empty?

          results = images.filter_map { |image| scan_image(image) }
          return render_error("Could not read any of the submitted images") if results.empty?

          render json: scan_summary(images, results)
        end

        private

        def scan_image(image)
          lines = OcrClient.extract_lines(
            path: image.tempfile.path,
            content_type: image.content_type,
            filename: image.original_filename
          )
          AllergenMatcher.call(lines.map(&:text).join(", "))
        rescue OcrClient::Error
          nil
        end

        def scan_summary(images, results)
          {
            allergens: results.flat_map(&:allergens).uniq.map { |a| { id: a.id, name: a.name } },
            images_processed: results.size,
            images_failed: images.size - results.size
          }
        end

        def render_error(message)
          render json: { error: message }, status: :unprocessable_content
        end
      end
    end
  end
end
