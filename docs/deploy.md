# Deploying to Dokku

Three separate Dokku apps, one per service — see [ADR 11](decisions/0011-dokku-deployment.md) for why. Examples below use `inci.enesenciadesarrollo.es` as the base domain; swap in the real one once it's final. App names are prefixed `inci-` (`inci-api`, `inci-web`, `inci-ocr`) to avoid colliding with other projects already on the same shared Dokku server.

Run everything below on the Dokku server itself (SSH in first), except the `git remote add` / `git subtree push` steps, which run from a local checkout of this repo.

## 0. One-time server setup

```sh
# Postgres is already installed; http-auth and letsencrypt are not, typically:
sudo dokku plugin:install https://github.com/dokku/dokku-http-auth.git
sudo dokku plugin:install https://github.com/dokku/dokku-letsencrypt.git

dokku apps:create inci-api
dokku apps:create inci-web
dokku apps:create inci-ocr
```

DNS: point `api.inci.enesenciadesarrollo.es`, `web.inci.enesenciadesarrollo.es` and `ocr.inci.enesenciadesarrollo.es` at the server's IP before continuing (domains:add below won't make the app reachable until DNS resolves).

## 1. Domains + HTTPS

`config/environments/production.rb` sets `force_ssl`/`assume_ssl`, so `inci-api` **requires** a TLS-terminating proxy in front of it — without it, the API will break (redirect loop), not just be insecure.

Add each app's domain and enable its certificate right away, one app at a time, rather than batching all the `domains:add` calls first and `letsencrypt:enable` calls after — doing it per app avoided an error in practice:

```sh
dokku letsencrypt:set --global email you@example.com

dokku domains:add inci-api api.inci.enesenciadesarrollo.es
dokku letsencrypt:enable inci-api

dokku domains:add inci-web web.inci.enesenciadesarrollo.es
dokku letsencrypt:enable inci-web

dokku domains:add inci-ocr ocr.inci.enesenciadesarrollo.es
dokku letsencrypt:enable inci-ocr
```

## 2. Postgres (inci-api only)

```sh
dokku postgres:create inci-check-db
dokku postgres:link inci-check-db inci-api
```

This sets `DATABASE_URL` on `inci-api` automatically — that's what `config/database.yml`'s production block reads.

## 3. Config vars

```sh
# From config/master.key on your machine — needed to decrypt config/credentials.yml.enc.
dokku config:set inci-api RAILS_MASTER_KEY=<contents of api/config/master.key> --no-restart

# CORS (api/config/initializers/cors.rb) and the OCR client (ADR 9/10).
dokku config:set inci-api WEB_ORIGIN=https://web.inci.enesenciadesarrollo.es --no-restart
dokku config:set inci-api OCR_SERVICE_URL=https://ocr.inci.enesenciadesarrollo.es --no-restart

# Admin UI login (ADR 4) — pick a real password, not this one.
dokku config:set inci-api ADMIN_USERNAME=admin ADMIN_PASSWORD=change_me --no-restart
```

`inci-web` needs `VITE_API_URL` baked in at *build* time, not as a runtime config var (Vite env vars are compile-time) — set it as a Docker build arg instead:

```sh
dokku docker-options:add inci-web build "--build-arg VITE_API_URL=https://api.inci.enesenciadesarrollo.es"
```

## 4. Deploy

This is a monorepo, but each Dokku app expects its own code at the repo root — push each subdirectory as its own subtree. From a local checkout:

```sh
dokku_host=dokku@<your-server-host>

git remote add dokku-api $dokku_host:inci-api
git remote add dokku-web $dokku_host:inci-web
git remote add dokku-ocr $dokku_host:inci-ocr

git subtree push --prefix=api dokku-api main
git subtree push --prefix=web dokku-web main
git subtree push --prefix=ocr dokku-ocr main
```

All three apps have a `Dockerfile` (see ADR 11 for why `api` moved off Dokku's Ruby buildpack), so Dokku builds each directly. `api/Procfile`'s `release: bin/rails db:prepare` is meant to run migrations on every deploy — if it doesn't fire automatically for a Dockerfile-based app on your Dokku version, run it manually after each deploy that includes a migration: `dokku run inci-api bin/rails db:prepare`.

Repeat the three `git subtree push` commands (no need to re-add remotes) for every subsequent deploy.

After the first deploy, seed the allergen catalog (ADR 5):

```sh
dokku run inci-api bin/rails db:seed
```

## 5. Basic auth

One shared credential gating all three apps (ADR 11) — sign-up included, since it's not disabled in code:

```sh
dokku http-auth:enable inci-api <user> <password>
dokku http-auth:enable inci-web <user> <password>
dokku http-auth:enable inci-ocr <user> <password>
```

Use the same `<user>`/`<password>` on all three so visiting `web.inci.enesenciadesarrollo.es` only prompts once per browser session (per-origin credential caching). Treat this password like any other production secret.

If the Let's Encrypt HTTP-01 challenge in step 1 fails while `http-auth` is already enabled, temporarily `dokku http-auth:disable <app>`, re-run `letsencrypt:enable`, then re-enable auth.
