// components/TopBar.tsx
"use client";

export default function TopBar() {
  return (
    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <input
              className="w-full rounded-full border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-gray-300"
              placeholder="Find items…"
            />
          </div>

          {/* Filter chips (non-functional for now) */}
          <div className="flex items-center gap-2">
            {["All", "Freezer", "Fridge", "Pantry"].map((label, i) => (
              <button
                key={label}
                className={[
                  "rounded-full px-3 py-2 border text-sm transition",
                  i === 0
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Add button */}
          <button className="rounded-full bg-emerald-600 text-white px-4 py-2 text-sm hover:opacity-90 transition">
            Add New Item
          </button>
        </div>
      </div>
    </div>
  );
}
