
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SystemSetting } from "@/types/auth";

export const useSystemSettings = () => {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Fetch all system settings
  const { data: systemSettings = [], isLoading: isLoadingSettings } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .functions.invoke('admin-system-settings', {
            body: {
              action: 'list'
            }
          });
            
        if (error) {
          toast.error(`Failed to fetch system settings: ${error.message}`);
          return [];
        }
        
        return data as SystemSetting[];
      } catch (error: any) {
        toast.error(`Failed to fetch system settings: ${error.message}`);
        return [];
      }
    },
  });

  // Create or update a system setting
  const upsertSystemSetting = useMutation({
    mutationFn: async ({ 
      key,
      value,
      isPublic,
      description
    }: { 
      key: string;
      value: any;
      isPublic?: boolean;
      description?: string;
    }) => {
      setLoading(true);
      
      const { data, error } = await supabase
        .functions.invoke('admin-system-settings', {
          body: {
            action: 'upsert',
            key,
            value,
            is_public: isPublic || false,
            description: description || ''
          }
        });
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast.success('Setting updated successfully');
      setLoading(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update setting: ${error.message}`);
      setLoading(false);
    }
  });

  // Delete a system setting
  const deleteSystemSetting = useMutation({
    mutationFn: async (key: string) => {
      setLoading(true);
      const { error } = await supabase
        .functions.invoke('admin-system-settings', {
          body: {
            action: 'delete',
            key
          }
        });
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast.success('Setting deleted successfully');
      setLoading(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete setting: ${error.message}`);
      setLoading(false);
    }
  });

  return {
    systemSettings,
    isLoadingSettings,
    upsertSystemSetting,
    deleteSystemSetting,
    loading
  };
};
