export { getSupabaseClient, getSupabase } from './supabase-client';
export {
  signInWithEmail,
  signUpWithEmail,
  signInWithMagicLink,
  signOut,
  getSession,
  getCurrentUser,
  onAuthStateChange,
  signInLocally,
  signOutLocally,
  getLocalUser,
  isLocalMode,
  getCurrentUserOrLocal,
} from './auth-service';
export type { AuthState, AuthResult, LocalUser } from './auth-service';
