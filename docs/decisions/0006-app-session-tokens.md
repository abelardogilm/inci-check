# 6. User (app) sessions: same token mechanism as admin, longer-lived

## Status

Accepted

## Context

ADR 3 split the API into `admin` and `app` namespaces and deliberately left `App::UsersController#show` (viewing your own profile) out of scope, because it needs to know who "self" is — which needs `current_user`, which needs a login flow. ADR 4 built that login flow for the admin side via signed Bearer tokens. This is the equivalent for end users.

## Decision

- `Api::V1::App::SessionsController#create` validates an email/password against `User#authenticate` (the `has_secure_password` already on the model) and, on success, issues a signed token (`Rails.application.message_verifier(:app_session)`) carrying the user's id, and updates `last_login_at`.
- Unlike the admin token (24h, matches a short admin working session), the user token expires after **2 weeks** — a consumer app shouldn't force a login every day to check an allergen list.
- `current_user` is resolved from the token's `user_id` on each request; a token for a deleted user is treated as unauthenticated rather than erroring.
- `App::UsersController#show` now renders `current_user` and requires authentication; `#create` (sign-up) stays public, unchanged from ADR 3.
- `#destroy` (logout) is a no-op, same rationale as ADR 4: the token is stateless and self-expiring.

## Consequences

- Two separate signed-token "purposes" (`:admin_session`, `:app_session`) keep admin and user tokens from being interchangeable even though both use the same underlying mechanism.
- A leaked user token is valid for up to 2 weeks with no server-side revocation — acceptable for this app's current risk profile (no payment info, no highly sensitive data beyond a personal allergen list), but would need a real revocable session store if that risk profile changes.
- `GET /api/v1/app/user` (singular) is the "my profile" endpoint, separate from `POST /api/v1/app/users` (sign-up) — mirrors `resource :session` already being singular under admin.
