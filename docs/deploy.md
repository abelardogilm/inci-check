# Deploying to Dokku

Three separate Dokku apps, one per service — see [ADR 11](decisions/0011-dokku-deployment.md) for why. Examples below use `inci.enesenciadesarrollo.es` as the base domain; swap in the real one once it's final.

Run everything below on the Dokku server itself (SSH in first), except the `git remote add` / `git subtree push` steps, which run from a local checkout of this repo.

## 0. One-time server setup

```sh
# Postgres is already installed; http-auth and letsencrypt are not, typically:
sudo dokku plugin:install https://github.com/dokku/dokku-http-auth.git
sudo dokku plugin:install https://github.com/dokku/dokku-letsencrypt.git

dokku apps:create api
dokku apps:create web
dokku apps:create ocr
```

DNS: point `api.inci.enesenciadesarrollo.es`, `web.inci.enesenciadesarrollo.es` and `ocr.inci.enesenciadesarrollo.es` at the server's IP before continuing (domains:add below won't make the app reachable until DNS resolves).

```sh
dokku domains:add api api.inci.enesenciadesarrollo.es
dokku domains:add web web.inci.enesenciadesarrollo.es
dokku domains:add ocr ocr.inci.enesenciadesarrollo.es
```

## 1. Postgres (api only)

```sh
dokku postgres:create inci-check-db
dokku postgres:link inci-check-db api
```

This sets `DATABASE_URL` on `api` automatically — that's what `config/database.yml`'s production block reads.

## 2. Config vars

```sh
# From config/master.key on your machine — needed to decrypt config/credentials.yml.enc.
dokku config:set api RAILS_MASTER_KEY=<contents of api/config/master.key> --no-restart

# CORS (api/config/initializers/cors.rb) and the OCR client (ADR 9/10).
dokku config:set api WEB_ORIGIN=https://web.inci.enesenciadesarrollo.es --no-restart
dokku config:set api OCR_SERVICE_URL=https://ocr.inci.enesenciadesarrollo.es --no-restart

# Admin UI login (ADR 4) — pick a real password, not this one.
dokku config:set api ADMIN_USERNAME=admin ADMIN_PASSWORD=change_me --no-restart
```

`web` needs `VITE_API_URL` baked in at *build* time, not as a runtime config var (Vite env vars are compile-time) — set it as a Docker build arg instead:

```sh
dokku docker-options:add web build "--build-arg VITE_API_URL=https://api.inci.enesenciadesarrollo.es"
```

## 3. Deploy

This is a monorepo, but each Dokku app expects its own code at the repo root — push each subdirectory as its own subtree. From a local checkout:

```sh
dokku_host=dokku@<your-server-host>

git remote add dokku-api $dokku_host:api
git remote add dokku-web $dokku_host:web
git remote add dokku-ocr $dokku_host:ocr

git subtree push --prefix=api dokku-api main
git subtree push --prefix=web dokku-web main
git subtree push --prefix=ocr dokku-ocr main
```

`api` has no `Dockerfile`, so Dokku builds it with its Ruby buildpack (detected via `Gemfile`); `api/Procfile`'s `release: bin/rails db:prepare` runs migrations on every deploy. `web` and `ocr` each have a `Dockerfile`, so Dokku builds those directly.

Repeat the three `git subtree push` commands (no need to re-add remotes) for every subsequent deploy.

After the first deploy, seed the allergen catalog (ADR 5):

```sh
dokku run api bin/rails db:seed
```

## 4. HTTPS

`config/environments/production.rb` sets `force_ssl`/`assume_ssl`, so `api` **requires** a TLS-terminating proxy in front of it — without it, the API will break (redirect loop), not just be insecure.

```sh
dokku letsencrypt:set --global email you@example.com
dokku letsencrypt:enable api
dokku letsencrypt:enable web
dokku letsencrypt:enable ocr
```

## 5. Basic auth

One shared credential gating all three apps (ADR 11) — sign-up included, since it's not disabled in code:

```sh
dokku http-auth:enable api <user> <password>
dokku http-auth:enable web <user> <password>
dokku http-auth:enable ocr <user> <password>
```

Use the same `<user>`/`<password>` on all three so visiting `web.inci.enesenciadesarrollo.es` only prompts once per browser session (per-origin credential caching). Treat this password like any other production secret.

If the Let's Encrypt HTTP-01 challenge in step 4 fails while `http-auth` is already enabled, temporarily `dokku http-auth:disable <app>`, re-run `letsencrypt:enable`, then re-enable auth.
