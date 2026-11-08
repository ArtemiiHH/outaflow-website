# outaflow — Codex Implementation Instructions

## Objective
Build a minimal, premium clothing-brand storefront inspired by the attached Mertra references. Implement a working, responsive React application, not just static mockups. Maintain an original outaflow identity; do not copy Mertra branding or assets.

## Stack & Architecture
- React.js + Vite, React Router, modern CSS (or a lightweight styling solution already present).
- Shopify is the commerce system of record for inventory, variants, carts, checkout, orders, customers, and subscriptions.
- Keep the app lightweight; avoid a custom database or unnecessary backend.
- Manually define product presentation data in a typed/configured frontend catalog; map each selectable size/color to its real Shopify merchandise variant ID.
- Keep Shopify domain, Storefront API token, and drop settings in environment/config files. Never expose Admin API credentials or private tokens.

## Pages & Routing

### 1. Opening Soon (`/` when no drop is active)
- Full-screen, fashion-focused landing page with a continuously rotating outaflow logo, prominent **OPENING SOON** heading, and email signup.
- Provide loading, success, validation, and error states for the form.
- Email submissions must reach Shopify's customer/subscriber records through a secure Shopify-compatible integration; do not fake success or store emails only in browser state.
- Make signup consent and marketing opt-in explicit.

### 2. Shop All (`/` during an active drop; `/shop`)
- Minimal editorial layout inspired by the Mertra product-grid reference.
- Responsive product grid, clean imagery, compact product name/price, and subtle hover interactions.
- Display only products configured for the active drop and currently available for sale.
- Product cards link to `/products/:slug`.
- Keep product descriptions, imagery, display order, and other editorial data in the frontend catalog rather than dynamically building the catalog from Shopify.

### 3. Product Details (`/products/:slug`)
- Large image gallery with selectable thumbnails; product title, price, description, and size/variant selector.
- Prominent **BUY NOW** action, disabled until a valid available variant is selected.
- Use the selected Shopify variant to create a Storefront API cart and redirect to its Shopify-hosted `checkoutUrl`.
- Provide clear loading, unavailable, out-of-stock, and checkout-error states.
- Include compact expandable sections for product details, sizing, shipping, and care information when data exists.
- Follow the attached product-page reference for composition, spacing, and visual hierarchy.

## Scheduled Drops
- Define drops in a small configuration file with ID, title, `startsAt`, `endsAt`, and product slugs; use ISO 8601 timestamps with explicit offsets/UTC.
- A drop is active only within its configured window. Outside that window, show Opening Soon by default.
- Check the clock on initial load, on tab focus, and periodically while open so the UI switches without manual deployment or refresh.
- Ensure routes and navigation respect inactive drops; do not expose purchasable product pages when no drop is active.
- Client-side scheduling controls storefront visibility, **not** secure enforcement of purchase eligibility. Document that strict timed inventory/checkout restrictions require Shopify-side enforcement.

## Shopify Integration
- Use the Shopify Storefront API only for essential live operations: checking variant availability/pricing as needed, creating carts, and obtaining hosted checkout URLs.
- Never trust frontend prices or inventory as authoritative; Shopify determines final checkout totals and stock.
- Keep public Storefront API credentials separate from private Admin API credentials.
- For email collection, prefer an approved Shopify form/embed or supported secure integration. If direct customer creation is needed, use the smallest secure serverless endpoint with secrets stored server-side; do not invent an insecure frontend Admin API call.
- Provide `.env.example` and brief setup instructions for Shopify domain, Storefront API access, variant IDs, and email integration.

## Design & UX
- **Mandatory:** use the installed `impeccable` and `taste-skill` skills for frontend design and refinement. If unavailable, state this and apply their intended design principles manually; do not claim to have run them.
- A bold, minimal, high-end streetwear aesthetic: generous whitespace, strong typography, neutral palette, excellent image presentation, and restrained motion.
- Closely study the reference screenshots for layout, product-gallery behavior, density, and hierarchy, but make the design unmistakably outaflow.
- Mobile-first and fully responsive, with accessible keyboard navigation, focus states, semantic markup, descriptive alt text, and reduced-motion support.
- Avoid generic template aesthetics, unnecessary UI libraries, oversized effects, and feature creep.

## Deliverables & Acceptance
- Working Vite project with all three page states, routing, catalog/drop configuration, and reusable UI components.
- Shopify checkout and email signup integrations implemented where credentials are available; otherwise provide explicit configuration placeholders and truthful disabled/demo states.
- Include sample products and image placeholders only where real assets/IDs are missing; clearly mark all placeholders.
- Include concise `README.md` with local run, environment setup, product/variant mapping, drop scheduling, and deployment notes.
- Verify production build, responsive layouts, form behavior, variant selection, checkout redirects, and scheduled state transitions.
- Do not add accounts, custom checkout, CMS, database, or other pages without a clear requirement.

## References
- All design references and brand assets are located in the project’s `/references` folder. Inspect its contents before implementation.
- Use the screenshots in `/references` as visual guidance for the Opening Soon, Shop All, and Product Details pages, where applicable.
- The brand logo is named `outaflow-logo` in `/references` (use its actual file extension). Use it throughout the site, including the rotating logo on Opening Soon.
- Do not substitute Mertra branding or invent replacement brand assets when the provided outaflow logo is available.

## Execution
Inspect the existing repository and reference images first. Implement the simplest robust solution consistent with these instructions. Make sensible minor decisions autonomously; flag only genuine blockers such as missing Shopify credentials, real variant IDs, or subscription integration configuration.
