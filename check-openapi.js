import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function run() {
  const response = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`);
  const data = await response.json();
  const tables = data.definitions ? Object.keys(data.definitions) : Object.keys(data.components?.schemas || {});
  console.log("Tables:", tables);
}
run();
