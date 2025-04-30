
import { Database } from "@/integrations/supabase/types";

export type UserRole = "admin" | "moderator" | "user";

export interface UserProfile {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  company?: string;
  location?: string;
  signup_source?: string;
  status?: string;
  referral_code?: string;
  spend?: number;
  last_login?: string;
  created_at: string;
  updated_at: string;
  custom_attributes?: Record<string, any>;
  roles: UserRole[];
}

export interface SavedSegment {
  id: string;
  name: string;
  description?: string;
  filter_criteria: FilterCriteria;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export type FilterCriteriaValue = string | number | boolean | string[] | number[] | null;

export interface FilterCriterion {
  field: string;
  operator: "equals" | "not_equals" | "contains" | "not_contains" | "greater_than" | "less_than" | "in" | "not_in" | "is_null" | "is_not_null";
  value?: FilterCriteriaValue;
}

export interface FilterCriteria {
  conditions: FilterCriterion[];
  conjunction: "and" | "or";
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_email?: string; // For display purposes, join with auth.users
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  content?: string;
  type: string;
  is_read: boolean;
  data?: Record<string, any>;
  created_at: string;
}

export interface UserActionResult {
  success: boolean;
  message: string;
  count?: number;
  affected_ids?: string[];
  error?: any;
}

export interface UserFilters {
  roles?: string[];
  status?: string[];
  location?: string;
  signup_source?: string[];
  created_after?: string;
  created_before?: string;
  last_active_after?: string;
  search?: string;
  min_spend?: number;
  has_completed_profile?: boolean;
}
