
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { SystemSetting } from "@/types/auth";

export const useSystemSettings = () => {
  const { user } = useAuth();
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
    enabled: !!user,
  });

  // Get a specific setting by key
  const getSetting = <T = any>(key: string): T | undefined => {
    const setting = systemSettings.find(s => s.key === key);
    return setting?.value;
  };

  // Update a system setting
  const updateSetting = useMutation<
    any, 
    Error,
    { key: string; value: any; isPublic?: boolean; description?: string }
  >({
    mutationFn: async ({ key, value, isPublic, description }) => {
      setLoading(true);
      
      const { data, error } = await supabase
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

  // Check if system is in maintenance mode
  const isMaintenanceMode = (): boolean => {
    const maintenanceSetting = getSetting<{ enabled: boolean }>('maintenance_mode');
    return !!maintenanceSetting?.enabled;
  };

  return {
    systemSettings,
    isLoadingSettings,
    getSetting,
    updateSetting,
    isMaintenanceMode,
    loading
  };
};
