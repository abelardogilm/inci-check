# Deploying to Dokku

Three separate Dokku apps, one per service — see [ADR 11](decisions/0011-dokku-deployment.md) for why. Examples below use `inci.enesenciadesarrollo.es` as the base domain; swap in the real one once it's final. App names are prefixed `inci-` (`inci-api`, `inci-web`, `inci-ocr`) to avoid colliding with other projects already on the same shared Dokku server.

Run everything below on the Dokku server itself (SSH in first), except the `git remote add` / `git subtree push` steps and the `RAILS_MASTER_KEY` command in step 3, which need a local checkout of this repo (`config/master.key` is gitignored — it only exists on your machine) — run those as `ssh dokku@<host> <command>` from there instead of from an interactive session on the server, so the key is substituted by your local shell and never has to be read off a terminal or typed by hand.

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

`RAILS_MASTER_KEY` needs `config/master.key`, which only exists on your machine — run this one from a **local checkout** of the repo (repo root), as an `ssh` command rather than from inside an interactive SSH session, so the key is substituted by your shell and never displayed or typed by hand (copy-pasting a `cat`-ed value by hand is exactly how this went wrong once already — e.g. zsh prints a trailing `%` for files with no final newline, which a manual copy/paste can drag along into the value):

```sh
ssh dokku@<your-server-host> config:set inci-api RAILS_MASTER_KEY=$(cat api/config/master.key) --no-restart
```

The rest can run from an interactive SSH session on the server:

```sh
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

All three apps have a `Dockerfile` (see ADR 11 for why `api` moved off Dokku's Ruby buildpack), so Dokku builds each directly. `api/Procfile`'s `release: bin/rails db:prepare` runs migrations on every deploy — confirmed to fire automatically for a Dockerfile-based app too, not just buildpack ones.

Repeat the three `git subtree push` commands (no need to re-add remotes) for every subsequent deploy.

After the first deploy, seed the allergen catalog (ADR 5):

```sh
dokku run inci-api bin/rails db:seed
```

## 5. Fix the proxy port mapping

Dokku defaults a Dockerfile app's internal proxy port to `5000`, regardless of what the `Dockerfile` actually `EXPOSE`s — all three apps came up returning `502` until this was set explicitly to match each one's real listening port (`api`: Puma on `3000`; `web`: nginx on `80`; `ocr`: already correct by luck, uvicorn on `8000`, but set it explicitly to not rely on that):

```sh
dokku proxy:ports-set inci-api http:80:3000 https:443:3000
dokku proxy:ports-set inci-web http:80:80 https:443:80
dokku proxy:ports-set inci-ocr http:80:8000 https:443:8000
```

Verify each app with `curl -o /dev/null -w '%{http_code}\n' https://<subdomain>` — expect `200` (or `401` once basic auth is on, see below), not `502`.

## 6. Basic auth — on `inci-web` only

Tried on all three apps first; broke the SPA's own calls to `inci-api` (see ADR 11 — nginx's basic-auth check and the app's own `Authorization: Bearer <token>` header collide, since there's only one `Authorization` header per request). Enable it only on `inci-web`, the one app with an actual UI to browse to:

```sh
dokku http-auth:enable inci-web <user> <password>
dokku http-auth:disable inci-api   # if you enabled it while following this doc before the fix above landed
dokku http-auth:disable inci-ocr   # same
```

Treat this password like any other production secret — don't paste it into a chat, commit it, or otherwise put it somewhere it'll be logged.

If the Let's Encrypt HTTP-01 challenge in step 1 fails while `http-auth` is already enabled on an app, temporarily `dokku http-auth:disable <app>`, re-run `letsencrypt:enable`, then re-enable auth.
