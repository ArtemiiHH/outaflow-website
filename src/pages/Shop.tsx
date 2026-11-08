import { useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "@phosphor-icons/react";
import { Store } from "../Store";
import { catalog } from "../config/catalog";
import { money } from "../lib/shopify";
import useInventory from "../hooks/useInventory";
import { Header, Footer } from "../components/Layout";
export default function Shop() {
  const { drop, preview } = useContext(Store);
  const products = catalog.filter(
    (p) => drop?.productSlugs.includes(p.slug) && (preview || !p.sample),
  );
  const inventory = useInventory(products);
  const shown = preview
    ? products
    : products.filter((p) =>
        p.variants.some((v) =>
          inventory.items.some(
            (i) => i.id === v.merchandiseId && i.availableForSale,
          ),
        ),
      );
  useEffect(() => {
    document.title = "Shop all | outaflow";
  }, []);
  return (
    <>
      <Header />
      <main id="main">
        <section className="collection-banner">
          <img
            src="/images/landscape.jpg"
            alt="Clouds moving across a mountain ridge"
          />
          <div>
            <h1>First movement.</h1>
            <span>Made for your own direction.</span>
          </div>
        </section>
        <section className="collection">
          <div className="collection-heading">
            <h2>{drop?.title || "Shop all"}</h2>
            <span>{shown.length} pieces</span>
          </div>
          {preview && (
            <p className="notice">
              Development preview · Sample products and illustrative
              photography. Purchases are disabled.
            </p>
          )}
          {inventory.loading ? (
            <p role="status" className="empty">
              Checking availability…
            </p>
          ) : inventory.error ? (
            <div className="empty" role="alert">
              <p>We couldn’t check availability.</p>
              <button className="text-button" onClick={inventory.retry}>
                Try again
              </button>
            </div>
          ) : !shown.length ? (
            <div className="empty">
              <h2>Nothing available right now.</h2>
              <p>Come back soon for the next release.</p>
            </div>
          ) : (
            <div className="product-grid">
              {shown.map((p) => {
                const live = inventory.items.find(
                  (i) =>
                    p.variants.some((v) => v.merchandiseId === i.id) &&
                    i.availableForSale,
                );
                return (
                  <Link
                    to={`/products/${p.slug}`}
                    className="product-card"
                    key={p.slug}
                  >
                    <div className="product-image">
                      <img
                        className="product-image-front"
                        src={p.images[0].src}
                        alt={p.images[0].alt}
                        loading="lazy"
                      />
                      {p.images[1] && (
                        <img
                          className="product-image-back"
                          src={p.images[1].src}
                          alt=""
                          aria-hidden="true"
                          loading="lazy"
                        />
                      )}
                      <span className="view-product">
                        View piece <ArrowUpRight size={17} />
                      </span>
                    </div>
                    <div className="product-meta">
                      <h3>{p.name}</h3>
                      <span>
                        {money(
                          live?.price.amount ?? p.price,
                          live?.price.currencyCode ?? p.currency,
                        )}
                      </span>
                      <p>
                        {p.color}
                        {p.sample ? " · Sample" : ""}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
