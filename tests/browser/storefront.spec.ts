import { test, expect } from "@playwright/test";
import fs from "node:fs";
const review = ".impeccable/review";
fs.mkdirSync(review, { recursive: true });
for (const viewport of [
  { width: 1440, height: 960 },
  { width: 390, height: 844 },
]) {
  const device = viewport.width === 390 ? "mobile" : "desktop";
  test(`opening, shop and product responsive captures (${device})`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("http://127.0.0.1:4173");
    await page.evaluate(() => document.fonts.ready);
    await expect(
      page.getByRole("button", { name: "Email signup opens soon" }),
    ).toBeDisabled();
    await expect(
      page.getByRole("heading", { name: "OPENING SOON" }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: `${review}/${device}.png`, fullPage: true });
    await page.goto("http://127.0.0.1:4174/shop");
    await expect(page.locator(".product-card")).toHaveCount(4);
    await page.evaluate(() => document.fonts.ready);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: `${review}/shop-${device}.png`,
      fullPage: true,
    });
    await page.locator(".product-card").first().click();
    await expect(
      page.getByRole("heading", { name: "Form hoodie", exact: true }),
    ).toBeVisible();
    await page.getByRole("button", { name: "M", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "M", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByRole("button", { name: "Preview only" }),
    ).toBeDisabled();
    await page
      .getByRole("button", { name: "View Form hoodie image 2" })
      .click();
    await expect(page.locator(".main-product-image img")).toHaveAttribute(
      "src",
      "/images/hoodie-detail.jpg",
    );
    await page.getByText("Product details", { exact: true }).click();
    await expect(page.locator("details").first()).toHaveAttribute("open", "");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: `${review}/product-${device}.png`,
      fullPage: true,
    });
  });
}
test("signup validates, reports failures and waits for confirmed persistence", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:4176");
  const submit = page.getByRole("button", { name: "Sign up for drop updates" });
  await submit.click();
  await expect(page.getByRole("status")).toContainText("Enter a valid email");
  await page.getByRole("textbox").fill("shopper@example.com");
  await submit.click();
  await expect(page.getByRole("status")).toContainText("agree");
  await page.getByRole("checkbox").check();
  await page.route("**/api/newsletter", (route) =>
    route.fulfill({ status: 502, json: { success: false } }),
  );
  await submit.click();
  await expect(page.getByRole("status")).toContainText("couldn’t save");
  await page.unroute("**/api/newsletter");
  await page.route("**/api/newsletter", async (route) => {
    expect(route.request().postDataJSON()).toEqual({
      email: "shopper@example.com",
      consent: true,
    });
    await new Promise((r) => setTimeout(r, 150));
    await route.fulfill({ json: { success: true } });
  });
  await submit.click();
  await expect(submit).toBeDisabled();
  await expect(page.getByRole("status")).toContainText("You’re on the list");
});
test("inactive drop gates direct shop and product URLs", async ({ page }) => {
  for (const route of ["/shop", "/products/form-hoodie"]) {
    await page.goto(`http://127.0.0.1:4173${route}`);
    await expect(
      page.getByRole("heading", { name: "OPENING SOON" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Buy now" })).toHaveCount(0);
  }
});
async function mockStock(page: any, cartError = false) {
  await page.route("https://test.myshopify.com/**", async (route: any) => {
    const body = route.request().postDataJSON();
    if (body.query.includes("mutation")) {
      expect(body.variables.input.lines[0].merchandiseId).toBe(
        "gid://shopify/ProductVariant/form-hoodie-M",
      );
      return route.fulfill({
        json: {
          data: {
            cartCreate: cartError
              ? {
                  cart: null,
                  userErrors: [{ message: "Stock changed. Try again." }],
                }
              : {
                  cart: {
                    checkoutUrl: "https://checkout.example/checkout/test",
                  },
                  userErrors: [],
                },
          },
        },
      });
    }
    return route.fulfill({
      json: {
        data: {
          nodes: body.variables.ids.map((id: string) => ({
            id,
            availableForSale: id.includes("form-hoodie") && !id.endsWith("-XS"),
            price: { amount: "123.00", currencyCode: "EUR" },
          })),
        },
      },
    });
  });
}
test("live inventory hides sold-out products and checkout uses selected merchandise", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-11-08T11:00:00Z") });
  await mockStock(page);
  await page.route("https://checkout.example/**", (route) =>
    route.fulfill({ body: "Hosted checkout" }),
  );
  await page.goto("http://127.0.0.1:4175/shop");
  await expect(page.locator(".product-card")).toHaveCount(1);
  await page.locator(".product-card").click();
  await expect(
    page.getByRole("button", { name: "XS", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Select a size", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "M", exact: true }).click();
  await expect(page.locator(".product-title")).toContainText("€123.00");
  await page.getByRole("button", { name: "Buy now" }).click();
  await expect(page).toHaveURL("https://checkout.example/checkout/test");
});
test("checkout errors allow retry and drop expiry gates an open product", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-11-08T11:59:57Z") });
  await mockStock(page, true);
  await page.goto("http://127.0.0.1:4175/products/form-hoodie");
  await page.getByRole("button", { name: "M", exact: true }).click();
  await page.getByRole("button", { name: "Buy now" }).click();
  await expect(page.getByRole("alert")).toContainText("Stock changed");
  await expect(page.getByRole("button", { name: "Buy now" })).toBeEnabled();
  await page.clock.fastForward(4000);
  await expect(
    page.getByRole("heading", { name: "OPENING SOON" }),
  ).toBeVisible();
});
test("scheduled drop starts without refresh", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-11-08T09:59:58Z") });
  await mockStock(page);
  await page.goto("http://127.0.0.1:4175");
  await expect(
    page.getByRole("heading", { name: "OPENING SOON" }),
  ).toBeVisible();
  await page.clock.fastForward(3000);
  await expect(page.locator(".product-card")).toHaveCount(1);
});
