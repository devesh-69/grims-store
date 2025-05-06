
export type UserRole = 'admin' | 'moderator' | 'user';

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    first_name?: string;
    last_name?: string;
  };
  app_metadata?: {
    provider?: string;
    [key: string]: any;
  };
  avatar_url?: string;
  isAdmin?: boolean;
  roles?: string[];
  [key: string]: any;
}

export interface Feature {
  id: string;
  name: string;
  description?: string;
  is_enabled: boolean;
  applies_to_roles: UserRole[];
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: any;
  is_public: boolean;
  description?: string;
  updated_at: string;
  updated_by?: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: any[];
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  description?: string;
  permissions: Record<string, any>;
  created_by?: string;
  created_at: string;
  expires_at?: string;
  last_used_at?: string;
  is_active: boolean;
}

export interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  message: string;
  context?: Record<string, any>;
  created_at: string;
  user_id?: string;
}
