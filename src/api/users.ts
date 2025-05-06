
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types/auth';
import { UserProfile, FilterCriteria, UserActionResult, UserFilters } from '@/types/user';
import { Feature, SystemSetting, SystemLog } from '@/types/auth';

/**
 * Fetch all users with their profiles
 */
export const fetchAllUsers = async (): Promise<UserProfile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Map to UserProfile interface
  return data.map((profile): UserProfile => ({
    id: profile.id,
    email: '', // Will be populated from auth.users if needed
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    avatar_url: profile.avatar_url || '',
    company: profile.company || '',
    location: profile.location || '',
    signup_source: profile.signup_source || '',
    status: profile.status || 'active',
    referral_code: profile.referral_code || '',
    spend: profile.spend || 0,
    last_login: profile.last_login || '',
    created_at: profile.created_at,
    updated_at: profile.updated_at,
    custom_attributes: profile.custom_attributes || {},
    roles: [] // Will be populated separately
  }));
};

/**
 * Fetch users with their emails (admin only)
 */
export const fetchUsersWithEmails = async (): Promise<{ id: string; email: string; created_at: string }[]> => {
  const { data, error } = await supabase
    .functions.invoke('api-admin-users', {
      body: {
        action: 'get-users-with-emails'
      }
    });

  if (error) throw error;
  return (data as any) || [];
};

/**
 * Add a role to a user
 */
export const addUserRole = async (userId: string, role: UserRole): Promise<string> => {
  // First check if the user already has this role
  const { data: existingRoles, error: checkError } = await supabase
    .from('user_roles')
    .select('id')
    .eq('user_id', userId)
    .eq('role', role);
  
  if (checkError) throw checkError;
  
  if (existingRoles && existingRoles.length > 0) {
    throw new Error(`User already has the ${role} role`);
  }
  
  const { data, error } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
};

/**
 * Remove a role from a user
 */
export const removeUserRole = async (roleId: string): Promise<void> => {
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('id', roleId);

  if (error) throw error;
};

/**
 * Get roles for a specific user
 */
export const getUserRoles = async (userId: string): Promise<UserRole[]> => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);

  if (error) throw error;
  return data.map(r => r.role as UserRole);
};

/**
 * Create a feature flag
 */
export const createFeatureFlag = async (
  name: string,
  description: string | null,
  isEnabled: boolean,
  appliesToRoles: UserRole[]
): Promise<string> => {
  // Use Edge Functions to access the feature_flags table
  const { data, error } = await supabase
    .functions.invoke('admin-feature-flags', {
      body: {
        action: 'create',
        name,
        description,
        is_enabled: isEnabled,
        applies_to_roles: appliesToRoles
      }
    });

  if (error) throw error;
  return data.id;
};

/**
 * Get all feature flags
 */
export const getFeatureFlags = async (): Promise<Feature[]> => {
  // Use Edge Functions to access the feature_flags table
  const { data, error } = await supabase
    .functions.invoke('admin-feature-flags', {
      body: {
        action: 'list'
      }
    });

  if (error) throw error;
  return data as Feature[];
};

/**
 * Update a feature flag
 */
export const updateFeatureFlag = async (
  id: string,
  updates: {
    name?: string;
    description?: string | null;
    is_enabled?: boolean;
    applies_to_roles?: UserRole[];
  }
): Promise<void> => {
  // Use Edge Functions to access the feature_flags table
  const { error } = await supabase
    .functions.invoke('admin-feature-flags', {
      body: {
        action: 'update',
        id,
        ...updates
      }
    });

  if (error) throw error;
};

/**
 * Delete a feature flag
 */
export const deleteFeatureFlag = async (id: string): Promise<void> => {
  // Use Edge Functions to access the feature_flags table
  const { error } = await supabase
    .functions.invoke('admin-feature-flags', {
      body: {
        action: 'delete',
        id
      }
    });

  if (error) throw error;
};

/**
 * Check if a feature flag is enabled
 */
export const isFeatureEnabled = async (flagName: string): Promise<boolean> => {
  // Use Edge Functions to access the feature_flags table
  const { data, error } = await supabase
    .functions.invoke('admin-feature-flags', {
      body: {
        action: 'check',
        name: flagName
      }
    });

  if (error) return false;
  return data?.is_enabled || false;
};

/**
 * Create or update a system setting
 */
export const upsertSystemSetting = async (
  key: string,
  value: any,
  isPublic: boolean = false,
  description?: string
): Promise<void> => {
  // Use Edge Functions to access the system_settings table
  const { error } = await supabase
    .functions.invoke('admin-system-settings', {
      body: {
        action: 'upsert',
        key,
        value,
        is_public: isPublic,
        description
      }
    });

  if (error) throw error;
};

/**
 * Get all system settings
 */
export const getSystemSettings = async (): Promise<SystemSetting[]> => {
  // Use Edge Functions to access the system_settings table
  const { data, error } = await supabase
    .functions.invoke('admin-system-settings', {
      body: {
        action: 'list'
      }
    });

  if (error) throw error;
  return data as SystemSetting[];
};

/**
 * Get a system setting by key
 */
export const getSystemSetting = async <T = any>(key: string): Promise<T | null> => {
  // Use Edge Functions to access the system_settings table
  const { data, error } = await supabase
    .functions.invoke('admin-system-settings', {
      body: {
        action: 'get',
        key
      }
    });

  if (error || !data) return null;
  return data.value as T;
};

/**
 * Create a system log entry
 */
export const createSystemLog = async (
  level: 'info' | 'warning' | 'error' | 'debug',
  message: string,
  context?: Record<string, any>
): Promise<void> => {
  const { error } = await supabase
    .functions.invoke('admin-system-logs', {
      body: {
        action: 'create',
        level,
        message,
        context
      }
    });

  if (error) {
    // If logging fails, log to console as fallback
    console.error('Failed to write system log:', error);
    console.log(`[${level.toUpperCase()}] ${message}`, context);
  }
};
