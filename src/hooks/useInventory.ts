import { useEffect, useState } from "react";
import type { Product } from "../config/catalog";
import {
  getVariants,
  shopifyConfigured,
  type LiveVariant,
} from "../lib/shopify";
export default function useInventory(products: Product[]) {
  const key = products
    .flatMap((p) => p.variants.map((v) => v.merchandiseId))
    .filter(Boolean)
    .join("|");
  const [state, setState] = useState<{
    items: LiveVariant[];
    loading: boolean;
    error: boolean;
  }>({ items: [], loading: shopifyConfigured, error: false });
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    if (!shopifyConfigured || !key) {
      setState({ items: [], loading: false, error: false });
      return;
    }
    setState({ items: [], loading: true, error: false });
    getVariants(key.split("|"), controller.signal)
      .then((items) => setState({ items, loading: false, error: false }))
      .catch(() => {
        if (!controller.signal.aborted)
          setState({ items: [], loading: false, error: true });
      });
    return () => controller.abort();
  }, [key, retry]);
  return { ...state, retry: () => setRetry((n) => n + 1) };
}
