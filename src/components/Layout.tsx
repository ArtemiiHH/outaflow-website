import { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import { Basket, X } from "@phosphor-icons/react";
import { Store } from "../Store";
export function Logo({ className = "" }: { className?: string }) {
  return (
    <img
      className={`logo ${className}`}
      src="/images/outaflow-logo.png"
      alt="outaflow emblem"
      width="236"
      height="236"
    />
  );
}
export function Header({ opening = false }: { opening?: boolean }) {
  const { drop } = useContext(Store);
  const announcement = drop ? "NEW DROP ONLINE NOW" : "NEXT DROP COMING SOON";
  return (
    <>
      <div className="drop-announcement" aria-label={announcement}>
        <div className="announcement-track" aria-hidden="true">
          {[0, 1].map((group) => (
            <div className="announcement-group" key={group}>
              {Array.from({ length: 6 }, (_, i) => (
                <span key={i}>{announcement}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <header className={`header ${opening ? "header-opening" : ""}`}>
        <Link to="/" aria-label="outaflow home" className="wordmark">
          outaflow
        </Link>
        <nav aria-label="Main navigation">
          <NavLink to="/" end>
            HOME
          </NavLink>
          <NavLink to="/shop">SHOP</NavLink>
        </nav>
        <button
          className="cart-button"
          popoverTarget="header-cart"
          aria-label="Open cart"
        >
          <Basket size={22} weight="regular" />
        </button>
      </header>
      <div id="header-cart" className="cart-popover" popover="auto">
        <div className="cart-heading">
          <h2>Your cart</h2>
          <button
            className="cart-button"
            popoverTarget="header-cart"
            popoverTargetAction="hide"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>
        <p>Your cart is empty.</p>
        <p className="cart-help">
          {drop
            ? "Choose a piece and use Buy now to check out directly."
            : "The next drop is coming soon."}
        </p>
        {drop && (
          <Link
            className="text-button"
            to="/shop"
            onClick={() =>
              document.getElementById("header-cart")?.hidePopover()
            }
          >
            Explore the drop
          </Link>
        )}
      </div>
    </>
  );
}
export function Footer() {
  return (
    <footer className="footer">
      <span>© {new Date().getFullYear()} outaflow</span>
      <span>Move in your own direction.</span>
    </footer>
  );
}
