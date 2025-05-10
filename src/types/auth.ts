
export interface User {
  id: string;
  email: string;
  role?: UserRole;
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
