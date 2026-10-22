# 11. Deploy to Dokku as three apps, with Postgres and shared HTTP basic auth

## Status

Accepted

## Context

The project has been tested locally only, which makes real-world testing (photos taken with a phone, in an actual store) awkward — every test means plugging the phone into the same network as a laptop running three local services. A self-hosted Dokku server and a domain (subdomains available under it) are already available, so the goal is to make the existing three services reachable from a phone, without opening the project up as a public, unauthenticated product — it's a portfolio project, not a public launch.

## Decision

Deploy the three services (`web/`, `api/`, `ocr/`) as three separate Dokku apps, each on its own subdomain:

- `web.inci.<domain>` — the React SPA
- `api.inci.<domain>` — the Rails API
- `ocr.inci.<domain>` — the OCR service

**Three apps, not one.** Each service already has an independent runtime (Node/nginx, Ruby, Python) and its own test/lint/CI job (see `.github/workflows/ci.yml`); deploying them as one combined app would mean building a single image/buildpack that satisfies all three, undoing that separation for no benefit — Dokku (like Heroku) is built around one app per deployable unit.

**Postgres, not SQLite, in production.** SQLite writes to the local filesystem, which doesn't survive a Dokku redeploy (each deploy is a fresh container) without wiring up a persistent volume. Dokku already has a Postgres plugin installed and ready to link, which is less operational surface than managing a volume. `sqlite3` stays the dev/test adapter (fast, zero-setup); `pg` is only in the `:production` Gemfile group. See `config/database.yml` and `api/Procfile`'s `release: bin/rails db:prepare`, which runs migrations on every deploy.

**Shared HTTP basic auth at the proxy level, not an app-level access flag.** The alternative considered was disabling the `POST /api/v1/app/users` sign-up endpoint in production. Basic auth (via the `dokku-http-auth` plugin) was chosen instead because it's one shared credential that protects all three apps uniformly — including sign-up, login, and the OCR endpoint directly — with no code change and no risk of forgetting to gate a future endpoint. The trade-off: it's coarse (one shared password, not a real user-facing auth layer) and adds a login prompt before the app's own login screen — acceptable for a project whose current purpose is "let me and a few others test it," not a public demo.

**The web app deploys via a Dockerfile** (`web/Dockerfile`, nginx-based with a SPA fallback to `index.html`), not a buildpack — Vite needs `VITE_API_URL` baked in at *build* time (it's a compile-time env var, not read at runtime), which is simplest to control explicitly via `--build-arg` on a Dockerfile build (set through Dokku's `docker-options:add web build`). The API deploys via Dokku's standard Ruby buildpack detection (no Dockerfile needed). The OCR service already had a Dockerfile (ADR 9) and deploys the same way.

See `docs/deploy.md` for the exact commands.

## Consequences

- Three Dokku apps to maintain instead of one — three sets of config vars, three domains, three places to check logs. Acceptable for three genuinely independent services.
- HTTPS (via Dokku's `letsencrypt` plugin) is required for `api`: `config.force_ssl = true` / `config.assume_ssl = true` in `config/environments/production.rb` assume a TLS-terminating proxy in front. Skipping Let's Encrypt setup would break the API in production, not just be insecure.
- The shared basic-auth credential is a known weak point if shared carelessly (e.g. pasted in a public chat) — it gates the whole project, not a single feature. Treat it like a password, because it is one.
- Moving off SQLite to Postgres only in production — not in dev/test — means a prod-specific class of bug (e.g. a query that works on SQLite but not Postgres) won't be caught by CI. Accepted for now given the project's size and simple query patterns; worth revisiting if that ever bites.
