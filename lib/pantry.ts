// /lib/pantry.ts
import { supabase } from "./supabaseClient";
import type { Item, Col, Unit } from "@/constant/items";

/* Helpers */
function assertSession() {
  return supabase.auth.getSession().then(({ data: { session } }) => {
    if (!session) throw new Error("No session");
    return session;
  });
}

function mapRow(r: any): Item {
  return {
    id: r.id,
    name: r.name,
    quantity: Number(r.quantity),
    unit: r.unit as Unit,
    col: r.storage as Col,
    category: r.category ?? undefined,
    subtype: r.subtype ?? undefined,
    expiresAt: r.expires_at ?? undefined, // map snake -> camel
  };
}

/* Queries */
export async function fetchItems(): Promise<Item[]> {
  await assertSession();
  const { data, error } = await supabase
    .from("pantry_items")
    .select("*")
    .order("added_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapRow);
}

export async function insertItem(payload: Omit<Item, "id">): Promise<Item> {
  const session = await assertSession();
  const { data, error } = await supabase
    .from("pantry_items")
    .insert([{
      user_id: session.user.id,
      name: payload.name,
      storage: payload.col,
      category: payload.category ?? null,
      subtype:  payload.subtype  ?? null,
      quantity: payload.quantity,
      unit:     payload.unit,
      expires_at: payload.expiresAt ?? null,
    }])
    .select("*")
    .single();

  if (error || !data) throw error ?? new Error("Insert failed");
  return mapRow(data);
}

export async function moveItem(id: string, target: Col): Promise<Item> {
  await assertSession();
  const { data, error } = await supabase
    .from("pantry_items")
    .update({ storage: target })
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) throw error ?? new Error("Move failed");
  return mapRow(data);
}

export async function updateItem(id: string, patch: Partial<Item>): Promise<Item> {
  await assertSession();
  const payload: any = {};
  if (patch.name        !== undefined) payload.name = patch.name;
  if (patch.quantity    !== undefined) payload.quantity = patch.quantity;
  if (patch.unit        !== undefined) payload.unit = patch.unit;
  if (patch.col         !== undefined) payload.storage = patch.col;
  if (patch.category    !== undefined) payload.category = patch.category ?? null;
  if (patch.subtype     !== undefined) payload.subtype  = patch.subtype  ?? null;
  if (patch.expiresAt   !== undefined) payload.expires_at = patch.expiresAt ?? null;

  const { data, error } = await supabase
    .from("pantry_items")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) throw error ?? new Error("Update failed");
  return mapRow(data);
}

export async function deleteItem(id: string): Promise<void> {
  await assertSession();
  const { error } = await supabase.from("pantry_items").delete().eq("id", id);
  if (error) throw error;
}
