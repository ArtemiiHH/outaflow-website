export type LiveVariant = {
  id: string;
  availableForSale: boolean;
  price: { amount: string; currencyCode: string };
};
const domain = import.meta.env.VITE_SHOPIFY_STORE_DOMAIN || "";
const token = import.meta.env.VITE_SHOPIFY_STOREFRONT_TOKEN || "";
export const shopifyConfigured =
  /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(domain) && !!token;
async function request(
  query: string,
  variables: Record<string, unknown>,
  signal?: AbortSignal,
) {
  if (!shopifyConfigured)
    throw new Error(
      "Checkout is not connected yet. Please check back at launch.",
    );
  const response = await fetch(`https://${domain}/api/2026-10/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    signal: signal
      ? AbortSignal.any([signal, AbortSignal.timeout(15000)])
      : AbortSignal.timeout(15000),
  });
  if (!response.ok)
    throw new Error("The store could not be reached. Please try again.");
  const result = await response.json();
  if (result.errors?.length)
    throw new Error(
      "The store could not complete this request. Please try again.",
    );
  return result.data;
}
export async function getVariants(
  ids: string[],
  signal?: AbortSignal,
): Promise<LiveVariant[]> {
  if (!ids.length) return [];
  const data = await request(
    `query Variants($ids:[ID!]!){nodes(ids:$ids){... on ProductVariant{id availableForSale price{amount currencyCode}}}}`,
    { ids },
    signal,
  );
  return data.nodes.filter(Boolean);
}
export async function createCheckout(id: string): Promise<string> {
  const data = await request(
    `mutation Checkout($input:CartInput!){cartCreate(input:$input){cart{checkoutUrl} userErrors{message}}}`,
    { input: { lines: [{ quantity: 1, merchandiseId: id }] } },
  );
  const result = data.cartCreate;
  if (result.userErrors?.length || !result.cart?.checkoutUrl)
    throw new Error(
      result.userErrors?.[0]?.message ||
        "Checkout is unavailable. Please try again.",
    );
  const url = new URL(result.cart.checkoutUrl);
  if (url.protocol !== "https:")
    throw new Error("The store returned an invalid checkout address.");
  return url.href;
}
export const money = (amount: number | string, currency = "EUR") =>
  new Intl.NumberFormat("en-IE", { style: "currency", currency }).format(
    Number(amount),
  );
