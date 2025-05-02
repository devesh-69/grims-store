
export interface User {
  id: string;
  email?: string;
  phone?: string;
  created_at?: string;
  last_sign_in_at?: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
  isAdmin?: boolean; // Added for compatibility with existing code
}
