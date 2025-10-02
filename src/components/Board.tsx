// /components/Board.tsx
"use client";

import type { Item, Unit, Col } from "@/constant/items";
import Column from "@/components/Column";

export type Handlers = {
  onDelete: (id: string) => void;
  onToggleUnit: (id: string, u: Unit) => void;
  onMove: (id: string, target: Col) => void;
  onQty: (id: string, value: number) => void;
};

export default function Board({
  freezer,
  fridge,
  pantry,
  handlers,
  onAdd,
  onEditSave,
  onConsume,
}: {
  freezer: Item[];
  fridge: Item[];
  pantry: Item[];
  handlers: Handlers;
  onAdd: (payload: Omit<Item, "id">) => void;
  onEditSave: (id: string, patch: Partial<Item>) => void;
  onConsume?: (id: string, qty: number, unit?: Unit) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Column title="Freezer" tint="blue" colKey="freezer" items={freezer} handlers={handlers} onAdd={onAdd} onEditSave={onEditSave} onConsume={onConsume} />
      <Column title="Fridge"  tint="green" colKey="fridge" items={fridge} handlers={handlers} onAdd={onAdd} onEditSave={onEditSave} onConsume={onConsume} />
      <Column title="Pantry / Consumables" tint="orange" colKey="pantry" items={pantry} handlers={handlers} onAdd={onAdd} onEditSave={onEditSave} onConsume={onConsume} />
    </div>
  );
}
