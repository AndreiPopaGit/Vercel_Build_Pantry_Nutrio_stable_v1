// /components/consumption/FoodRow.tsx
"use client";

import type { DailyConsumption } from "@/hooks/useTodayConsumption";

const fmt0 = (n: number | null | undefined) =>
  Number.isFinite(Number(n)) ? Math.round(Number(n as number)).toString() : "0";
const fmt1 = (n: number | null | undefined) =>
  Number.isFinite(Number(n)) ? Number(n as number).toFixed(1) : "0.0";

export default function FoodRow({ row }: { row: DailyConsumption }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold">{row.name}</div>
        <div className="text-xs text-slate-500">
          {fmt1(row.quantity)} {row.unit}
          {row.grams ? <> • {fmt0(row.grams)} g</> : null}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs md:text-sm">
        <Badge strong>{fmt0(row.kcal)} kcal</Badge>
        <Badge>P {fmt1(row.protein)} g</Badge>
        <Badge>C {fmt1(row.carbs)} g</Badge>
        <Badge>F {fmt1(row.fat)} g</Badge>
      </div>
    </div>
  );
}

function Badge({ children, strong = false }: { children: React.ReactNode; strong?: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-1 ${
        strong
          ? "bg-indigo-600 text-white"
          : "border border-slate-200 bg-slate-50 text-slate-700"
      }`}
    >
      {children}
    </span>
  );
}
