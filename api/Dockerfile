# Dokku's herokuish Ruby buildpack ships bundler 1.17.3, which can't parse a
# modern Gemfile (fails on `platforms: %i[windows jruby]`) — so this app
# deploys via Dockerfile instead, same as web/ and ocr/. See docs/deploy.md.
FROM ruby:3.3.13-slim

RUN apt-get update -qq && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
ENV RAILS_ENV=production

COPY Gemfile Gemfile.lock ./
RUN bundle config set without 'development test' \
    && bundle install --jobs 4 --retry 3

COPY . .

EXPOSE 3000

CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
