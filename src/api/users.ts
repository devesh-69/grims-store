import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types/auth';

/**
 * Fetch all users from the database
 */
export const fetchAllUsers = async (): Promise<User[]> => {
  const { data: users, error } = await supabase
    .from('users')
    .select('*');

  if (error) {
    throw new Error(`Error fetching users: ${error.message}`);
  }

  return users || [];
};

/**
 * Fetch a single user by ID
 */
export const fetchUserById = async (id: string): Promise<User> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Error fetching user: ${error.message}`);
  }

  return data;
};

/**
 * Update user metadata
 */
export const updateUserMetadata = async (id: string, data: any): Promise<User> => {
  const metadata = typeof data === 'object' && data !== null ? data as Record<string, any> : {};

  const { data: user, error } = await supabase.auth.admin.updateUserById(
    id,
    { user_metadata: metadata }
  );

  if (error) {
    throw new Error(`Error updating user metadata: ${error.message}`);
  }

  return user.user;
};

/**
 * Delete a user
 */
export const deleteUser = async (id: string): Promise<void> => {
  const { error } = await supabase.auth.admin.deleteUser(id);

  if (error) {
    throw new Error(`Error deleting user: ${error.message}`);
  }
};

/**
 * Assign a role to a user
 */
export const assignUserRole = async (id: string, role: string): Promise<void> => {
  // First check if the user already has this role
  const { data: existingRoles, error: fetchError } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', id)
    .eq('role', role);

  if (fetchError) {
    throw new Error(`Error checking user roles: ${fetchError.message}`);
  }

  // If the user doesn't have this role yet, assign it
  if (!existingRoles || existingRoles.length === 0) {
    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: id, role: role as "admin" | "moderator" | "user" | "editor" | "viewer" });

    if (error) {
      throw new Error(`Error assigning role: ${error.message}`);
    }
  }
};

/**
 * Remove a role from a user
 */
export const removeUserRole = async (id: string, role: string): Promise<void> => {
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', id)
    .eq('role', role);

  if (error) {
    throw new Error(`Error removing role: ${error.message}`);
  }
};

/**
 * Fetch all roles for a user
 */
export const fetchUserRoles = async (id: string): Promise<UserRole[]> => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', id);

  if (error) {
    throw new Error(`Error fetching user roles: ${error.message}`);
  }

  return (data || []).map(r => r.role);
};
