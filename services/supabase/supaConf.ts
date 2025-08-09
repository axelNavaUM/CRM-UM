import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://nfnhfkmpvvgsdoekyxgm.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mbmhma21wdnZnc2RvZWt5eGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3OTM3MDMsImV4cCI6MjA2NTM2OTcwM30.w_aBmKhwgOd3lss35Xm8-7cVzsHfdwzNEtiYs6dIDp8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);