// /components/items/ItemCard.tsx
"use client";

import type { Item, Unit, Col } from "@/constant/items";

export default function ItemCard({
  it,
  onDelete,
  onToggleUnit,
  onMove,
  onQty,
  onEditOpen,
  onConsumeOpen,
}: {
  it: Item;
  onDelete: (id: string) => void;
  onToggleUnit: (id: string, u: Unit) => void;
  onMove: (id: string, target: Col) => void;
  onQty: (id: string, value: number) => void;
  onEditOpen: () => void;
  onConsumeOpen?: () => void;
}) {
  const canMove = it.col === "freezer" || it.col === "fridge";
  const target: Col | null = it.col === "freezer" ? "fridge" : it.col === "fridge" ? "freezer" : null;
  const nextUnit: Unit = it.unit === "pcs" ? "g" : "pcs";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{it.name}</div>
          <div className="text-xs text-slate-500">
            {it.category ?? "—"} {it.subtype ? `• ${it.subtype}` : ""}
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm">
            <span>Qty</span>
            <input
              type="number"
              inputMode="numeric"
              className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-slate-300"
              value={Number.isFinite(it.quantity) ? it.quantity : 0}
              onChange={(e) => onQty(it.id, Math.max(0, Number(e.target.value) || 0))}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={onEditOpen} className="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50">
            Edit
          </button>
          <button
            onClick={() => onDelete(it.id)}
            className="rounded-md border border-rose-300 px-2 py-1 text-xs text-rose-600 hover:bg-rose-50"
          >
            Del
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={() => onToggleUnit(it.id, nextUnit)}
          className="rounded-md border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs"
          title="Toggle unit"
        >
          {it.unit}
        </button>

        <div className="flex items-center gap-2">
          {canMove && target && (
            <button
              onClick={() => onMove(it.id, target)}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
            >
              Move to {target === "fridge" ? "Fridge" : "Freezer"}
            </button>
          )}
          {onConsumeOpen && (
            <button
              onClick={onConsumeOpen}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
              title="Consume"
            >
              Consume
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
