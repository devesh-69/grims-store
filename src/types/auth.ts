
export interface User {
  id: string;
  email: string;
  role?: UserRole;
  isAdmin?: boolean;
  roles?: UserRole[];
  avatar_url?: string;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
    [key: string]: any;
  };
}

export type UserRole = "admin" | "moderator" | "user" | "editor" | "viewer";

export interface SystemSetting {
  id: string;
  key: string;
  value: any;
  is_public: boolean;
  description?: string;
  updated_at: string;
  updated_by?: string;
}

export interface Feature {
  id: string;
  name: string;
  description?: string;
  is_enabled: boolean;
  applies_to_roles: UserRole[];
  created_at: string;
  updated_at: string;
}

export interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  context?: Record<string, any>;
  created_at: string;
}
