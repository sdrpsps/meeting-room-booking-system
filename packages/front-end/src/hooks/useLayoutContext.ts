import { useContext } from "react";
import { LayoutContext } from "../contexts/LayoutContext";

export function useLayoutContext() {
  const context = useContext(LayoutContext);

  if (!context) {
    throw new Error('useLayoutContext must be used within an LayoutProvider');
  }

  return context;
}
