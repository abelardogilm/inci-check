# 4. Admin auth moves to signed session tokens

## Status

Accepted

## Context

ADR 3 gated the admin API with HTTP Basic Auth as an explicit stopgap, to be replaced "once role-based auth lands with sessions." We're now building an admin UI, which needs a real login screen rather than sending raw credentials on every request — that's the trigger for this replacement.

The admin account is still a single shared credential pair from env vars (`ADMIN_USERNAME`/`ADMIN_PASSWORD`) — there's no multi-admin or role model yet. That part of ADR 3 hasn't changed, only how a client proves it has those credentials on each request.

## Decision

- `Api::V1::Admin::SessionsController#create` validates the submitted username/password against the env credentials and, if valid, returns a signed, time-limited token (`Rails.application.message_verifier(:admin_session)`, no extra gem — built into Rails). The token expires after 24 hours.
- `Api::V1::Admin::BaseController` now authenticates via `Authorization: Bearer <token>`, verifying the signature and expiry, instead of HTTP Basic.
- `#destroy` (logout) is a no-op that always returns 204. The token is stateless and self-expiring; there's no server-side revocation list. Good enough for a single shared admin credential — not something to rely on if this ever becomes multi-user.
- The admin web UI stores the token in `sessionStorage` (cleared when the tab closes) and sends it as a Bearer header on every admin API request.

## Consequences

- The admin UI can show a real login screen instead of prompting for Basic Auth credentials on every request.
- A leaked token is valid until it expires (max 24h) — there's no way to revoke it early. Acceptable for now; would need a server-side token/session store if admin accounts become real multi-user identities.
- Still not the final access-control story: a proper admin role tied to a real account (rather than one shared credential pair) is future work, same caveat as ADR 3.
