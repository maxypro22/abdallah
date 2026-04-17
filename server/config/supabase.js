const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('🔥 Supabase credentials are missing! Check your .env file or Vercel settings.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
