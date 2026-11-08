# Verification record

- Production build: passed (`npm run build`).
- Unit tests: passed (`npm test`), covering drop boundaries/timezones and server-side newsletter validation, customer creation, existing-customer consent and upstream rejection.
- Browser tests: 7 passed (`npx playwright test` with an existing Chromium binary and temporary shared libraries). Covered desktop/mobile overflow, all three surfaces, gallery selection, size selection, expandable details, disabled preview purchases, missing-integration signup state, signup validation/loading/error/success with mocked persistence, inactive route gating, live availability filtering, selected-variant cart creation, hosted checkout redirect, checkout error recovery, and automatic drop start/expiry.
- Screenshots: desktop.png and mobile.png are the default unconfigured Opening Soon state. shop-*.png and product-*.png use the explicitly labeled development preview. All were captured with reduced motion, from the document top, then opened and inspected.
- Mechanical Impeccable detector: returned no findings.
- Independent finish review: ship at the reviewed fix scope; banner eyebrow removal, disabled unconfigured signup, hidden skip link and all six recaptures resolved.
- No real Shopify credentials were provided. Remote commerce and subscriber operations were mocked in tests; no live sale or subscriber submission was performed.

Browser setup on this machine required a fallback: downloading a matching Chromium failed, and system dependency installation required an interactive sudo password. The already-installed Chromium ran successfully using downloaded libraries extracted only in /tmp. The portable Playwright configuration accepts PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, otherwise it uses its normal installed browser.
