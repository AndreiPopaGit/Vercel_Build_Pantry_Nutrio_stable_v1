// /lib/consumption.ts
import { supabase } from "../lib/supabaseClient";

export type ConsumeArgs = {
  itemId: string;
  qty: number;
  unit: "pcs" | "g";
  // optional nutrition; pass nulls if you don't compute them
  grams?: number | null;
  kcal?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fat?: number | null;
  consumedAt?: string; // "YYYY-MM-DD"
  nameOverride?: string;
};

export async function logConsumptionAtomic(args: ConsumeArgs) {
  const { itemId, qty, unit, grams=null, kcal=null, protein=null, carbs=null, fat=null, consumedAt, nameOverride } = args;

  const payload = {
    p_item_id: itemId,
    p_qty: qty,
    p_unit: unit,          // if your RPC uses 'text', cast to String(unit)
    p_name: nameOverride ?? null,
    p_grams: grams,
    p_kcal: kcal,
    p_protein: protein,
    p_carbs: carbs,
    p_fat: fat,
    p_consumed_at: consumedAt ?? new Date().toISOString().slice(0,10),
  };

  const { data, error } = await supabase.rpc("log_consumption", payload);
  if (error) throw error;
  return data;
}
