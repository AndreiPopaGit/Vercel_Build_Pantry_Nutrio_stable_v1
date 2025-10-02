// /components/modals/EditItemModal.tsx
"use client";

import { useMemo, useState } from "react";
import type { Item, Unit } from "@/constant/items";
import { CATEGORIES } from "@/constant/categories";

export default function EditItemModal({
  item,
  onCancel,
  onSave,
  subtypeOptions,
}: {
  item: Item;
  onCancel: () => void;
  onSave: (patch: Partial<Item>) => void;
  subtypeOptions: (cat: string) => string[];
}) {
  const [name, setName] = useState(item.name ?? "");
  const [qty, setQty] = useState<number>(item.quantity ?? 0);
  const [unit, setUnit] = useState<Unit>(item.unit ?? "pcs");
  const [cat, setCat] = useState<string>(item.category ?? "");
  const [sub, setSub] = useState<string>(item.subtype ?? "");

  const subs = useMemo(() => subtypeOptions(cat), [cat, subtypeOptions]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
        <div className="mb-3 text-lg font-semibold">Edit item</div>

        <div className="grid grid-cols-1 gap-3">
          <input
            className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="flex gap-2">
            <input
              type="number"
              inputMode="numeric"
              className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
              placeholder="Quantity"
              value={qty}
              onChange={(e) => setQty(Math.max(0, Number(e.target.value) || 0))}
            />
            <select
              className="w-28 rounded-md border border-slate-300 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
              value={unit}
              onChange={(e) => setUnit(e.target.value as Unit)}
            >
              <option value="pcs">pcs</option>
              <option value="g">g</option>
            </select>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs text-slate-500">Category</label>
              <select
                className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                value={cat}
                onChange={(e) => { setCat(e.target.value); setSub(""); }}
              >
                <option value="">—</option>
                {Object.keys(CATEGORIES).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs text-slate-500">Subtype</label>
              <select
                className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                value={sub}
                onChange={(e) => setSub(e.target.value)}
                disabled={!cat}
              >
                <option value="">{cat ? "Subtype…" : "Select category first"}</option>
                {subs.map((x) => (<option key={x} value={x}>{x}</option>))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={() => onSave({
              name: name.trim(),
              quantity: qty,
              unit,
              category: cat || undefined,
              subtype: sub || undefined,
            })}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:opacity-90"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
