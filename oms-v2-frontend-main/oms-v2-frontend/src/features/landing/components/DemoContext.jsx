"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

const DemoContext = createContext({
  openDemo: () => {},
  closeDemo: () => {},
  demoOpen: false,
});

export function DemoProvider({ children }) {
  const [demoOpen, setDemoOpen] = useState(false);
  const openDemo = useCallback(() => {
    window.open("https://calendly.com/domplio-info/30min", "_blank", "noopener,noreferrer");
  }, []);
  const closeDemo = useCallback(() => setDemoOpen(false), []);
  const value = useMemo(
    () => ({ openDemo, closeDemo, demoOpen }),
    [openDemo, closeDemo, demoOpen]
  );
  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  return useContext(DemoContext);
}
