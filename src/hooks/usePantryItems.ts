// /hooks/usePantryItems.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import type { Item, Unit, Col } from "@/constant/items";
import {
  fetchItems,
  insertItem,
  updateItem,
  deleteItem,
  moveItem,
} from "../../lib/pantry";

export function usePantryItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [ready, setReady] = useState(false);

  // bootstrap
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const rows = await fetchItems();
        if (mounted) setItems(rows);
      } catch (e) {
        console.error("fetchItems error:", e);
      } finally {
        if (mounted) setReady(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // local helpers
  const patchLocal = (id: string, patch: Partial<Item>) =>
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  const removeLocal = (id: string) =>
    setItems((xs) => xs.filter((x) => x.id !== id));

  // handlers: add / move / delete / edit
  const onAdd = async (payload: Omit<Item, "id">) => {
    const tempId = crypto.randomUUID?.() ?? String(Date.now());
    setItems((xs) => [{ id: tempId, ...payload }, ...xs]);

    try {
      const saved = await insertItem(payload);
      setItems((xs) => xs.map((x) => (x.id === tempId ? saved : x)));
    } catch (e) {
      console.error("insertItem error:", e);
      removeLocal(tempId);
    }
  };

  const onMove = async (id: string, target: Col) => {
    const prev = items.find((x) => x.id === id);
    if (!prev) return;

    patchLocal(id, { col: target });
    try {
      const saved = await moveItem(id, target);
      patchLocal(id, { col: saved.col });
    } catch (e) {
      console.error("moveItem error:", e);
      patchLocal(id, { col: prev.col });
    }
  };

  const onDelete = async (id: string) => {
    const prev = items.find((x) => x.id === id);
    if (!prev) return;

    removeLocal(id);
    try {
      await deleteItem(id);
    } catch (e) {
      console.error("deleteItem error:", e);
      setItems((xs) => [prev, ...xs]);
    }
  };

  const onEditSave = async (id: string, patch: Partial<Item>) => {
    const prev = items.find((x) => x.id === id);
    if (!prev) return;

    patchLocal(id, patch);
    try {
      const saved = await updateItem(id, patch);
      patchLocal(id, saved);
    } catch (e) {
      console.error("updateItem error:", e);
      patchLocal(id, prev);
    }
  };

  const onToggleUnit = (id: string, next: Unit) => onEditSave(id, { unit: next });
  const onQty = (id: string, value: number) => onEditSave(id, { quantity: value });

  // derive by column
  const byCol = useMemo(() => {
    return items.reduce<Record<Col, Item[]>>(
      (acc, it) => {
        acc[it.col].push(it);
        return acc;
      },
      { freezer: [], fridge: [], pantry: [] }
    );
  }, [items]);

  return {
    ready,
    items,
    setItems,        // exposed in case you ever need it
    patchLocal,      // used by useConsume
    byCol,
    handlers: { onDelete, onToggleUnit, onMove, onQty },
    onAdd,
    onEditSave,
  };
}
