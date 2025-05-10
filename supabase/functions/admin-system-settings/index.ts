
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SystemSetting {
  id: string;
  key: string;
  value: any;
  is_public: boolean;
  description?: string;
  updated_at: string;
  updated_by?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    const { action, key, value, is_public, description } = await req.json();
    
    // Get authentication data
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    let result;
    let requiresAdmin = true;
    
    // For get action and public settings, we don't need admin role
    if (action === 'get' || action === 'list') {
      requiresAdmin = false;
    }
    
    // If admin role is required, check if user has it
    if (requiresAdmin) {
      const { data: roles, error: rolesError } = await supabaseClient
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin');
        
      if (rolesError || !roles || roles.length === 0) {
        return new Response(JSON.stringify({ error: 'Unauthorized: Admin role required' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }
    
    switch (action) {
      case 'upsert':
        // Check if setting exists
        const { data: existingSetting } = await supabaseClient
          .from('system_settings')
          .select('id')
          .eq('key', key)
          .maybeSingle();
        
        if (existingSetting) {
          // Update
          const { data: updateData, error: updateError } = await supabaseClient
            .from('system_settings')
            .update({
              value,
              is_public: is_public !== undefined ? is_public : false,
              description: description !== undefined ? description : undefined,
              updated_by: user.id
            })
            .eq('id', existingSetting.id)
            .select()
            .single();
            
          if (updateError) throw updateError;
          result = updateData;
        } else {
          // Insert
          const { data: insertData, error: insertError } = await supabaseClient
            .from('system_settings')
            .insert({
              key,
              value,
              is_public: is_public !== undefined ? is_public : false,
              description,
              updated_by: user.id
            })
            .select()
            .single();
            
          if (insertError) throw insertError;
          result = insertData;
        }
        break;
        
      case 'list':
        let query = supabaseClient
          .from('system_settings')
          .select('*')
          .order('key');
          
        // If not admin, only return public settings
        if (!requiresAdmin && !await checkUserIsAdmin(supabaseClient, user.id)) {
          query = query.eq('is_public', true);
        }
        
        const { data: listData, error: listError } = await query;
          
        if (listError) throw listError;
        result = listData;
        break;
        
      case 'get':
        const { data: getData, error: getError } = await supabaseClient
          .from('system_settings')
          .select('*')
          .eq('key', key)
          .maybeSingle();
          
        if (getError) throw getError;
        
        // Check if setting is private and user is not admin
        if (getData && !getData.is_public && !await checkUserIsAdmin(supabaseClient, user.id)) {
          return new Response(JSON.stringify({ error: 'Unauthorized: Private setting' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        result = getData;
        break;

      case 'delete':
        const { error: deleteError } = await supabaseClient
          .from('system_settings')
          .delete()
          .eq('key', key);
          
        if (deleteError) throw deleteError;
        result = { success: true, message: `Setting ${key} deleted successfully` };
        break;
        
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Error:', error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

// Helper function to check if a user has admin role
async function checkUserIsAdmin(supabaseClient, userId: string): Promise<boolean> {
  const { data: roles, error: rolesError } = await supabaseClient
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin');
    
  if (rolesError || !roles || roles.length === 0) {
    return false;
  }
  
  return true;
}
