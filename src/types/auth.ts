
import { User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'moderator' | 'user' | 'editor' | 'viewer';

export interface User extends SupabaseUser {
  isAdmin: boolean;
  roles?: UserRole[];
  avatar_url?: string;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
}

export interface SystemSetting {
  id: string;
  key: string;
  value: any;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface Feature {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  metadata: Record<string, any>;
  created_at: string;
  user_id?: string;
}
