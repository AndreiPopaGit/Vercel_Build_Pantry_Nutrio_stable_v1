// /lib/categoryMap.ts
import { CATEGORIES } from "@/constant/categories";

const TOPS = Object.keys(CATEGORIES);                           // category
const SUBS = TOPS.flatMap((c) => CATEGORIES[c].map((s) => [c, s] as const));

export function inferCategorySubtypeFromProduct(name: string, category_id?: string | null) {
  const n = (name || "").toLowerCase();

  // 1) Try category_id direct match
  if (category_id && TOPS.includes(category_id)) {
    // also try to infer subtype from the name
    const found = SUBS.find(([, sub]) => n.includes(sub.toLowerCase()));
    return {
      category: category_id,
      subtype: found ? found[1] : undefined,
    };
  }

  // 2) Try to infer subtype from name
  const found = SUBS.find(([, sub]) => n.includes(sub.toLowerCase()));
  if (found) return { category: found[0], subtype: found[1] };

  // 3) As a last resort, see if the name contains a top-level category word
  const top = TOPS.find((c) => n.includes(c.toLowerCase()));
  if (top) return { category: top, subtype: undefined };

  return { category: undefined, subtype: undefined };
}
