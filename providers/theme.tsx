"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Bypass React 19 warning about next-themes injecting a script tag.
// The script is required to prevent FOUC (Flash of Unstyled Content) and is perfectly safe.
if (typeof window !== "undefined") {
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes(
        "Encountered a script tag while rendering React component",
      )
    ) {
      return;
    }
    originalError(...args);
  };
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
