// src/integrations/supabase/client.ts

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Forçando os valores para garantir a conexão e evitar problemas de cache
const SUPABASE_URL = "https://azzehubzzmsmxccbkpgk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6emVodWJ6em1zbXhjY2JrcGdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNTg1MzcsImV4cCI6MjA3NDgzNDUzN30.Mq6L7x4bH-Q3tngsSm4RRCTRcJ4RKcXFCqBQhL_ohaI";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});