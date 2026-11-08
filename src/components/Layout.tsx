import { useContext } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "@phosphor-icons/react";
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
  return (
    <header className={`header ${opening ? "header-opening" : ""}`}>
      <Link to="/" aria-label="outaflow home" className="wordmark">
        outaflow
      </Link>
      <nav aria-label="Main navigation">
        {drop ? (
          <Link to="/shop">
            Shop all <ArrowUpRight size={13} />
          </Link>
        ) : (
          <span>Independent by nature.</span>
        )}
      </nav>
      <Link to="/" className="header-symbol" aria-label="outaflow home">
        <Logo />
      </Link>
    </header>
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
