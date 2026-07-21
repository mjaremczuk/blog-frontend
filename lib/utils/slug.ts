/**
 * Single Responsibility Principle (SRP):
 * Dedicated utility function for normalizing Polish characters and generating URL-safe slugs.
 */
export function generateSlug(text: string): string {
  const polishChars: { [key: string]: string } = {
    ą: "a", ć: "c", ę: "e", ł: "l", ń: "n", ó: "o", ś: "s", ź: "z", ż: "z",
    Ą: "a", Ć: "c", Ę: "e", Ł: "l", Ń: "n", Ó: "o", Ś: "s", Ź: "z", Ż: "z",
  };

  let normalized = text;
  for (const char in polishChars) {
    normalized = normalized.replaceAll(char, polishChars[char]);
  }

  return normalized
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric characters except spaces/hyphens
    .replace(/[\s_]+/g, "-")      // Replace spaces and underscores with hyphens
    .replace(/-+/g, "-");         // Deduplicate hyphens
}
