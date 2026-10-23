# 12. Installable web app: manifest + icons, no service worker

## Status

Accepted

## Context

Testing happens with a phone, in a store, against `web.inci.enesenciadesarrollo.es`. Opening a URL in the browser each time, with the address bar and browser chrome around it, doesn't feel like the thing being tested — an app. "Add to Home Screen" gets rid of that chrome and gives it an icon, but only if the page ships a web app manifest and real icons; without one, iOS/Android just bookmark the URL with a generic page-screenshot icon.

## Decision

Added a standard PWA manifest (`web/public/manifest.webmanifest`) and real icons (`favicon.svg`, `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`), linked from `index.html`. No service worker.

A service worker (offline caching, background sync) is the other half of a typical PWA, deliberately not added here: this app's only reason to exist is calling a live API (scan a photo, check against a live allergen list) — there's nothing useful to do offline, so a service worker would add complexity (cache invalidation, the classic "stale deployed version stuck in a service worker cache" class of bug) for no real benefit to this app specifically.

The icon itself (a bottle with a magnifying glass over it) is a plain hand-authored SVG (`web/public/favicon.svg`, also the source the PNGs are rasterized from via `rsvg-convert`) using the existing design system's palette (`ink`/`flag`/`paper` — ADR 7), not a generated or AI-illustrated asset — kept simple enough to stay legible at a 32px favicon down to a 192px home-screen icon.

## Consequences

- Visiting the site and using "Add to Home Screen" (iOS Safari) or the install prompt (Android Chrome) now gives a real icon and opens without browser chrome (`"display": "standalone"` in the manifest) — the actual goal here.
- No offline support — the app simply fails its API calls without a connection, same as before this change. Acceptable per the Context above; revisit if that ever becomes a real complaint.
- The icon is deliberately simple geometry (rectangles, a circle, straight lines) specifically so it holds up when scaled down to favicon size — a more detailed illustration would turn to mush at 32px.
