import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const getSupabaseClient = (url: string, key: string): SupabaseClient => {
    return createClient(url, key);
};
