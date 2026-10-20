# frozen_string_literal: true

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # Outside production, Vite may pick a different port than 5173 if it's
    # already taken, so allow any localhost port rather than hardcoding one.
    # WEB_ORIGIN still pins it down in production.
    origins(Rails.env.production? ? ENV.fetch("WEB_ORIGIN") : %r{\Ahttp://localhost:\d+\z})

    resource "*",
             headers: :any,
             methods: %i[get post put patch delete options head]
  end
end
