import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function run() {
  const response = await fetch(`${supabaseUrl}/rest/v1/?apikey=${supabaseKey}`);
  const data = await response.json();
  const profilesSchema = data.definitions ? data.definitions.profiles : data.components?.schemas?.profiles;
  console.log("Profiles schema:", JSON.stringify(profilesSchema, null, 2));
}
run();
