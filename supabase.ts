
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ddajppblognpqxrmeglp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkYWpwcGJsb2ducHF4cm1lZ2xwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3ODQwOTgsImV4cCI6MjA4NjM2MDA5OH0.k4iRui0utOwjBz1eq3x0TVyXOuFWXMDObkHuPiZ6sog';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const checkConnection = async () => {
  try {
    const { data, error } = await supabase.from('school_settings').select('count').limit(1);
    return !error;
  } catch (e) {
    return false;
  }
};
