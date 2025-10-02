// /components/consumption/Totals.tsx
"use client";

import type { Totals } from "@/hooks/useTodayConsumption";

const fmt0 = (n: number) => Math.round(n).toString();

export default function TotalsGrid({ totals }: { totals: Totals }) {
  return (
    <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
      <Card label="Calories" value={`${fmt0(totals.kcal)} kcal`} />
      <Card label="Protein" value={`${fmt0(totals.protein)} g`} />
      <Card label="Carbs" value={`${fmt0(totals.carbs)} g`} />
      <Card label="Fat" value={`${fmt0(totals.fat)} g`} />
      <Card label="Total grams" value={`${fmt0(totals.grams)} g`} />
    </section>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}
