# frozen_string_literal: true

module Api
  module V1
    module Admin
      # Interim gate for the admin API: HTTP Basic Auth via env-configured
      # credentials. This is a stopgap until role-based auth lands alongside
      # user sessions — see docs/decisions/0003-admin-app-api-split.md.
      class BaseController < ApplicationController
        include ActionController::HttpAuthentication::Basic::ControllerMethods

        ADMIN_USERNAME = ENV.fetch("ADMIN_USERNAME", "admin")
        ADMIN_PASSWORD = ENV.fetch("ADMIN_PASSWORD") do
          raise "ADMIN_PASSWORD must be set in production" if Rails.env.production?

          "admin_password_change_me"
        end

        before_action :authenticate_admin!

        private

        def authenticate_admin!
          authenticate_or_request_with_http_basic do |username, password|
            ActiveSupport::SecurityUtils.secure_compare(username, ADMIN_USERNAME) &&
              ActiveSupport::SecurityUtils.secure_compare(password, ADMIN_PASSWORD)
          end
        end
      end
    end
  end
end
