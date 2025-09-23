// /components/Board.tsx
"use client";

import { useMemo, useState } from "react";
import type { Item, Unit, Col } from "@/constant/items";
import { CATEGORIES } from "@/constant/categories";
import ProductPicker from "@/components/ProductPicker";
import { inferCategorySubtypeFromProduct } from "../../lib/categoryMap";

/* ---------- Item card ---------- */
export function ItemCard({
  it,
  onDelete,
  onToggleUnit,
  onMove,
  onQty,
  onEditOpen,
}: {
  it: Item;
  onDelete: (id: string) => void;
  onToggleUnit: (id: string, u: Unit) => void;
  onMove: (id: string, target: Col) => void;
  onQty: (id: string, value: number) => void;
  onEditOpen: (it: Item) => void;
}) {
  const canMove = it.col !== "pantry";
  const target = it.col === "freezer" ? "fridge" : it.col === "fridge" ? "freezer" : null;
  const nextUnit: Unit = it.unit === "pcs" ? "g" : "pcs";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium truncate">{it.name}</div>
          <div className="mt-1 text-xs text-slate-500">
            {it.category && it.subtype ? `${it.category} • ${it.subtype}` : it.category || ""}
            {it.expiresAt && (
              <span className="ml-2 text-xs text-amber-700">
                • EXP: {new Date(it.expiresAt).toLocaleDateString()}
              </span>
            )}
          </div>

          <div className="mt-2 flex items-center gap-2 text-sm text-slate-700">
            <span>Qty:</span>
            <input
              type="number"
              inputMode="numeric"
              className="w-24 rounded-md border border-slate-300 bg-white px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-slate-300"
              value={Number.isFinite(it.quantity) ? it.quantity : 0}
              onChange={(e) => onQty(it.id, Math.max(0, Number(e.target.value) || 0))}
            />
            <span className="uppercase font-semibold">{it.unit}</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <button
            onClick={() => onEditOpen(it)}
            className="rounded-md border border-slate-300 px-2 py-1 text-sm hover:bg-slate-50"
            title="Edit"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(it.id)}
            className="rounded-md border border-slate-300 px-2 py-1 text-sm hover:bg-slate-50"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={() => onToggleUnit(it.id, nextUnit)}
          className="relative inline-flex h-7 w-24 items-center rounded-full border border-slate-300 bg-slate-100 px-1 text-xs"
          title="Toggle unit"
        >
          <span
            className={`absolute h-6 w-11 rounded-full bg-white shadow transition-transform ${it.unit === "pcs" ? "translate-x-0" : "translate-x-[44px]"
              }`}
          />
          <span className={`z-10 w-1/2 text-center ${it.unit === "pcs" ? "font-semibold" : "text-slate-500"}`}>
            pcs
          </span>
          <span className={`z-10 w-1/2 text-center ${it.unit === "g" ? "font-semibold" : "text-slate-500"}`}>
            g
          </span>
        </button>

        {canMove && target && (
          <button
            onClick={() => onMove(it.id, target)}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
          >
            Move to {target === "fridge" ? "Fridge" : "Freezer"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- Column with Add + Edit modal + Product Picker ---------- */

export function Column({
  title,
  tint,
  colKey,
  items,
  handlers,
  onAdd,
  onEditSave,
}: {
  title: string;
  tint: "blue" | "green" | "orange";
  colKey: Col;
  items: Item[];
  handlers: {
    onDelete: (id: string) => void;
    onToggleUnit: (id: string, u: Unit) => void;
    onMove: (id: string, target: Col) => void;
    onQty: (id: string, value: number) => void;
  };
  onAdd: (payload: Omit<Item, "id">) => void;
  onEditSave: (id: string, patch: Partial<Item>) => void;
}) {
  const tintBg = { blue: "bg-blue-50", green: "bg-emerald-50", orange: "bg-orange-50" }[tint];

  /* Add form state (storage is locked by colKey) */
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [qty, setQty] = useState<number>(1);
  const [unit, setUnit] = useState<Unit>("pcs");
  const [cat, setCat] = useState<string>("");
  const subtypes = useMemo(() => (cat ? CATEGORIES[cat] ?? [] : []), [cat]);
  const [sub, setSub] = useState<string>("");
  const [exp, setExp] = useState<string>(""); // YYYY-MM-DD

  // Product picker dialog
  const [pickerOpen, setPickerOpen] = useState(false);

  const reset = () => { setName(""); setQty(1); setUnit("pcs"); setCat(""); setSub(""); setExp(""); };

  const submit = () => {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      quantity: qty,
      unit,
      col: colKey,
      category: cat || undefined,
      subtype: sub || undefined,
      expiresAt: exp ? new Date(exp).toISOString() : undefined,
    });
    reset(); setOpen(false);
  };

  /* Edit modal state */
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [eName, setEName] = useState("");
  const [eQty, setEQty] = useState<number>(1);
  const [eUnit, setEUnit] = useState<Unit>("pcs");
  const [eCat, setECat] = useState<string>("");
  const eSubtypes = useMemo(() => (eCat ? CATEGORIES[eCat] ?? [] : []), [eCat]);
  const [eSub, setESub] = useState<string>("");
  const [eExp, setEExp] = useState<string>("");

  const openEdit = (it: Item) => {
    setEditId(it.id);
    setEName(it.name);
    setEQty(it.quantity);
    setEUnit(it.unit);
    setECat(it.category ?? "");
    setESub(it.subtype ?? "");
    setEExp(it.expiresAt ? new Date(it.expiresAt).toISOString().slice(0, 10) : "");
    setEditOpen(true);
  };

  const saveEdit = () => {
    if (!editId) return;
    onEditSave(editId, {
      name: eName.trim(),
      quantity: eQty,
      unit: eUnit,
      category: eCat || undefined,
      subtype: eSub || undefined,
      expiresAt: eExp ? new Date(eExp).toISOString() : undefined,
    });
    setEditOpen(false);
  };

  return (
    <section className="min-w-[320px] w-full">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <header className={`flex items-center justify-between px-4 py-3 text-sm font-semibold ${tintBg}`}>
          <span>{title}</span>
          <button
            onClick={() => setOpen(v => !v)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs hover:bg-slate-50"
          >
            {open ? "Close" : "+ Add"}
          </button>
        </header>

        {open && (
          <div className="border-b border-slate-200 p-4">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {/* Name + Pick from shop */}
              <div className="flex items-center gap-2 md:col-span-2">
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

              <select
                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                value={cat}
                onChange={(e) => { setCat(e.target.value); setSub(""); }}
              >
                <option value="">Category…</option>
                {Object.keys(CATEGORIES).map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>

              <select
                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                value={sub}
                onChange={(e) => setSub(e.target.value)}
                disabled={!cat}
              >
                <option value="">{cat ? "Subtype…" : "Select category first"}</option>
                {subtypes.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>

              <input
                type="date"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                value={exp}
                onChange={(e) => setExp(e.target.value)}
              />
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <button onClick={() => { reset(); setOpen(false); }} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={submit} className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:opacity-90">
                Add Item
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3 p-4">
          {items.length ? (
            items.map((it) => (
              <ItemCard
                key={it.id}
                it={it}
                onDelete={handlers.onDelete}
                onToggleUnit={handlers.onToggleUnit}
                onMove={handlers.onMove}
                onQty={handlers.onQty}
                onEditOpen={openEdit}
              />
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
              Empty
            </div>
          )}
        </div>
      </div>

      {/* Product picker (Add form) */}
      <ProductPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(p) => {
          setName(p.name);
          const mapped = inferCategorySubtypeFromProduct(p.name, p.category_id ?? undefined);
          setCat(mapped.category ?? "");
          setSub(mapped.subtype ?? "");
        }}
      />

      {/* Edit modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-lg">
            <div className="mb-3 text-lg font-semibold">Edit item</div>

            <div className="grid grid-cols-1 gap-3">
              <input
                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="Name"
                value={eName}
                onChange={(e) => setEName(e.target.value)}
              />

              <div className="flex gap-2">
                <input
                  type="number"
                  inputMode="numeric"
                  className="w-28 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  placeholder="Qty"
                  value={eQty}
                  onChange={(e) => setEQty(Math.max(0, Number(e.target.value) || 0))}
                />
                <select
                  className="rounded-md border border-slate-300 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                  value={eUnit}
                  onChange={(e) => setEUnit(e.target.value as Unit)}
                >
                  <option value="pcs">pcs</option>
                  <option value="g">g</option>
                </select>
              </div>

              <select
                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                value={eCat}
                onChange={(e) => { setECat(e.target.value); setESub(""); }}
              >
                <option value="">Category…</option>
                {Object.keys(CATEGORIES).map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>

              <select
                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                value={eSub}
                onChange={(e) => setESub(e.target.value)}
                disabled={!eCat}
              >
                <option value="">{eCat ? "Subtype…" : "Select category first"}</option>
                {eSubtypes.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>

              <input
                type="date"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                value={eExp}
                onChange={(e) => setEExp(e.target.value)}
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setEditOpen(false)} className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={saveEdit} className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:opacity-90">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
