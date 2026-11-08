import { useEffect } from "react";
import { Header, Logo } from "../components/Layout";
import Signup from "../components/Signup";
export default function Opening() {
  useEffect(() => {
    document.title = "outaflow | Opening soon";
  }, []);
  return (
    <div className="opening">
      <div className="landscape" aria-hidden="true" />
      <Header opening />
      <main id="main" className="opening-main">
        <div className="rotating-mark">
          <Logo />
        </div>
        <h1>OPENING SOON</h1>
        <p className="opening-copy">
          A new form of everyday.
          <br />
          Be there for the first drop.
        </p>
        <Signup />
      </main>
      <footer className="opening-footer">
        <span>© {new Date().getFullYear()} outaflow</span>
        <span>Good things take their own time.</span>
        <span>Est. independent</span>
      </footer>
    </div>
  );
}
