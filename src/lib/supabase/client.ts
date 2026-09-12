import { createClient } from '@supabase/supabase-js';

// Default to user's verified Supabase project if environment variables are not set in Vercel
export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://gdjuriivjkdzxkawdkxb.supabase.co';

export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkanVyaWl2amtkenhrYXdka3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMDg3OTEsImV4cCI6MjA4MzU4NDc5MX0.f1bTuKfJdhMzBJp82QQ0gar5BG1u4_BACHIzH8UkvHo';

export const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkanVyaWl2amtkenhrYXdka3hiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODAwODc5MSwiZXhwIjoyMDgzNTg0NzkxfQ.z8tHMQVZCrXZAb-OF-NOqd8E2yK8YK1K7n5JFhlt-EQ';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
