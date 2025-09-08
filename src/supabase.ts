import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables: REACT_APP_SUPABASE_URL and/or REACT_APP_SUPABASE_ANON_KEY. Please check your .env file.');
}

try {
  new URL(supabaseUrl);
} catch {
  throw new Error('Invalid REACT_APP_SUPABASE_URL. Please provide a valid URL.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
