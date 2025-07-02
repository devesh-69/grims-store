import { Database } from "@/integrations/supabase/types";
import { UserRole } from "@/types/auth";

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface UserProfile {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  status?: UserStatus;
  company?: string;
  location?: string;
  signup_source?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  roles?: import('@/types/auth').UserRole[];
  spend?: number;
  custom_attributes?: Record<string, any>;
  referral_code?: string;
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
  has_completed_profile?: boolean;
}
