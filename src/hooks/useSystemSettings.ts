
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface SystemSetting<T = any> {
  id: string;
  key: string;
  value: T;
  isPublic: boolean;
  description?: string;
  updatedAt: string;
}

export const useSystemSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  // Fetch all system settings
  const { data: systemSettings = [], isLoading: isLoadingSettings } = useQuery({
    queryKey: ['system-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('key');
        
      if (error) {
        toast.error(`Failed to fetch system settings: ${error.message}`);
        return [];
      }
      
      return data.map(setting => ({
        id: setting.id,
        key: setting.key,
        value: setting.value,
        isPublic: setting.is_public,
        description: setting.description,
        updatedAt: setting.updated_at
      }));
    },
    enabled: !!user,
  });

  // Get a specific setting by key
  const getSetting = <T = any>(key: string): T | undefined => {
    const setting = systemSettings.find(s => s.key === key);
    return setting?.value;
  };

  // Update a system setting
  const updateSetting = useMutation({
    mutationFn: async <T = any>({ key, value, isPublic, description }: { 
      key: string, 
      value: T, 
      isPublic?: boolean, 
      description?: string 
    }) => {
      setLoading(true);
      
      // Check if setting exists
      const { data: existingSetting } = await supabase
        .from('system_settings')
        .select('id')
        .eq('key', key)
        .maybeSingle();
      
      let result;
      
      if (existingSetting) {
        // Update existing setting
        const updateData: any = { value, updated_by: user?.id };
        if (isPublic !== undefined) updateData.is_public = isPublic;
        if (description !== undefined) updateData.description = description;
        
        const { data, error } = await supabase
          .from('system_settings')
          .update(updateData)
          .eq('id', existingSetting.id)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      } else {
        // Create new setting
        const { data, error } = await supabase
          .from('system_settings')
          .insert({
            key,
            value,
            is_public: isPublic || false,
            description,
            updated_by: user?.id
          })
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      }
      
      return result;
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
