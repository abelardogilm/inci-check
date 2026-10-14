# 3. Split the API into `admin` and `app` namespaces

## Status

Accepted

## Context

The first `Api::V1::UsersController` exposed unrestricted `create`/`show` for any user — effectively admin-level power (create or view *any* user) with no protection at all. That's wrong for the end-user-facing app: a regular user should only be able to create their own account (sign-up) and, later, view themselves — never anyone else's record.

Session-based authentication (login, `current_user`) is a separate piece of work, tracked for its own PR. We don't want to block this restructuring on it, but we also don't want the admin surface sitting completely open in the meantime.

## Decision

- Split into two namespaces under `api/v1`: `admin` (operator-facing, full access) and `app` (end-user-facing, self-scoped).
- `Api::V1::Admin::UsersController` keeps `create`/`show` for any user, but is now gated by HTTP Basic Auth (`Api::V1::Admin::BaseController`), credentials from `ADMIN_USERNAME`/`ADMIN_PASSWORD` env vars. This is an interim barrier, not the final auth story — once session/role-based auth exists, this should be replaced by a proper admin-role check.
- `Api::V1::App::UsersController` only exposes `create` (sign-up) for now. It's intentionally public — creating your own account doesn't require being authenticated yet. `show self` is deferred: it needs to know who "self" is, which requires the session work that hasn't landed.

## Consequences

- No endpoint currently allows viewing or creating arbitrary users without credentials.
- The HTTP Basic Auth on admin is a known stopgap — tracked here so it isn't mistaken for the real access-control design. It must be swapped out once roles/sessions exist.
- `App::UsersController#show` (viewing your own profile) is still missing; it lands with the session/login PR, not before.
