// /components/add/AddItemForm.tsx
"use client";

import { useMemo, useState } from "react";
import type { Item, Unit, Col } from "@/constant/items";
import { CATEGORIES } from "@/constant/categories";
import ProductPicker from "@/components/ProductPicker";

export default function AddItemForm({
  defaultCol,
  subtypeOptions,
  onCancel,
  onSubmit,
}: {
  defaultCol: Col;
  subtypeOptions: (cat: string) => string[];
  onCancel: () => void;
  onSubmit: (payload: Omit<Item, "id">) => void;
}) {
  const [name, setName] = useState("");
  const [qty, setQty] = useState<number>(1);
  const [unit, setUnit] = useState<Unit>("pcs");
  const [cat, setCat] = useState<string>("");
  const [sub, setSub] = useState<string>("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const subs = useMemo(() => subtypeOptions(cat), [cat, subtypeOptions]);

  const submit = () => {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      quantity: qty,
      unit,
      col: defaultCol,
      category: cat || undefined,
      subtype: sub || undefined,
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="md:col-span-2 flex items-center gap-2">
          <input
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="whitespace-nowrap rounded-md border border-slate-300 bg-white px-2 py-2 text-sm hover:bg-slate-50"
            title="Pick from shop"
          >
            Pick from shop
          </button>
        </div>

        <div>
          <label className="mb-1 block text-xs text-slate-500">Quantity</label>
          <input
            type="number"
            inputMode="numeric"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
            value={qty}
            onChange={(e) => setQty(Math.max(0, Number(e.target.value) || 0))}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-slate-500">Unit</label>
          <select
            className="w-full rounded-md border border-slate-300 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
            value={unit}
            onChange={(e) => setUnit(e.target.value as Unit)}
          >
            <option value="pcs">pcs</option>
            <option value="g">g</option>
          </select>
        </div>

        <div>
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

        <div>
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

        <div className="md:col-span-2 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={submit} className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:opacity-90">
            Add Item
          </button>
        </div>
      </div>

      {/* ProductPicker dialog */}
      <ProductPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(product) => {
          setName(product.name);
          // You can map category/subtype from product here if you have logic for it
          setPickerOpen(false);
        }}
      />
    </>
  );
}
