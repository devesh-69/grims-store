
import { User as SupabaseUser } from '@supabase/supabase-js';

// Extend the Supabase User type with additional properties
export interface User extends SupabaseUser {
  isAdmin?: boolean;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserRegistration {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
