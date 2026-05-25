// Robustly derive the display brand from the configured site name.
// Handles both straight (') and curly (’) apostrophes and strips any
// trailing words (e.g. "Lov'Ceylon Photography" → brand "Lov'Ceylon").
export function getBrand(siteName?: string | null): { before: string; after: string } {
  const raw = (siteName ?? "Lov'Ceylon").trim();
  const brand = raw.split(/\s+/)[0] || "Lov'Ceylon";
  const idx = brand.search(/['’`]/);
  if (idx === -1) return { before: brand, after: "" };
  return { before: brand.slice(0, idx), after: brand.slice(idx + 1) || "Ceylon" };
}
