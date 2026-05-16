import { useEffect } from "react";

const ADMIN_VARS: [string, string][] = [
  ["--background", "#ffffff"],
  ["--foreground", "#1a1008"],
  ["--card", "#f8f7f5"],
  ["--card-foreground", "#1a1008"],
  ["--popover", "#ffffff"],
  ["--popover-foreground", "#1a1008"],
  ["--primary", "#C9A96E"],
  ["--primary-foreground", "#1a1008"],
  ["--secondary", "#f0ede8"],
  ["--secondary-foreground", "#1a1008"],
  ["--muted", "#f0ede8"],
  ["--muted-foreground", "#6b5a4a"],
  ["--accent", "#f0ede8"],
  ["--accent-foreground", "#1a1008"],
  ["--destructive", "#ef4444"],
  ["--destructive-foreground", "#ffffff"],
  ["--border", "rgba(26,16,8,0.1)"],
  ["--input", "rgba(26,16,8,0.1)"],
  ["--ring", "#C9A96E"],
  ["--espresso", "#f8f7f5"],
  ["--gold", "#C9A96E"],
  ["--cream", "#1a1008"],
];

export function useAdminTheme() {
  useEffect(() => {
    const root = document.documentElement;
    for (const [name, value] of ADMIN_VARS) {
      root.style.setProperty(name, value);
    }
    root.style.setProperty("color-scheme", "light");

    return () => {
      for (const [name] of ADMIN_VARS) {
        root.style.removeProperty(name);
      }
      root.style.removeProperty("color-scheme");
    };
  }, []);
}
