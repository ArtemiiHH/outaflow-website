# outaflow

React + Vite + TypeScript storefront with scheduled releases, a curated frontend catalog, Shopify hosted checkout and a server-side newsletter integration. The repository stores the supplied assets in `reference/`, not `references/`.

## Local development

```sh
npm install
cp .env.example .env.local
npm run dev
```

No drop is scheduled by default, so `/`, `/shop` and product URLs show Opening Soon. To inspect sample shop/product screens, set `VITE_PREVIEW_MODE=true` in `.env.local`, restart Vite, and visit `/shop`. Preview is ignored in production, never permits purchases, and explicitly labels the illustrative catalog. Use `npm run build` and `npm run preview` for a production build. `npm test` verifies schedule boundaries and newsletter behavior. `npx playwright test` runs browser checks against isolated test servers on ports 4173–4176 (install Chromium once with `npx playwright install chromium`).

## Shopify configuration

1. Configure a Shopify Headless sales channel/public Storefront token and publish the desired products to that channel. Put your `your-store.myshopify.com` domain and **public** Storefront token in `VITE_SHOPIFY_STORE_DOMAIN` and `VITE_SHOPIFY_STOREFRONT_TOKEN`. Node 22.12+ is recommended. The integration uses API version `2026-10`.
2. Replace sample entries in `src/config/catalog.ts`. Define copy, image arrays, display order, color and size variants locally. Each variant needs its actual `gid://shopify/ProductVariant/123456789` merchandise ID. For multiple colors, add their size mappings and present each color as its own catalog product/slug. Mark real products `sample: false`. Frontend prices are indicative; live Shopify variant prices replace them. Shopify owns final totals and inventory.
3. Add windows in `src/config/drops.ts`: ID, title, ISO 8601 `startsAt`/`endsAt` with explicit timezone, and product slugs. Start is inclusive, end exclusive. Avoid overlapping windows; the first match wins. Catalog order controls display order. Out-of-stock/unmapped products never appear in the live shop.
4. A selected available variant is rechecked, sent to Storefront `cartCreate`, and its HTTPS `checkoutUrl` is used for navigation. Errors stay on the product page with retry controls.

The clock is checked initially, every second, on focus, and on visibility changes. Inactive releases gate every route. Client time can be changed and public credentials/variant IDs can be inspected: **strict timed sales must also be enforced in Shopify**, e.g. publication, inventory and Shopify-side validation. Closing this UI does not invalidate an existing checkout.

## Email signup

The default form disables submission and truthfully reports that signup is not open. It never stores submitted addresses in browser storage and never reports success without `{ "success": true }` from the integration.

`api/newsletter.mjs` is a Vercel-compatible Node 22 serverless function. Set server-only `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_ADMIN_TOKEN` (Admin API `read_customers` and `write_customers`, including any required protected customer-data approval), and `NEWSLETTER_ALLOWED_ORIGIN` (exact origin, no trailing slash). Set public `VITE_NEWSLETTER_ENDPOINT=/api/newsletter` only after deployment. The function requires JSON, matching Origin, valid email and explicit consent, then creates a Shopify customer or updates the exact matching customer's marketing consent. It uses single opt-in, records the timestamp, and never exposes customer existence or Shopify errors. No private token is imported into the app.

Enable host-level rate limiting/bot protection for `/api/newsletter` before public launch. Origin checking prevents normal cross-site browser submissions, but is not bot authentication. No unreliable in-memory limiter/database is used. If you require double opt-in, replace this with your approved Shopify email integration and its consent flow; do not change UI copy to promise double opt-in without implementing it. An approved existing signup service can also be configured if it accepts `{email, consent:true}` and returns `{success:true}` only after Shopify persistence.

Vite serves only the frontend; run `vercel dev` or use your provider's function emulator to exercise the endpoint locally, with a matching localhost allowed origin. Keep all `SHOPIFY_ADMIN_TOKEN` values server-only and never use a `VITE_` prefix.

## Deployment

`npm run build` generates `dist/`. Static hosts must rewrite non-file frontend routes to `index.html` and must route `/api/*` to functions rather than the SPA. Included `vercel.json` supplies SPA rewrites and basic security headers. Other hosts can adapt the small Node handler without a database. Configure environment values in the host, run the build, enable endpoint abuse protection, then verify real availability, consent persistence and Shopify checkout in a test store before launch. No deployment is performed by this project.

## Assets

Supplied logo: `reference/outaflow-logo.png`, copied intact. CSS lifts its gray background for blending while preserving the actual logo geometry. Layout references are not shipped as store artwork. `public/images/landscape.jpg` is a stock placeholder from Unsplash. All sample products now use the user-supplied jacket front/back photos; front is the preview and back appears on hover or keyboard focus. Both images are available in every product gallery. Replace sample imagery with owned brand photography before launching. Origins are recorded in `public/images/SOURCES.md`. Manrope is self-hosted under its included SIL OFL license.

No real launch date, real catalog, private credentials or subscription provider settings were supplied. Those remain intentional configuration tasks.

API references: [Shopify Storefront cartCreate](https://shopify.dev/docs/api/storefront/latest/mutations/cartCreate), [customerCreate](https://shopify.dev/docs/api/admin-graphql/latest/mutations/customerCreate), [customerEmailMarketingConsentUpdate](https://shopify.dev/docs/api/admin-graphql/latest/mutations/customerEmailMarketingConsentUpdate).
