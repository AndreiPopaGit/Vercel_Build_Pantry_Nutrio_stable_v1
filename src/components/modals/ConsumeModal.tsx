// /components/modals/ConsumeModal.tsx
"use client";

import { useState } from "react";
import type { Item, Unit } from "@/constant/items";

export default function ConsumeModal({
  item,
  onCancel,
  onConfirm,
}: {
  item: Item;
  onCancel: () => void;
  onConfirm: (qty: number, unit: Unit) => void;
}) {
  const [qty, setQty] = useState<number>(1);
  const [unit, setUnit] = useState<Unit>(item.unit ?? "pcs");

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
        <div className="mb-3 text-lg font-semibold">Consume: {item.name}</div>
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            className="w-28 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
            placeholder="Qty"
            value={qty}
            onChange={(e) => setQty(Math.max(0, Number(e.target.value) || 0))}
          />
          <select
            className="rounded-md border border-slate-300 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
            value={unit}
            onChange={(e) => setUnit(e.target.value as Unit)}
          >
            <option value="pcs">pcs</option>
            <option value="g">g</option>
          </select>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(Math.max(0, qty || 0), unit)}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
          >
            Log & Subtract
          </button>
        </div>
      </div>
    </div>
  );
}
