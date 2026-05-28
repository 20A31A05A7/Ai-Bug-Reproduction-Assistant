import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config.js';

let supabaseClient: SupabaseClient | null = null;

export const initSupabase = () => {
  if (!config.supabaseUrl || !config.supabaseKey) {
    console.warn('⚠️  Supabase not configured. Using mock database.');
    return null;
  }

  try {
    supabaseClient = createClient(config.supabaseUrl, config.supabaseKey);
    console.log('✅ Supabase initialized successfully!');
    return supabaseClient;
  } catch (error) {
    console.error('❌ Failed to initialize Supabase:', error);
    console.warn('⚠️  Falling back to mock database.');
    return null;
  }
};

export const getSupabase = () => supabaseClient;

// Mock database for development (when Supabase is not configured)
export const mockDatabase = {
  bugReports: [] as any[],
  screenshots: [] as any[],
  users: [] as any[],
};
