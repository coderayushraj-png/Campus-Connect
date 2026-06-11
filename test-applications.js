import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase
    .from('placement_applications')
    .select(`
      id,
      applied_at,
      user_id,
      profiles:user_id ( full_name, email, branch, semester )
    `)
    .limit(1);
    
  console.log("Joined data:", JSON.stringify(data, null, 2));
  console.log("Error:", error);
}
run();
