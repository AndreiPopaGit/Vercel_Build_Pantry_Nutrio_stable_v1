import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { SupabaseSessionProvider } from "./providers/SupabaseSessionProvider";

export const metadata: Metadata = {
  title: "Pantry App",
  description: "Inventory layout scaffold",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="h-dvh bg-slate-50 text-slate-900">
        <SupabaseSessionProvider>
          <div className="flex h-dvh">
            <Sidebar />
            <div className="w-px bg-slate-200" />
            <main className="flex-1 overflow-hidden bg-slate-50">{children}</main>
          </div>
        </SupabaseSessionProvider>
      </body>
    </html>
  );
}
