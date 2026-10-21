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
- **`ocr/`** — self-hosted OCR (Tesseract via FastAPI), runs in Docker — see [`ocr/README.md`](ocr/README.md) and [ADR 9](docs/decisions/0009-ocr-engine.md)

## Getting started

### API

```sh
cd api
cp .env.example .env
bundle install
bin/rails db:prepare
bin/rails db:seed # loads the EU's 26 fragrance allergens, see ADR 5
bin/rails server
```

Runs at `http://localhost:3000`. Run tests with `bundle exec rspec` and lint with `bundle exec rubocop`. Env vars are loaded from `.env` (via `dotenv-rails`) in development/test.

The admin API (`/api/v1/admin/*`) requires a session token (`POST /api/v1/admin/session` to log in). Set `ADMIN_USERNAME`/`ADMIN_PASSWORD` in `.env` (see `.env.example`) before deploying — see [ADR 4](docs/decisions/0004-admin-session-tokens.md).

An admin UI lives at `/admin` in the web app (`/admin/login`, then `/admin/allergens`).

`POST /api/v1/app/scans` checks a label photo (1+ images) against the allergen catalog — see [ADR 10](docs/decisions/0010-scan-endpoint.md). It needs the OCR service running; set `OCR_SERVICE_URL` in `.env` if it's not at the default `http://localhost:8001`.

### Web

```sh
cd web
npm install
npm run dev
```

Runs at `http://localhost:5173`. Run tests with `npm test` and lint with `npm run lint`.

### OCR service

```sh
docker compose up ocr
```

Runs at `http://localhost:8001`. See [`ocr/README.md`](ocr/README.md) for the API and how to test it manually.

## Contributing

Every change goes on its own branch and PR (see `.github/PULL_REQUEST_TEMPLATE.md`). Tests and linters must pass before a PR is opened — CI runs both on every PR.
