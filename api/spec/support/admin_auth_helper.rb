# frozen_string_literal: true

module AdminAuthHelper
  def admin_headers
    post "/api/v1/admin/session",
         params: {
           username: Api::V1::Admin::BaseController::ADMIN_USERNAME,
           password: Api::V1::Admin::BaseController::ADMIN_PASSWORD
         }
    { "Authorization" => "Bearer #{response.parsed_body['token']}" }
  end
end

RSpec.configure do |config|
  config.include AdminAuthHelper, type: :request
end
