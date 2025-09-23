"use client";

import { ReactNode, useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

export function SupabaseSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setSession(data.session ?? null);
      setReady(true);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Expose session on window for quick debugging (optional)
  if (typeof window !== "undefined") (window as any).__supabaseSession = session;

  // Render children once we've checked session at least once
  return ready ? <>{children}</> : null;
}
