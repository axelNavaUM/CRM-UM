import { createClient } from '@supabase/supabase-js';
import { AuthResponse } from '@supabase/supabase-js';


export const supabase = createClient(
    'https://nfnhfkmpvvgsdoekyxgm.supabase.co', 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5mbmhma21wdnZnc2RvZWt5eGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3OTM3MDMsImV4cCI6MjA2NTM2OTcwM30.w_aBmKhwgOd3lss35Xm8-7cVzsHfdwzNEtiYs6dIDp8'
);