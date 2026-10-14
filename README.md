# inci-check

Reading cosmetic ingredient labels is hard: tiny print, Latin names, and many synonyms for the same substance. inci-check lets you take a photo of an ingredient list and checks it against your personal list of allergens.

## How it works

- Optical character recognition extracts the ingredients from the photo.
- Each ingredient is matched against a database of INCI names and known synonyms.
- Allergens are configurable, so it works for any allergy, not only one person's.

Design decisions and their rationale are tracked in [`docs/decisions/`](docs/decisions/).

## Why I built it

A family member has allergies to cosmetic ingredients that are very hard to spot on labels. This started as a personal tool.

## Stack

- **`api/`** — Ruby on Rails (API-only), RSpec, RuboCop
- **`web/`** — React + TypeScript (Vite), Vitest, oxlint

## Getting started

### API

```sh
cd api
bundle install
bin/rails db:prepare
bin/rails server
```

Runs at `http://localhost:3000`. Run tests with `bundle exec rspec` and lint with `bundle exec rubocop`.

The admin API (`/api/v1/admin/*`) requires HTTP Basic Auth. Set `ADMIN_USERNAME`/`ADMIN_PASSWORD` env vars before deploying — see [ADR 3](docs/decisions/0003-admin-app-api-split.md).

### Web

```sh
cd web
npm install
npm run dev
```

Runs at `http://localhost:5173`. Run tests with `npm test` and lint with `npm run lint`.

## Contributing

Every change goes on its own branch and PR (see `.github/PULL_REQUEST_TEMPLATE.md`). Tests and linters must pass before a PR is opened — CI runs both on every PR.
