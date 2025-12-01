"use client";

import React from "react";
import { usePathname } from "next/navigation";

export const PageShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();

  return (
    <main className="app-shell" data-path={pathname}>
      {children}
    </main>
  );
};
