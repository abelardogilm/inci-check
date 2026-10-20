# frozen_string_literal: true

module UserAuthHelper
  def user_headers(user)
    token = Api::V1::App::Authenticatable.token_verifier.generate(
      { user_id: user.id },
      expires_in: Api::V1::App::Authenticatable::TOKEN_EXPIRY
    )
    { "Authorization" => "Bearer #{token}" }
  end
end

RSpec.configure do |config|
  config.include UserAuthHelper, type: :request
end
