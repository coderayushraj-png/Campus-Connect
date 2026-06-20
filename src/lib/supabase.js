import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || '';
export const supabaseKey = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = supabaseUrl.length > 0 && supabaseUrl !== 'https://placeholder.supabase.co';

export function createClient() {
  const url = supabaseUrl || 'https://placeholder.supabase.co';
  const key = supabaseKey || 'placeholder';
  
  if (!isSupabaseConfigured) {
    console.warn('Supabase URL or Anon Key is missing');
  }

  return createSupabaseClient(url, key);
}

export const supabase = createClient();

