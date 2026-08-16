"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <button
      type="button"
      aria-label="Cambiar tema"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative flex h-9 w-16 items-center rounded-full border border-border bg-bg-card px-1 transition-colors cursor-pointer"
    >
      <span
        className="absolute top-1 h-7 w-7 rounded-full bg-accent shadow-md transition-transform duration-300"
        style={{ transform: isDark ? "translateX(0px)" : "translateX(28px)" }}
      />
      <Moon className="relative z-10 h-4 w-4 text-text-primary" />
      <Sun className="relative z-10 ml-auto h-4 w-4 text-text-primary" />
    </button>
  );
}
