import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";

export function useResolvedTheme(): "dark" | "light" {
  const { theme } = useTheme();
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return theme === "system" ? (systemDark ? "dark" : "light") : (theme as "dark" | "light");
}
