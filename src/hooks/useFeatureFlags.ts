
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Feature, UserRole } from "@/types/auth";
import { useRoles } from "./useRoles";
import { useAuth } from "@/contexts/AuthContext";

export const useFeatureFlags = () => {
  const { user } = useAuth();
  const { userRoles } = useRoles();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Fetch all feature flags
  const { data: featureFlags = [], isLoading: isLoadingFlags } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .functions.invoke('admin-feature-flags', {
            body: {
              action: 'list'
            }
          });
            
        if (error) {
          toast.error(`Failed to fetch feature flags: ${error.message}`);
          return [];
        }
        
        return data as Feature[];
      } catch (error: any) {
        toast.error(`Failed to fetch feature flags: ${error.message}`);
        return [];
      }
    },
    enabled: !!user,
  });

  // Check if a feature flag is enabled for the current user
  const isFeatureEnabled = (flagName: string): boolean => {
    const flag = featureFlags.find(f => f.name === flagName);
    
    if (!flag) return false;
    if (!flag.is_enabled) return false;
    
    // If no roles are specified, the flag applies to everyone
    if (!flag.applies_to_roles || flag.applies_to_roles.length === 0) {
      return true;
    }
    
    // Check if the user has one of the roles the flag applies to
    return userRoles.some(userRole => 
      flag.applies_to_roles.includes(userRole.role as UserRole)
    );
  };

  // Create a new feature flag
  const createFeatureFlag = useMutation({
    mutationFn: async ({ 
      name,
      description,
      isEnabled,
      appliesToRoles
    }: { 
      name: string;
      description?: string;
      isEnabled: boolean;
      appliesToRoles: UserRole[];
    }) => {
      setLoading(true);
      
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
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      toast.success('Feature flag created successfully');
      setLoading(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create feature flag: ${error.message}`);
      setLoading(false);
    }
  });

  // Update a feature flag
  const updateFeatureFlag = useMutation({
    mutationFn: async ({ 
      id,
      name,
      description,
      isEnabled,
      appliesToRoles
    }: { 
      id: string;
      name?: string;
      description?: string;
      isEnabled?: boolean;
      appliesToRoles?: UserRole[];
    }) => {
      setLoading(true);
      
      const { data, error } = await supabase
        .functions.invoke('admin-feature-flags', {
          body: {
            action: 'update',
            id,
            name,
            description,
            is_enabled: isEnabled,
            applies_to_roles: appliesToRoles
          }
        });
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      toast.success('Feature flag updated successfully');
      setLoading(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update feature flag: ${error.message}`);
      setLoading(false);
    }
  });

  // Delete a feature flag
  const deleteFeatureFlag = useMutation({
    mutationFn: async (id: string) => {
      setLoading(true);
      const { error } = await supabase
        .functions.invoke('admin-feature-flags', {
          body: {
            action: 'delete',
            id
          }
        });
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feature-flags'] });
      toast.success('Feature flag deleted successfully');
      setLoading(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete feature flag: ${error.message}`);
      setLoading(false);
    }
  });

  return {
    featureFlags,
    isLoadingFlags,
    isFeatureEnabled,
    createFeatureFlag,
    updateFeatureFlag,
    deleteFeatureFlag,
    loading
  };
};
