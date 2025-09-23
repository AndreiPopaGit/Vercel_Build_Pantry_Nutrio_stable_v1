// types/pantry.ts
export type Storage = "freezer" | "fridge" | "pantry";
export type Unit = "pcs" | "g";

export type PantryItemRow = {
  id: string;
  user_id: string;
  name: string;
  storage: Storage;
  category: string;
  subtype: string | null;
  quantity: number;     // numeric maps to number in supabase-js
  unit: Unit;
  added_at: string;     // ISO string
  updated_at: string;
  deleted_at: string | null;
};
