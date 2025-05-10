
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
  
  // Get a single system setting by key
  const getSettingByKey = (key: string): SystemSetting | undefined => {
    return systemSettings?.find(setting => setting.key === key);
  };
  
  // Get a setting value with optional default
  const getSetting = <T,>(key: string, defaultValue: T): T => {
    const setting = getSettingByKey(key);
    return setting ? (setting.value as T) : defaultValue;
  };

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
  
  // Update multiple settings at once
  const updateSettings = async (settings: Record<string, any>, description?: string) => {
    setLoading(true);
    try {
      const promises = Object.entries(settings).map(([key, value]) => 
        upsertSystemSetting.mutateAsync({ 
          key, 
          value,
          description: description || `Setting for ${key}`
        })
      );
      
      await Promise.all(promises);
      return true;
    } catch (error) {
      console.error("Failed to update settings:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

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
    loading,
    getSettingByKey,
    getSetting,
    updateSettings
  };
};
