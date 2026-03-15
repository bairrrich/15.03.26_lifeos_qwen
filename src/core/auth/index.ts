export { getSupabaseClient, getSupabase } from './supabase-client';
export {
  signInWithMagicLink,
  signOut,
  getSession,
  getCurrentUser,
  onAuthStateChange,
} from './auth-service';
export type { AuthState } from './auth-service';
