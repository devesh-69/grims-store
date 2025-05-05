
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
  [key: string]: any;
}
