# P0 foundations

## Approved Figma sources

The typed source of truth is `src/config/figmaApprovedFrames.ts`. Frame IDs must be updated there before visual implementation changes are accepted.

## Responsive contract

Breakpoints live in `src/assets/styles/utils/_variables.scss`; responsive code uses `_mixins.scss`. Supported boundaries are 360, 400, 576, 768, 992, 1200 and 1400 pixels.

## API and session contract

Runtime URLs live in `src/config/runtime.ts`. Browser requests use `/api/backend`; server requests use the backend API directly. Authentication cookies are HttpOnly and tokens are not persisted in browser storage.

## Routing contract

Next.js 16 route protection is implemented only by the root `proxy.ts`.
