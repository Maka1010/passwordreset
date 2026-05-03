/**
 * Archivo AUTO-GENERADO por scripts/write-supabase-config.mjs — no editar en CI.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

export const SUPABASE_URL = "https://tgerndeglodizpnrvybz.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnZXJuZGVnbG9kaXpwbnJ2eWJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NzMwNzUsImV4cCI6MjA5MzM0OTA3NX0.K3sUOVzqGnDPmr8YgnByX_c7iO9YE-UJg6DFBHLmIGI";

/**
 * @returns {import('@supabase/supabase-js').SupabaseClient | null}
 */
export function getSupabaseClient() {
  const u = String(SUPABASE_URL || '').trim();
  const k = String(SUPABASE_ANON_KEY || '').trim();

  if (!u.startsWith('http') || !k) {
    console.error('[SchoolTask] Falta SUPABASE_URL o SUPABASE_ANON_KEY en la build.');
    return null;
  }

  return createClient(u, k, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  });
}
