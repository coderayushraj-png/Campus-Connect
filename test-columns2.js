import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { error } = await supabase.from('profiles').select('name').limit(1);
  console.log("Error name:", error?.message || 'Success');

  const { error: e2 } = await supabase.from('profiles').select('email').limit(1);
  console.log("Error email:", e2?.message || 'Success');

  const { error: e3 } = await supabase.from('profiles').select('branch').limit(1);
  console.log("Error branch:", e3?.message || 'Success');

  const { error: e4 } = await supabase.from('profiles').select('semester').limit(1);
  console.log("Error semester:", e4?.message || 'Success');
}
run();
