# Linketus Agent Rules

## PWA Update Rules (Do Not Break)

- Keep auto-update behavior for installed PWA (home screen) working:
  - `components/push-subscription-manager.tsx` must continue to:
    - register SW with `updateViaCache: "none"`,
    - poll `/api/version`,
    - call `registration.update()` on interval and on visibility return,
    - reload on `controllerchange`.
- Keep `app/api/version/route.ts` available and uncached.
- Keep `public/sw.js` using versioned `CACHE_NAME` and support `SKIP_WAITING` message.
- When changing icons/manifest assets:
  - use versioned filenames (example: `icon-192-v7.png`),
  - update references in both `app/manifest.ts` and `app/layout.tsx`,
  - bump SW cache version if caching behavior changes.
- Keep `no-cache` headers in `next.config.ts` for:
  - `/sw.js`,
  - `/manifest.webmanifest`,
  - favicon/icon assets currently in use.

## Important iOS Note

- iOS may keep the icon for an already installed home-screen shortcut.
- Code/content updates should apply automatically, but icon replacement may still require reinstalling the shortcut.

## Push Security Rules (Do Not Break)

- `send-checkin-push` is deployed with `--no-verify-jwt`.
- Function must be protected by shared secret header `x-internal-token`.
- App sends `x-internal-token` from `PUSH_INTERNAL_TOKEN`.
- `PUSH_INTERNAL_TOKEN` must be configured in both:
  - Next.js runtime env,
  - Supabase function secrets.
