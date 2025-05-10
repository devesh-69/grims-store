
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/auth";

interface RoleAssignment {
  id: string;
  userId: string;
  role: UserRole;
  createdAt: string;
}

export const useRoles = (userId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  
  const currentUserId = userId || user?.id;

  // Fetch roles for a specific user
  const { data: userRoles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: ['user-roles', currentUserId],
    queryFn: async () => {
      if (!currentUserId) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('id, user_id, role, created_at')
        .eq('user_id', currentUserId);
        
      if (error) {
        toast.error(`Failed to fetch roles: ${error.message}`);
        return [];
      }
      
      return data.map(role => ({
        id: role.id,
        userId: role.user_id,
        role: role.role as UserRole,
        createdAt: role.created_at
      }));
    },
    enabled: !!currentUserId,
  });

  // Check if user has a specific role
  const hasRole = useCallback((role: UserRole) => {
    return userRoles.some(r => r.role === role);
  }, [userRoles]);

  // Assign a role to a user
  const assignRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: UserRole }) => {
      setLoading(true);
      
      // First check if the user already has this role
      const { data: existingRoles, error: checkError } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role', role.toString());
        
      if (checkError) throw checkError;
      
      if (existingRoles && existingRoles.length > 0) {
        throw new Error(`User already has the ${role} role`);
      }
      
      // Convert UserRole to string to match the database schema
      const { data, error } = await supabase
        .from('user_roles')
        .insert({ 
          user_id: userId, 
          role: role.toString() 
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast.success('Role assigned successfully');
      setLoading(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign role: ${error.message}`);
      setLoading(false);
    }
  });

  // Remove a role from a user
  const removeRole = useMutation({
    mutationFn: async (roleId: string) => {
      setLoading(true);
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-roles'] });
      toast.success('Role removed successfully');
      setLoading(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove role: ${error.message}`);
      setLoading(false);
    }
  });

  return {
    userRoles,
    isLoadingRoles,
    hasRole,
    assignRole,
    removeRole,
    loading
  };
};

// Export type to fix the isolatedModules error
export type { UserRole };
