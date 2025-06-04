
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Utility function to generate a slug from a title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '-') + 
    '-' + Date.now().toString().substring(9);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: req.headers.get('Authorization')! } },
        auth: { persistSession: false },
      }
    )

    // Parse the URL to get the blog ID and check if this is a publish endpoint
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/')
    let blogId = null
    let isPublishEndpoint = false

    if (pathParts.length >= 3) {
      blogId = pathParts[pathParts.length - 1]
      if (pathParts[pathParts.length - 2] === 'publish') {
        isPublishEndpoint = true
        blogId = pathParts[pathParts.length - 3]
      }
    }

    // Get the current user from the auth context
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    console.log('User authenticated:', user.id)

    // Handle different endpoints
    if (req.method === 'POST' && isPublishEndpoint && blogId) {
      // Publish endpoint: POST /api/admin/blogs/{id}/publish
      const { error } = await supabaseClient
        .from('blogs')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', blogId);

      if (error) {
        console.error('Publish error:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Blog published successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    } 
    else if (req.method === 'POST' && !blogId) {
      // Create endpoint: POST /api/admin/blogs
      const blogData = await req.json();
      console.log('Creating blog with data:', blogData)
      
      // Generate a slug from the title if not provided
      const slug = blogData.slug || generateSlug(blogData.title);
      
      // Use the authenticated user's ID directly
      const { data, error } = await supabaseClient
        .from('blogs')
        .insert({
          title: blogData.title,
          slug: slug,
          excerpt: blogData.excerpt,
          body: blogData.body || '',
          cover_image_url: blogData.coverImage,
          published_at: blogData.status === 'published' ? new Date().toISOString() : null,
          author_id: user.id,
          status: blogData.status || 'draft',
          category: blogData.category || [],
          featured: blogData.featured || false,
          comments_enabled: blogData.commentsEnabled || true,
          meta_title: blogData.seo?.metaTitle || blogData.title || '',
          meta_description: blogData.seo?.metaDescription || blogData.excerpt || '',
          canonical_url: blogData.seo?.canonicalUrl || '',
          keywords: blogData.seo?.keywords || [],
          og_title: blogData.socialPreview?.ogTitle || blogData.title || '',
          og_description: blogData.socialPreview?.ogDescription || blogData.excerpt || '',
          twitter_title: blogData.socialPreview?.twitterTitle || blogData.title || '',
          twitter_description: blogData.socialPreview?.twitterDescription || blogData.excerpt || ''
        })
        .select('id')
        .single();

      if (error) {
        console.error('Blog creation error:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      console.log('Blog created successfully:', data)
      return new Response(
        JSON.stringify({ id: data.id, success: true, message: 'Blog created successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
      )
    } 
    else if (req.method === 'PUT' && blogId) {
      // Update endpoint: PUT /api/admin/blogs/{id}
      const blogData = await req.json();
      console.log('Updating blog with data:', blogData)
      
      // Generate a slug from the title if it was provided
      const slug = blogData.slug || (blogData.title ? generateSlug(blogData.title) : undefined);
      
      // Handle status change to published
      let publishedAt = undefined;
      if (blogData.status === 'published' && !blogData.publishedAt) {
        publishedAt = new Date().toISOString();
      }

      const { error } = await supabaseClient
        .from('blogs')
        .update({
          title: blogData.title,
          slug: slug,
          excerpt: blogData.excerpt,
          body: blogData.body || '',
          cover_image_url: blogData.coverImage,
          published_at: publishedAt,
          status: blogData.status,
          category: blogData.category || [],
          featured: blogData.featured || false,
          comments_enabled: blogData.commentsEnabled || true,
          meta_title: blogData.seo?.metaTitle || blogData.title || '',
          meta_description: blogData.seo?.metaDescription || blogData.excerpt || '',
          canonical_url: blogData.seo?.canonicalUrl || '',
          keywords: blogData.seo?.keywords || [],
          og_title: blogData.socialPreview?.ogTitle || blogData.title || '',
          og_description: blogData.socialPreview?.ogDescription || blogData.excerpt || '',
          twitter_title: blogData.socialPreview?.twitterTitle || blogData.title || '',
          twitter_description: blogData.socialPreview?.twitterDescription || blogData.excerpt || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', blogId);

      if (error) {
        console.error('Blog update error:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Blog updated successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    } 
    else if (req.method === 'DELETE' && blogId) {
      // Delete endpoint: DELETE /api/admin/blogs/{id}
      const { error } = await supabaseClient
        .from('blogs')
        .delete()
        .eq('id', blogId);

      if (error) {
        console.error('Blog deletion error:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Blog deleted successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Return 405 Method Not Allowed for other HTTP methods or missing IDs
    return new Response(
      JSON.stringify({ error: 'Method not allowed or invalid request' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
