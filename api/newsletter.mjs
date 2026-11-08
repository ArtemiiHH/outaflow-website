// Vercel Node serverless handler. Never import this module into browser code.
// Use a same-origin deployment and enable platform-level rate limiting on this route.
export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const send = (code, body) => res.status(code).json(body);
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return send(405, { success: false });
  }
  const {
    SHOPIFY_STORE_DOMAIN: domain,
    SHOPIFY_ADMIN_TOKEN: token,
    NEWSLETTER_ALLOWED_ORIGIN: origin,
  } = process.env;
  if (
    !domain ||
    !token ||
    !origin ||
    !/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(domain)
  )
    return send(503, { success: false });
  if (req.headers.origin !== origin) return send(403, { success: false });
  if (!req.headers["content-type"]?.startsWith("application/json"))
    return send(415, { success: false });
  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return send(400, { success: false });
  }
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    body?.consent !== true
  )
    return send(400, { success: false });
  const consent = {
    marketingState: "SUBSCRIBED",
    marketingOptInLevel: "SINGLE_OPT_IN",
    consentUpdatedAt: new Date().toISOString(),
  };
  async function graphql(query, variables) {
    const response = await fetch(
      `https://${domain}/admin/api/2026-10/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": token,
        },
        body: JSON.stringify({ query, variables }),
        signal: AbortSignal.timeout(10000),
      },
    );
    const payload = await response.json();
    if (!response.ok || payload.errors?.length)
      throw new Error("Shopify unavailable");
    return payload.data;
  }
  try {
    // Search only an exact email; never expose whether a customer already exists.
    const data = await graphql(
      "query Find($query:String!){customers(first:5,query:$query){nodes{id email}}}",
      { query: `email:"${email.replace(/[\\"]/g, "\\$&")}"` },
    );
    const customer = data.customers.nodes.find(
      (c) => c.email?.toLowerCase() === email,
    );
    if (customer) {
      const data = await graphql(
        "mutation Consent($input:CustomerEmailMarketingConsentUpdateInput!){customerEmailMarketingConsentUpdate(input:$input){userErrors{message}}}",
        { input: { customerId: customer.id, emailMarketingConsent: consent } },
      );
      if (data.customerEmailMarketingConsentUpdate.userErrors.length)
        throw new Error("Consent rejected");
    } else {
      const data = await graphql(
        "mutation Subscribe($input:CustomerInput!){customerCreate(input:$input){customer{id} userErrors{message}}}",
        {
          input: {
            email,
            emailMarketingConsent: consent,
            tags: ["outaflow-newsletter"],
          },
        },
      );
      if (
        data.customerCreate.userErrors.length ||
        !data.customerCreate.customer
      )
        throw new Error("Subscription rejected");
    }
    return send(200, { success: true });
  } catch {
    return send(502, { success: false });
  }
}
