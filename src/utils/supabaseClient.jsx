// supabaseClient.jsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
console.log('Supabase URL:', supabaseUrl);
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey,{
    auth: {
      storage: localStorage, // 👈 session persistante dans localStorage
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  });