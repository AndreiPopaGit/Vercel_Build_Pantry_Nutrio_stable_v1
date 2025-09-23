// components/Sidebar.tsx
"use client";

import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/auth");
  };

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-transparent">
      <div className="p-4">
        <div className="text-xl font-semibold mb-6">🍞 Pantry</div>

        <nav className="space-y-2">
          <Link href="#" className="block rounded-xl px-3 py-2 hover:bg-gray-100 transition">
            Dashboard
          </Link>
          <Link href="#" className="block rounded-xl px-3 py-2 hover:bg-gray-100 transition">
            Freezer
          </Link>
          <Link href="#" className="block rounded-xl px-3 py-2 hover:bg-gray-100 transition">
            Fridge
          </Link>
          <Link href="#" className="block rounded-xl px-3 py-2 hover:bg-gray-100 transition">
            Pantry
          </Link>

          <div className="h-4" />

          <Link
            href="#"
            className="block rounded-xl px-3 py-2 bg-gray-900 text-white text-center hover:opacity-90 transition"
          >
            + Add Item
          </Link>

          <div className="h-8" />

          <button
            onClick={signOut}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-left hover:bg-slate-50"
          >
            Sign out
          </button>
        </nav>
      </div>
    </aside>
  );
}
