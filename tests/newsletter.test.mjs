import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import handler from "../api/newsletter.mjs";
const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };
afterEach(() => {
  globalThis.fetch = originalFetch;
  process.env = { ...originalEnv };
});
function configure() {
  process.env.SHOPIFY_STORE_DOMAIN = "test-store.myshopify.com";
  process.env.SHOPIFY_ADMIN_TOKEN = "server-secret";
  process.env.NEWSLETTER_ALLOWED_ORIGIN = "https://outaflow.example";
}
async function call(overrides = {}) {
  let code, body;
  const headers = {};
  await handler(
    {
      method: "POST",
      headers: {
        origin: "https://outaflow.example",
        "content-type": "application/json",
      },
      body: { email: "shopper@example.com", consent: true },
      ...overrides,
    },
    {
      setHeader: (k, v) => (headers[k] = v),
      status: (c) => {
        code = c;
        return { json: (b) => (body = b) };
      },
    },
  );
  return { code, body, headers };
}
test("rejects missing config, cross-origin requests and missing consent", async () => {
  delete process.env.SHOPIFY_ADMIN_TOKEN;
  assert.equal((await call()).code, 503);
  configure();
  assert.equal(
    (await call({ headers: { origin: "https://other.example" } })).code,
    403,
  );
  assert.equal(
    (await call({ body: { email: "shopper@example.com", consent: false } }))
      .code,
    400,
  );
  assert.equal((await call({ method: "GET" })).code, 405);
});
test("creates customer with explicit marketing consent only after persistence", async () => {
  configure();
  const calls = [];
  globalThis.fetch = async (url, options) => {
    const payload = JSON.parse(options.body);
    calls.push(payload);
    assert.equal(options.headers["X-Shopify-Access-Token"], "server-secret");
    return {
      ok: true,
      json: async () => ({
        data:
          calls.length === 1
            ? { customers: { nodes: [] } }
            : {
                customerCreate: {
                  customer: { id: "gid://shopify/Customer/1" },
                  userErrors: [],
                },
              },
      }),
    };
  };
  assert.deepEqual((await call()).body, { success: true });
  assert.equal(
    calls[1].variables.input.emailMarketingConsent.marketingState,
    "SUBSCRIBED",
  );
  assert.equal(calls[1].variables.input.email, "shopper@example.com");
});
test("existing exact email updates consent rather than creating duplicate", async () => {
  configure();
  const calls = [];
  globalThis.fetch = async (url, options) => {
    const payload = JSON.parse(options.body);
    calls.push(payload);
    return {
      ok: true,
      json: async () => ({
        data:
          calls.length === 1
            ? {
                customers: {
                  nodes: [{ id: "customer-1", email: "shopper@example.com" }],
                },
              }
            : { customerEmailMarketingConsentUpdate: { userErrors: [] } },
      }),
    };
  };
  assert.equal((await call()).code, 200);
  assert.equal(calls[1].variables.input.customerId, "customer-1");
});
test("Shopify rejection never reports false success", async () => {
  configure();
  let n = 0;
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      data:
        ++n === 1
          ? { customers: { nodes: [] } }
          : {
              customerCreate: {
                customer: null,
                userErrors: [{ message: "Rejected" }],
              },
            },
    }),
  });
  assert.deepEqual(await call().then(({ code, body }) => ({ code, body })), {
    code: 502,
    body: { success: false },
  });
});
