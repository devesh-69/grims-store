
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserRole } from '@/types/auth';
import { addUserRole, removeUserRole, getUserRoles } from '@/api/users';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserRoleData {
  id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
}

export const useRoles = () => {
  const queryClient = useQueryClient();

  // Fetch all user roles
  const { data: userRoles = [], isLoading, error } = useQuery({
    queryKey: ['userRoles'],
    queryFn: async (): Promise<UserRoleData[]> => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserRoleData[];
    }
  });

  // Add role mutation
  const addRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) => 
      addUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userRoles'] });
      toast.success('Role added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add role: ${error.message}`);
    }
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: removeUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userRoles'] });
      toast.success('Role removed successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove role: ${error.message}`);
    }
  });

  // Get roles for specific user
  const getUserRolesQuery = (userId: string) => useQuery({
    queryKey: ['userRoles', userId],
    queryFn: () => getUserRoles(userId),
    enabled: !!userId
  });

  // Assign role directly via Supabase
  const assignRole = async (userId: string, role: UserRole) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role as "admin" | "moderator" | "user" | "editor" | "viewer"
        })
        .select()
        .single();

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['userRoles'] });
      toast.success('Role assigned successfully');
      return data;
    } catch (error: any) {
      toast.error(`Failed to assign role: ${error.message}`);
      throw error;
    }
  };

  return {
    userRoles,
    isLoading,
    error,
    addRole: addRoleMutation.mutate,
    removeRole: removeRoleMutation.mutate,
    getUserRoles: getUserRolesQuery,
    assignRole,
    isAddingRole: addRoleMutation.isPending,
    isRemovingRole: removeRoleMutation.isPending
  };
};
