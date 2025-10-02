// /hooks/useTodayConsumption.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export type Unit = "pcs" | "g";

export type DailyConsumption = {
  id: string;
  user_id: string;
  item_id: string | null;
  name: string;
  quantity: number;
  unit: Unit;
  grams: number | null;
  kcal: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  consumed_at: string; // "YYYY-MM-DD"
  created_at: string;  // ISO
};

export type Totals = {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  grams: number;
};

export function useTodayConsumption() {
  const [rows, setRows] = useState<DailyConsumption[]>([]);
  const [loading, setLoading] = useState(true);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("daily_consumption")
          .select("*")
          .eq("consumed_at", today)
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (mounted && data) setRows(data as DailyConsumption[]);
      } catch (e) {
        console.error("load daily_consumption failed:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [today]);

  const totals: Totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => {
          acc.kcal += Number(r.kcal || 0);
          acc.protein += Number(r.protein || 0);
          acc.carbs += Number(r.carbs || 0);
          acc.fat += Number(r.fat || 0);
          acc.grams += Number(r.grams || 0);
          return acc;
        },
        { kcal: 0, protein: 0, carbs: 0, fat: 0, grams: 0 }
      ),
    [rows]
  );

  return { today, rows, totals, loading };
}
