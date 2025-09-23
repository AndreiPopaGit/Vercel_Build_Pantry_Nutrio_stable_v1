"use client";

import TopBar from "@/components/TopBar";
import { Column } from "@/components/Board";
import type { Item, Col, Unit } from "@/constant/items";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { fetchItems, insertItem, moveItem as moveItemDB, deleteItem as deleteItemDB, updateItem as updateItemDB } from "../../lib/pantry";

export default function Page() {
  const [items, setItems] = useState<Item[]>([]);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/auth"); return; }
      try {
        const rows = await fetchItems();
        if (mounted) setItems(rows);
      } catch (e) {
        console.error("fetch error:", e);
      } finally {
        if (mounted) setReady(true);
      }
    })();
    return () => { mounted = false; };
  }, [router]);

  const byCol = useMemo(
    () => items.reduce<Record<Col, Item[]>>(
      (acc, it) => ((acc[it.col].push(it), acc)),
      { freezer: [], fridge: [], pantry: [] }
    ),
    [items]
  );

  const patchLocal = (id: string, patch: Partial<Item>) =>
    setItems(xs => xs.map(x => x.id === id ? { ...x, ...patch } : x));
  const removeLocal = (id: string) =>
    setItems(xs => xs.filter(x => x.id !== id));

  /* ADD (persisted) */
  const addItem = async (payload: Omit<Item, "id">) => {
    const tempId = crypto.randomUUID?.() ?? String(Date.now());
    setItems(xs => [{ id: tempId, ...payload }, ...xs]);
    try {
      const saved = await insertItem(payload);
      setItems(xs => xs.map(x => x.id === tempId ? saved : x));
    } catch (e) {
      console.error("insert error:", e);
      removeLocal(tempId);
    }
  };

  /* MOVE (persisted) */
  const moveItem = async (id: string, target: Col) => {
    const prev = items.find(x => x.id === id);
    if (!prev) return;
    patchLocal(id, { col: target });
    try {
      const saved = await moveItemDB(id, target);
      patchLocal(id, { col: saved.col });
    } catch (e) {
      console.error("move error:", e);
      patchLocal(id, { col: prev.col });
    }
  };

  /* DELETE (persisted) */
  const removeItem = async (id: string) => {
    const prev = items.find(x => x.id === id);
    if (!prev) return;
    removeLocal(id);
    try {
      await deleteItemDB(id);
    } catch (e) {
      console.error("delete error:", e);
      // rollback
      setItems(xs => [prev, ...xs]);
    }
  };

  /* EDIT (persisted: qty, unit, category, subtype, expiresAt, name) */
  const saveEdit = async (id: string, patch: Partial<Item>) => {
    const prev = items.find(x => x.id === id);
    if (!prev) return;
    patchLocal(id, patch);
    try {
      const saved = await updateItemDB(id, patch);
      patchLocal(id, saved); // ensure exact DB snapshot
    } catch (e) {
      console.error("update error:", e);
      patchLocal(id, prev); // rollback
    }
  };

  const handlers = {
    onDelete: removeItem,
    onToggleUnit: (id: string, u: Unit) => saveEdit(id, { unit: u }),
    onQty: (id: string, value: number) => saveEdit(id, { quantity: value }),
    onMove: (id: string, c: Col) => void moveItem(id, c),
  };

  if (!ready) return null;

  return (
    <div className="flex h-full flex-col">
      <TopBar />
      <div className="mx-auto max-w-7xl flex-1 overflow-auto px-4 py-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Column
            title="Freezer"
            tint="blue"
            colKey="freezer"
            items={byCol.freezer}
            handlers={handlers}
            onAdd={addItem}
            onEditSave={saveEdit}
          />
          <Column
            title="Fridge"
            tint="green"
            colKey="fridge"
            items={byCol.fridge}
            handlers={handlers}
            onAdd={addItem}
            onEditSave={saveEdit}
          />
          <Column
            title="Pantry / Consumables"
            tint="orange"
            colKey="pantry"
            items={byCol.pantry}
            handlers={handlers}
            onAdd={addItem}
            onEditSave={saveEdit}
          />
        </div>
      </div>
    </div>
  );
}
