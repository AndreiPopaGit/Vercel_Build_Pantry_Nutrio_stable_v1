// /components/Column.tsx
"use client";

import { useMemo, useState } from "react";
import type { Item, Unit, Col } from "@/constant/items";
import { CATEGORIES } from "@/constant/categories";
import type { Handlers } from "@/components/Board";
import ItemCard from "../components/ItemCard";
import EditItemModal from "../components/modals/EditItemModal";
import ConsumeModal from "../components/modals/ConsumeModal";
import AddItemForm from "../components/add/AddItemForm";

export default function Column({
  title,
  tint,
  colKey,
  items,
  handlers,
  onAdd,
  onEditSave,
  onConsume,
}: {
  title: string;
  tint: "blue" | "green" | "orange";
  colKey: Col;
  items: Item[];
  handlers: Handlers;
  onAdd: (payload: Omit<Item, "id">) => void;
  onEditSave: (id: string, patch: Partial<Item>) => void;
  onConsume?: (id: string, qty: number, unit?: Unit) => void;
}) {
  // Add form
  const [addOpen, setAddOpen] = useState(false);

  // Edit modal
  const [editing, setEditing] = useState<Item | null>(null);

  // Consume modal
  const [consuming, setConsuming] = useState<Item | null>(null);

  const tintBorder =
    tint === "blue" ? "border-blue-200" : tint === "green" ? "border-emerald-200" : "border-amber-200";
  const headerDot =
    tint === "blue" ? "bg-blue-500" : tint === "green" ? "bg-emerald-500" : "bg-amber-500";

  const subtypeOptions = useMemo(() => (cat: string) => (cat ? CATEGORIES[cat] ?? [] : []), []);

  return (
    <section className="min-w-[320px] w-full">
      <div className={`rounded-2xl border ${tintBorder} bg-slate-50`}>
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className={`inline-block h-2 w-2 rounded-full ${headerDot}`} />
            <h2 className="text-sm font-semibold">{title}</h2>
            <span className="text-xs text-slate-500">({items.length})</span>
          </div>
          <button
            onClick={() => setAddOpen((v) => !v)}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs hover:bg-slate-50"
          >
            {addOpen ? "Close" : "+ Add"}
          </button>
        </div>

        {addOpen && (
          <div className="border-b border-slate-200 p-4">
            <AddItemForm
              defaultCol={colKey}
              subtypeOptions={subtypeOptions}
              onCancel={() => setAddOpen(false)}
              onSubmit={(payload) => {
                onAdd(payload);
                setAddOpen(false);
              }}
            />
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
                onEditOpen={() => setEditing(it)}
                onConsumeOpen={onConsume ? () => setConsuming(it) : undefined}
              />
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
              Empty
            </div>
          )}
        </div>
      </div>

      {/* Edit */}
      {editing && (
        <EditItemModal
          item={editing}
          subtypeOptions={subtypeOptions}
          onCancel={() => setEditing(null)}
          onSave={(patch) => {
            onEditSave(editing.id, patch);
            setEditing(null);
          }}
        />
      )}

      {/* Consume */}
      {consuming && onConsume && (
        <ConsumeModal
          item={consuming}
          onCancel={() => setConsuming(null)}
          onConfirm={(q, u) => {
            onConsume(consuming.id, q, u);
            setConsuming(null);
          }}
        />
      )}
    </section>
  );
}
