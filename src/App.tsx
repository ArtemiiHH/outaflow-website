import { useEffect, useState } from "react";
import { Link, Routes, Route, useLocation } from "react-router-dom";
import { Store } from "./Store";
import { drops, sampleDrop } from "./config/drops";
import { activeDrop } from "./lib/schedule.mjs";
import Opening from "./pages/Opening";
import Shop from "./pages/Shop";
import ProductPage from "./pages/Product";
import NotFound from "./pages/NotFound";
const preview =
  import.meta.env.DEV && import.meta.env.VITE_PREVIEW_MODE === "true";
export default function App() {
  const [now, setNow] = useState(Date.now());
  const location = useLocation();
  useEffect(() => {
    const update = () => setNow(Date.now());
    const timer = setInterval(update, 1000);
    window.addEventListener("focus", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  const drop = preview ? sampleDrop : activeDrop(drops, now);
  return (
    <Store.Provider value={{ drop, preview }}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      {preview && (
        <div className="preview-bar">
          Development preview <Link to="/shop">Shop</Link>
        </div>
      )}
      {!drop ? (
        <Opening />
      ) : (
        <Routes>
          <Route path="/" element={<Shop />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/products/:slug" element={<ProductPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      )}
    </Store.Provider>
  );
}
