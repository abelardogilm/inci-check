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

          scans = images.filter_map { |image| scan_image(image) }
          return render_error("Could not read any of the submitted images") if scans.empty?

          render json: scan_summary(images, scans)
        end

        private

        def scan_image(image)
          lines = OcrClient.extract_lines(
            path: image.tempfile.path,
            content_type: image.content_type,
            filename: image.original_filename
          )
          text = lines.map(&:text).join(", ")
          { text: text, result: AllergenMatcher.call(text) }
        rescue OcrClient::Error
          nil
        end

        def scan_summary(images, scans)
          {
            allergens: matched_allergens(scans),
            images_processed: scans.size,
            images_failed: images.size - scans.size,
            extracted_text: scans.pluck(:text)
          }
        end

        def matched_allergens(scans)
          my_allergen_ids = current_user.allergens.ids.to_set
          matched = scans.flat_map { |scan| scan[:result].allergens }.uniq

          matched.map { |a| { id: a.id, name: a.name, in_my_list: my_allergen_ids.include?(a.id) } }
        end

        def render_error(message)
          render json: { error: message }, status: :unprocessable_content
        end
      end
    end
  end
end
