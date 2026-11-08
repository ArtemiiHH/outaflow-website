import { useEffect, useState, useContext, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowUpRight, ArrowLeft, Plus, Minus } from "@phosphor-icons/react";
import { Store } from "../Store";
import { catalog } from "../config/catalog";
import {
  getVariants,
  createCheckout,
  shopifyConfigured,
  money,
} from "../lib/shopify";
import useInventory from "../hooks/useInventory";
import { Header, Footer } from "../components/Layout";
import NotFound from "./NotFound";
export default function ProductPage() {
  const { slug } = useParams();
  const { drop, preview } = useContext(Store);
  const product = catalog.find(
    (p) =>
      p.slug === slug &&
      drop?.productSlugs.includes(p.slug) &&
      (preview || !p.sample),
  );
  const inventory = useInventory(product ? [product] : []);
  const [selected, setSelected] = useState("");
  const [imageIndex, setImageIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const [error, setError] = useState("");
  useEffect(() => {
    setSelected("");
    setImageIndex(0);
    setError("");
    document.title = product
      ? `${product.name} | outaflow`
      : "Not found | outaflow";
  }, [slug, product]);
  if (!product) return <NotFound />;
  const p = product;
  const variant = p.variants.find((v) => v.size === selected);
  const live = inventory.items.find((v) => v.id === variant?.merchandiseId);
  const price = live?.price ?? inventory.items[0]?.price;
  const ready =
    !preview &&
    !!live?.availableForSale &&
    !inventory.loading &&
    !inventory.error &&
    !busy;
  async function buy() {
    if (!ready || !variant) return;
    setBusy(true);
    setError("");
    try {
      const checked = await getVariants([variant.merchandiseId]);
      if (!checked[0]?.availableForSale) {
        setError("This size just sold out. Please select another size.");
        inventory.retry();
        setBusy(false);
        return;
      }
      const checkoutUrl = await createCheckout(variant.merchandiseId);
      if (mounted.current) window.location.assign(checkoutUrl);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Checkout failed. Please try again.",
      );
      setBusy(false);
    }
  }
  return (
    <>
      <Header />
      <main id="main" className="product-page">
        <Link className="back-link" to="/shop">
          <ArrowLeft size={16} /> Back to shop
        </Link>
        <div className="product-layout">
          <section className="gallery" aria-label="Product gallery">
            <div className="thumbnails">
              {p.images.map((im, i) => (
                <button
                  key={im.src}
                  className={i === imageIndex ? "selected" : ""}
                  onClick={() => setImageIndex(i)}
                  aria-label={`View ${p.name} image ${i + 1}`}
                  aria-pressed={i === imageIndex}
                >
                  <img src={im.src} alt="" />
                </button>
              ))}
            </div>
            <div className="main-product-image">
              <img
                src={p.images[imageIndex].src}
                alt={p.images[imageIndex].alt}
              />
            </div>
          </section>
          <section className="product-info">
            <div className="product-title">
              <h1>{p.name}</h1>
              <span>
                {money(
                  price?.amount ?? p.price,
                  price?.currencyCode ?? p.currency,
                )}
              </span>
            </div>
            <p className="color">{p.color}</p>
            <p className="description">{p.description}</p>
            <fieldset disabled={busy || inventory.loading}>
              <legend>
                Size <span>{selected || "Select a size"}</span>
              </legend>
              <div className="sizes">
                {p.variants.map((v) => {
                  const available =
                    preview ||
                    inventory.items.some(
                      (i) => i.id === v.merchandiseId && i.availableForSale,
                    );
                  return (
                    <button
                      type="button"
                      key={v.size}
                      disabled={!available}
                      onClick={() => {
                        setSelected(v.size);
                        setError("");
                      }}
                      aria-pressed={selected === v.size}
                      className={selected === v.size ? "selected" : ""}
                    >
                      {v.size}
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <button className="buy-button" disabled={!ready} onClick={buy}>
              {busy
                ? "Opening checkout…"
                : inventory.loading
                  ? "Checking stock…"
                  : preview
                    ? "Preview only"
                    : inventory.error
                      ? "Stock unavailable"
                      : !inventory.items.some((v) => v.availableForSale)
                        ? "Currently unavailable"
                        : !selected
                          ? "Select a size"
                          : "Buy now"}
              <ArrowUpRight size={20} />
            </button>
            {preview ? (
              <p className="purchase-note">
                Sample product. Shopify checkout is disabled in preview.
              </p>
            ) : !shopifyConfigured ? (
              <p className="purchase-note">
                The store is not connected yet. Check back at launch.
              </p>
            ) : (
              <p className="purchase-note">
                Secure checkout with Shopify. Shipping calculated at checkout.
              </p>
            )}
            {inventory.error && (
              <button className="text-button" onClick={inventory.retry}>
                Retry availability
              </button>
            )}
            {error && (
              <p className="checkout-error" role="alert">
                {error}
              </p>
            )}
            <div className="accordions">
              {p.sections.map((section) => (
                <details key={section.title}>
                  <summary>
                    {section.title}
                    <Plus className="plus" size={16} />
                    <Minus className="minus" size={16} />
                  </summary>
                  <p>{section.content}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
