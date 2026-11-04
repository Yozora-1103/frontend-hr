"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";

let supabaseClient: ReturnType<typeof createBrowserClient> | undefined;

export function createSupabaseBrowserClient() {
  if (supabaseClient) return supabaseClient;

  const { url, publishableKey } = getSupabaseConfig();
  supabaseClient = createBrowserClient(url, publishableKey);
  return supabaseClient;
}
