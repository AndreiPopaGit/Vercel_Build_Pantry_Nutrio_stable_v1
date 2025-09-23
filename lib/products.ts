// /lib/products.ts
import { supabase } from "./supabaseClient";

export type ProductListing = {
  id: string;
  shop_id: string | null;
  name: string;
  description: string | null;
  category_id: string | null;
};

export async function searchProducts(term: string, limit = 12): Promise<ProductListing[]> {
  // Empty term -> nothing (avoid loading entire table)
  if (!term.trim()) return [];
  const { data, error } = await supabase
    .from("product_listings")
    .select("id,shop_id,name,description,category_id")
    .ilike("name", `%${term}%`)
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as ProductListing[];
}
