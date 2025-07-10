
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Utility functions
function createSupabaseClient(authHeader: string) {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: { Authorization: authHeader },
      },
    }
  );
}

function createAdminClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

function extractAction(req: Request, requestBody: any): string {
  const url = new URL(req.url);
  const pathname = url.pathname;
  
  if (requestBody.action) return requestBody.action;
  
  if (pathname.includes('get-users-with-emails')) return 'get-users-with-emails';
  if (pathname.includes('create-user')) return 'create-user';
  if (pathname.includes('delete-all-users')) return 'delete-all-users';
  if (pathname.includes('delete-user')) return 'delete-user';
  
  return '';
}

function createErrorResponse(error: string, status: number = 400) {
  return new Response(
    JSON.stringify({ error }),
    { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function createSuccessResponse(data: any) {
  return new Response(
    JSON.stringify(data),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function checkAdminRole(supabaseClient: any, userId: string): Promise<boolean> {
  const { data: roleData, error: roleError } = await supabaseClient
    .from('user_roles')
    .select('*')
    .eq('user_id', userId)
    .eq('role', 'admin');

  return !roleError && roleData && roleData.length > 0;
}

// Action handlers
async function handleGetUsersWithEmails(adminClient: any) {
  const { data: users, error } = await adminClient.auth.admin.listUsers();
  
  if (error) {
    throw new Error(error.message);
  }

  const usersData = users.users.map((u: any) => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
  }));

  return usersData;
}

async function handleCreateUser(adminClient: any, requestBody: any) {
  const { email, password, userData } = requestBody;
  
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: userData?.first_name || '',
      last_name: userData?.last_name || ''
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  console.log('User created successfully:', data.user?.id);

  // If this is the admin user, assign admin role
  if (email === 'tatkaredevesh69@gmail.com' && data.user?.id) {
    try {
      await adminClient
        .from('user_roles')
        .insert({
          user_id: data.user.id,
          role: 'admin'
        });
      console.log('Admin role assigned to user:', data.user.id);
    } catch (roleError) {
      console.error('Error assigning admin role:', roleError);
    }
  }

  return { user: data.user, message: 'User created successfully' };
}

async function handleDeleteAllUsers(adminClient: any) {
  console.log('Attempting to delete all users');

  const { data: users, error: listError } = await adminClient.auth.admin.listUsers();
  
  if (listError) {
    throw new Error(listError.message);
  }

  const deletePromises = users.users.map(async (user: any) => {
    const { error } = await adminClient.auth.admin.deleteUser(user.id);
    if (error) {
      console.error(`Error deleting user ${user.id}:`, error);
    }
    return { userId: user.id, error };
  });

  const results = await Promise.all(deletePromises);
  const successCount = results.filter(r => !r.error).length;
  
  console.log(`Deleted ${successCount} users successfully`);

  return { 
    success: true, 
    message: `Deleted ${successCount} users successfully`,
    results 
  };
}

async function handleDeleteUser(adminClient: any, requestBody: any) {
  const { userId } = requestBody;
  
  if (!userId) {
    throw new Error('User ID is required');
  }

  console.log('Attempting to delete user:', userId);

  // First delete from profiles table (cascade will handle related records)
  const { error: profileError } = await adminClient
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (profileError) {
    console.error('Error deleting profile:', profileError);
  }

  // Then delete from auth.users
  const { error } = await adminClient.auth.admin.deleteUser(userId);

  if (error) {
    throw new Error(error.message);
  }

  console.log('User deleted successfully:', userId);
  return { success: true, message: 'User deleted successfully' };
}

// Main handler
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader) {
      return createErrorResponse('Authorization header is required', 401);
    }

    const supabaseClient = createSupabaseClient(authHeader);
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
      return createErrorResponse('Unauthorized', 401);
    }

    let requestBody: any = {};
    try {
      if (req.method === 'POST') {
        requestBody = await req.json();
      }
    } catch {
      // Ignore parsing errors
    }
    
    const action = extractAction(req, requestBody);
    
    // Check if it's a system operation that bypasses admin check
    const isSystemOperation = action === 'delete-all-users' || 
      (action === 'create-user' && requestBody.email === 'tatkaredevesh69@gmail.com');
    
    if (!isSystemOperation) {
      const hasAdmin = await checkAdminRole(supabaseClient, user.id);
      if (!hasAdmin) {
        return createErrorResponse('Admin access required', 403);
      }
    }

    const adminClient = createAdminClient();

    // Route to appropriate handler
    switch (action) {
      case 'get-users-with-emails':
        const users = await handleGetUsersWithEmails(adminClient);
        return createSuccessResponse(users);
        
      case 'create-user':
        const createResult = await handleCreateUser(adminClient, requestBody);
        return createSuccessResponse(createResult);
        
      case 'delete-all-users':
        const deleteAllResult = await handleDeleteAllUsers(adminClient);
        return createSuccessResponse(deleteAllResult);
        
      case 'delete-user':
        const deleteResult = await handleDeleteUser(adminClient, requestBody);
        return createSuccessResponse(deleteResult);
        
      default:
        return createErrorResponse('Unknown action');
    }
    
  } catch (error: any) {
    console.error('Error in admin-users function:', error);
    return createErrorResponse(error.message, 500);
  }
});
