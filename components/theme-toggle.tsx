"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsHydrated } from "@/hooks/use-hydrated";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useIsHydrated();

  // Before hydration the resolved theme is unknown, so render a stable,
  // correctly-labelled control rather than guessing and then flipping.
  const isDark = hydrated && resolvedTheme === "dark";
  const label = !hydrated
    ? "Switch theme"
    : isDark
      ? "Switch to light theme"
      : "Switch to dark theme";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? (
        <Sun aria-hidden="true" className="size-4" />
      ) : (
        <Moon aria-hidden="true" className="size-4" />
      )}
    </Button>
  );
}
