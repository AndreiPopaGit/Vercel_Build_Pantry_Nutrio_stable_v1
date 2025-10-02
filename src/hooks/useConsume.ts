// /hooks/useConsume.ts
"use client";

import { supabase } from "../../lib/supabaseClient";
import type { Item, Unit } from "@/constant/items";

// coerce null/undefined/NaN -> 0
const z = (n: number | null | undefined) =>
  Number.isFinite(Number(n)) ? Number(n) : 0;

export function useConsume(items: Item[], patchLocal: (id: string, patch: Partial<Item>) => void) {
  const onConsume = async (id: string, qty: number, unit?: Unit) => {
    const it = items.find((x) => x.id === id);
    if (!it) return;
    if (qty <= 0) return;

    const useUnit: Unit = unit ?? it.unit;
    const newQty = Math.max(0, (it.quantity ?? 0) - qty);

    try {
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();
      if (authErr) throw authErr;
      if (!user) throw new Error("Not authenticated");

      // 1) Insert into daily_consumption (today only)
      const { data: inserted, error: insErr } = await supabase
        .from("daily_consumption")
        .insert([
          {
            user_id: user.id,
            item_id: it.id,
            name: it.name,
            quantity: qty,
            unit: useUnit,                 // 'pcs' | 'g'
            grams: useUnit === "g" ? qty : 0,
            kcal: z(null),
            protein: z(null),
            carbs: z(null),
            fat: z(null),
            consumed_at: new Date().toISOString().slice(0, 10),
          },
        ])
        .select("id")
        .single();

      if (insErr) {
        console.error("daily_consumption insert failed:", insErr);
        alert(insErr.message || "Failed to log consumption.");
        return;
      }

      // 2) Update pantry_items.quantity
      const { data: updatedItem, error: updErr } = await supabase
        .from("pantry_items")
        .update({
          quantity: newQty,
          updated_at: new Date().toISOString(),
        })
        .eq("id", it.id)
        .eq("user_id", user.id)
        .select("id, quantity")
        .single();

      if (updErr) {
        // rollback insert if update fails
        await supabase.from("daily_consumption").delete().eq("id", inserted.id);
        console.error("pantry_items update failed:", updErr);
        alert(updErr.message || "Failed to update item quantity.");
        return;
      }

      // 3) Optimistic local update
      patchLocal(it.id, { quantity: updatedItem?.quantity ?? newQty });
    } catch (e: any) {
      console.error("onConsume error:", {
        message: e?.message,
        details: e?.details,
        hint: e?.hint,
        code: e?.code,
      });
      alert(e?.message || "Failed to log consumption. Please try again.");
    }
  };

  return { onConsume };
}
