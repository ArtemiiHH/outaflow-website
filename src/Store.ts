import { createContext } from "react";
import type { Drop } from "./config/drops";
export const Store = createContext<{ drop: Drop | null; preview: boolean }>({
  drop: null,
  preview: false,
});
