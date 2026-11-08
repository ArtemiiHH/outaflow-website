// Test-only fixture server: transforms local catalog/drop configuration in memory.
// None of these test credentials or fixtures are included in a production build.
import { createServer } from "vite";
const mode = process.argv[2] || "opening";
const port =
  mode === "preview"
    ? 4174
    : mode === "live"
      ? 4175
      : mode === "signup"
        ? 4176
        : 4173;
const server = await createServer({
  server: { host: "127.0.0.1", port, strictPort: true },
  define: {
    "import.meta.env.VITE_PREVIEW_MODE": JSON.stringify(
      mode === "preview" ? "true" : "false",
    ),
    "import.meta.env.VITE_NEWSLETTER_ENDPOINT": JSON.stringify(
      mode === "signup" ? "/api/newsletter" : "",
    ),
    "import.meta.env.VITE_SHOPIFY_STORE_DOMAIN": JSON.stringify(
      mode === "live" ? "test.myshopify.com" : "",
    ),
    "import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN": JSON.stringify(
      mode === "live" ? "public-test-token" : "",
    ),
  },
  plugins:
    mode === "live"
      ? [
          {
            name: "test-fixtures",
            enforce: "pre",
            transform(code, id) {
              if (id.endsWith("/src/config/drops.ts"))
                return code.replace(
                  "export const drops: Drop[] = [];",
                  `export const drops: Drop[] = [{id:'test',title:'Test drop',startsAt:'2026-11-08T10:00:00Z',endsAt:'2026-11-08T12:00:00Z',productSlugs:['form-hoodie','everyday-tee']}];`,
                );
              if (id.endsWith("/src/config/catalog.ts"))
                return code
                  .replace(
                    'merchandiseId: ""',
                    "merchandiseId: `gid://shopify/ProductVariant/${slug}-${size}`",
                  )
                  .replace("sample: true", "sample: false");
            },
          },
        ]
      : [],
});
await server.listen();
