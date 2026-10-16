# frozen_string_literal: true

module AdminAuthHelper
  def admin_headers
    credentials = ActionController::HttpAuthentication::Basic.encode_credentials(
      Api::V1::Admin::BaseController::ADMIN_USERNAME,
      Api::V1::Admin::BaseController::ADMIN_PASSWORD
    )
    { "Authorization" => credentials }
  end
end

RSpec.configure do |config|
  config.include AdminAuthHelper, type: :request
end
