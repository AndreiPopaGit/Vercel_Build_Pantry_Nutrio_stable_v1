// /constant/items.ts
export type Unit = "pcs" | "g";
export type Col  = "freezer" | "fridge" | "pantry";

export type Item = {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  col: Col;                 // storage place
  category?: string;
  subtype?: string;
  // NEW (optional): ISO timestamp string (e.g. "2025-09-21T00:00:00.000Z") or undefined
  expiresAt?: string;
};
