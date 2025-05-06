
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Feature {
  id: string;
  name: string;
  description?: string;
  is_enabled: boolean;
  applies_to_roles: string[];
  created_at: string;
  updated_at: string;
  created_by?: string;
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
    
    const { action, id, name, description, is_enabled, applies_to_roles } = await req.json();
    
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
    
    // Check if user has admin role
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
    
    let result;
    
    switch (action) {
      case 'create':
        const { data: createData, error: createError } = await supabaseClient
          .from('feature_flags')
          .insert({
            name,
            description,
            is_enabled,
            applies_to_roles,
            created_by: user.id
          })
          .select()
          .single();
          
        if (createError) throw createError;
        result = createData;
        break;
        
      case 'list':
        const { data: listData, error: listError } = await supabaseClient
          .from('feature_flags')
          .select('*')
          .order('name');
          
        if (listError) throw listError;
        result = listData;
        break;
        
      case 'update':
        const updates: any = {};
        if (name !== undefined) updates.name = name;
        if (description !== undefined) updates.description = description;
        if (is_enabled !== undefined) updates.is_enabled = is_enabled;
        if (applies_to_roles !== undefined) updates.applies_to_roles = applies_to_roles;
        
        const { data: updateData, error: updateError } = await supabaseClient
          .from('feature_flags')
          .update(updates)
          .eq('id', id)
          .select()
          .single();
          
        if (updateError) throw updateError;
        result = updateData;
        break;
        
      case 'delete':
        const { error: deleteError } = await supabaseClient
          .from('feature_flags')
          .delete()
          .eq('id', id);
          
        if (deleteError) throw deleteError;
        result = { success: true };
        break;
        
      case 'check':
        const { data: checkData, error: checkError } = await supabaseClient
          .from('feature_flags')
          .select('is_enabled, applies_to_roles')
          .eq('name', name)
          .single();
          
        if (checkError) {
          if (checkError.code === 'PGRST116') {
            // Not found
            result = { is_enabled: false };
          } else {
            throw checkError;
          }
        } else {
          result = { 
            is_enabled: checkData.is_enabled,
            applies_to_roles: checkData.applies_to_roles
          };
        }
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
