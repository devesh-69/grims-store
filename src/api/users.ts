
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/hooks/useRoles';
import { UserProfile, FilterCriteria, UserActionResult, UserFilters } from '@/types/user';

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
    email: profile.email || '',
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
    .rpc('get_users_with_emails');

  if (error) throw error;
  return data;
};

/**
 * Add a role to a user
 */
export const addUserRole = async (userId: string, role: UserRole): Promise<string> => {
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
  return data.map(r => r.role) as UserRole[];
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
  const { data, error } = await supabase
    .from('feature_flags')
    .insert({
      name,
      description,
      is_enabled: isEnabled,
      applies_to_roles: appliesToRoles
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
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
  const { error } = await supabase
    .from('feature_flags')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
};

/**
 * Delete a feature flag
 */
export const deleteFeatureFlag = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('feature_flags')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

/**
 * Check if a feature flag is enabled
 */
export const isFeatureEnabled = async (flagName: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('feature_flags')
    .select('is_enabled')
    .eq('name', flagName)
    .single();

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
  // Check if setting exists
  const { data: existingSetting } = await supabase
    .from('system_settings')
    .select('id')
    .eq('key', key)
    .maybeSingle();

  if (existingSetting) {
    // Update
    const { error } = await supabase
      .from('system_settings')
      .update({
        value,
        is_public: isPublic,
        description
      })
      .eq('id', existingSetting.id);

    if (error) throw error;
  } else {
    // Insert
    const { error } = await supabase
      .from('system_settings')
      .insert({
        key,
        value,
        is_public: isPublic,
        description
      });

    if (error) throw error;
  }
};

/**
 * Get a system setting by key
 */
export const getSystemSetting = async <T = any>(key: string): Promise<T | null> => {
  const { data, error } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();

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
    .from('system_logs')
    .insert({
      level,
      message,
      context
    });

  if (error) {
    // If logging fails, log to console as fallback
    console.error('Failed to write system log:', error);
    console.log(`[${level.toUpperCase()}] ${message}`, context);
  }
};
