
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zzqhgpokjrkxojkyheag.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6cWhncG9ranJreG9qa3loZWFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNTM1NzMsImV4cCI6MjA4MTcyOTU3M30.Kq4wF2akA8L9nTcjpScqcXL7CdJRSLPrd2vtfTRDy9U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
