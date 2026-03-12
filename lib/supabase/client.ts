import { createBrowserClient } from "@supabase/ssr";

import { requireEnv } from "@/lib/env";

function createBrowserSupabaseClient() {
  return createBrowserClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    },
  );
}

let browserClient: ReturnType<typeof createBrowserSupabaseClient> | null = null;

export function createClient() {
  if (browserClient) {
    return browserClient;
  }

  browserClient = createBrowserSupabaseClient();

  return browserClient;
}
