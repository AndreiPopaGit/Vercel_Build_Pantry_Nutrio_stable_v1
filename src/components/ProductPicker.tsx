// /components/ProductPicker.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { searchProducts, type ProductListing } from "../../lib/products";

export default function ProductPicker({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (product: ProductListing) => void;
}) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [rows, setRows] = useState<ProductListing[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setRows([]);
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    let alive = true;
    const run = async () => {
      if (!q.trim()) { setRows([]); return; }
      setBusy(true);
      try {
        const data = await searchProducts(q, 12);
        if (alive) setRows(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setBusy(false);
      }
    };
    const t = setTimeout(run, 250); // debounce
    return () => { alive = false; clearTimeout(t); };
  }, [q]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 shadow-lg">
        <div className="mb-3 flex items-center gap-2">
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products…"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 outline-none focus:ring-2 focus:ring-slate-300"
          />
          <button onClick={onClose} className="rounded-md border border-slate-300 px-3 py-2 hover:bg-slate-50">
            Close
          </button>
        </div>

        {busy && <div className="text-sm text-slate-500">Searching…</div>}

        <div className="mt-2 max-h-[60vh] overflow-auto divide-y">
          {rows.map((p) => (
            <button
              key={p.id}
              onClick={() => { onPick(p); onClose(); }}
              className="w-full text-left px-2 py-3 hover:bg-slate-50"
            >
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-slate-500">
                {p.category_id || "—"} {p.description ? `• ${p.description}` : ""}
              </div>
            </button>
          ))}
          {!busy && q.trim() && rows.length === 0 && (
            <div className="px-2 py-3 text-sm text-slate-500">No products found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
