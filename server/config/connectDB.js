import { createClient } from '@supabase/supabase-js';
import { supabaseUrl, supabaseKey } from '../config/supabase.js';

export const supabase = createClient(supabaseUrl, supabaseKey);


