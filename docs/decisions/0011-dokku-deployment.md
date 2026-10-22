# 11. Deploy to Dokku as three apps, with Postgres and HTTP basic auth on the web app

## Status

Accepted

## Context

The project has been tested locally only, which makes real-world testing (photos taken with a phone, in an actual store) awkward — every test means plugging the phone into the same network as a laptop running three local services. A self-hosted Dokku server and a domain (subdomains available under it) are already available, so the goal is to make the existing three services reachable from a phone, without opening the project up as a public, unauthenticated product — it's a portfolio project, not a public launch.

## Decision

Deploy the three services (`web/`, `api/`, `ocr/`) as three separate Dokku apps, each on its own subdomain:

- `inci-web` → `web.inci.<domain>` — the React SPA
- `inci-api` → `api.inci.<domain>` — the Rails API
- `inci-ocr` → `ocr.inci.<domain>` — the OCR service

App names are prefixed `inci-` (rather than the generic `api`/`web`/`ocr`) since the Dokku server is shared with other projects — a generic name risks colliding with an app another project already registered.

**Three apps, not one.** Each service already has an independent runtime (Node/nginx, Ruby, Python) and its own test/lint/CI job (see `.github/workflows/ci.yml`); deploying them as one combined app would mean building a single image/buildpack that satisfies all three, undoing that separation for no benefit — Dokku (like Heroku) is built around one app per deployable unit.

**Postgres, not SQLite, in production.** SQLite writes to the local filesystem, which doesn't survive a Dokku redeploy (each deploy is a fresh container) without wiring up a persistent volume. Dokku already has a Postgres plugin installed and ready to link, which is less operational surface than managing a volume. `sqlite3` stays the dev/test adapter (fast, zero-setup); `pg` is only in the `:production` Gemfile group. See `config/database.yml` and `api/Procfile`'s `release: bin/rails db:prepare`, which runs migrations on every deploy.

**HTTP basic auth at the proxy level, on `inci-web` only — not `inci-api` or `inci-ocr`.** The original plan (and the first thing tried) was `http-auth` on all three apps, one shared credential, no code change. That broke on first real use: HTTP only has one `Authorization` header per request, and the SPA's own fetch calls send `Authorization: Bearer <token>` to `inci-api` — which nginx's basic-auth layer rejects outright (401) before Rails ever sees the request, since it's expecting `Authorization: Basic ...`. A proxy-level credential and an app-level bearer token can't share that header. `http-auth` was removed from `inci-api`/`inci-ocr` and kept only on `inci-web`, the one real human-facing entry point (neither API has its own UI to browse to directly) — anyone who discovers the API/OCR subdomains directly bypasses the password prompt, but still has to go through the app's own sign-up/login to do anything with `inci-api`, and `inci-ocr` only ever returns raw OCR text for a submitted image, nothing sensitive on its own. Acceptable for a project whose current purpose is "let me and a few others test it," not a public demo.

**All three apps deploy via a Dockerfile, not a buildpack.** `web/Dockerfile` (nginx, SPA fallback to `index.html`) was always going to be a Dockerfile — Vite needs `VITE_API_URL` baked in at *build* time (a compile-time env var, not read at runtime), simplest to control via `--build-arg` on a Dockerfile build (`docker-options:add inci-web build`). `ocr/Dockerfile` already existed (ADR 9). `api/` was originally meant to deploy via Dokku's standard Ruby buildpack (no Dockerfile needed) — in practice, that buildpack (herokuish) ships bundler 1.17.3, which can't parse this Gemfile (`platforms: %i[windows jruby]` isn't valid syntax to a bundler that old) and failed the first real deploy attempt. `api/Dockerfile` (`ruby:3.3.8-slim`, installs gems with the project's own modern bundler) sidesteps the outdated buildpack entirely.

See `docs/deploy.md` for the exact commands.

## Consequences

- Three Dokku apps to maintain instead of one — three sets of config vars, three domains, three places to check logs. Acceptable for three genuinely independent services.
- HTTPS (via Dokku's `letsencrypt` plugin) is required for `inci-api`: `config.force_ssl = true` / `config.assume_ssl = true` in `config/environments/production.rb` assume a TLS-terminating proxy in front. Skipping Let's Encrypt setup would break the API in production, not just be insecure.
- The basic-auth credential on `inci-web` is a known weak point if shared carelessly (e.g. pasted in a public chat) — it's the only thing stopping a casual visitor from reaching the app's UI. Treat it like a password, because it is one.
- `inci-api` and `inci-ocr` are reachable directly by anyone who finds their subdomains — not indexed or linked anywhere, but not secret either. Revisit (e.g. an IP allowlist, or a reverse proxy that strips/forwards a separate auth header Rails itself can check) if this ever needs to be more than "casual visitors won't stumble into it."
- Moving off SQLite to Postgres only in production — not in dev/test — means a prod-specific class of bug (e.g. a query that works on SQLite but not Postgres) won't be caught by CI. Accepted for now given the project's size and simple query patterns; worth revisiting if that ever bites.
