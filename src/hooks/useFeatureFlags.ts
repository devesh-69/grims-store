
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "./useRoles";

interface FeatureFlag {
  id: string;
  name: string;
  description?: string;
  isEnabled: boolean;
  appliesToRoles: UserRole[];
  createdAt: string;
  updatedAt: string;
}

export const useFeatureFlags = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Fetch all feature flags
  const { data: featureFlags = [], isLoading: isLoadingFlags } = useQuery({
    queryKey: ['feature-flags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feature_flags')
        .select('*')
        .order('name');
        
      if (error) {
        toast.error(`Failed to fetch feature flags: ${error.message}`);
        return [];
      }
      
      return data.map(flag => ({
        id: flag.id,
        name: flag.name,
        description: flag.description,
        isEnabled: flag.is_enabled,
        appliesToRoles: flag.applies_to_roles || [],
        createdAt: flag.created_at,
        updatedAt: flag.updated_at
      }));
    },
    enabled: !!user,
  });

  // Check if a feature flag is enabled
  const isFeatureEnabled = (flagName: string): boolean => {
    const flag = featureFlags.find(f => f.name === flagName);
    return !!flag?.isEnabled;
  };

  // Create a new feature flag
  const createFeatureFlag = useMutation({
    mutationFn: async (flag: Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt'>) => {
      setLoading(true);
      const { data, error } = await supabase
        .from('feature_flags')
        .insert({
          name: flag.name,
          description: flag.description,
          is_enabled: flag.isEnabled,
          applies_to_roles: flag.appliesToRoles,
          created_by: user?.id
        })
        .select()
        .single();
        
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
    mutationFn: async ({ id, ...flag }: Partial<FeatureFlag> & { id: string }) => {
      setLoading(true);
      const updateData: any = {};
      
      if (flag.name !== undefined) updateData.name = flag.name;
      if (flag.description !== undefined) updateData.description = flag.description;
      if (flag.isEnabled !== undefined) updateData.is_enabled = flag.isEnabled;
      if (flag.appliesToRoles !== undefined) updateData.applies_to_roles = flag.appliesToRoles;
      
      const { data, error } = await supabase
        .from('feature_flags')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
        
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
        .from('feature_flags')
        .delete()
        .eq('id', id);
        
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
