// /app/page.tsx
"use client";

import TopBar from "@/components/TopBar";
import Board from "@/components/Board";
import { usePantryItems } from "@/hooks/usePantryItems";
import { useConsume } from "@/hooks/useConsume";

export default function Page() {
  const {
    ready,
    items,
    patchLocal,
    byCol,
    handlers,
    onAdd,
    onEditSave,
  } = usePantryItems();

  const { onConsume } = useConsume(items, patchLocal);

  if (!ready) return null;

  return (
    <div className="flex h-full flex-col">
      <TopBar />
      <div className="mx-auto max-w-7xl flex-1 overflow-auto px-4 py-6">
        <Board
          freezer={byCol.freezer}
          fridge={byCol.fridge}
          pantry={byCol.pantry}
          handlers={handlers}
          onAdd={onAdd}
          onEditSave={onEditSave}
          onConsume={onConsume}
        />
      </div>
    </div>
  );
}
