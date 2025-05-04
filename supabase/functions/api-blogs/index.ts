
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

    // Parse the URL to get parameters
    const url = new URL(req.url)
    const slug = url.pathname.split('/').pop()
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined
    const offset = url.searchParams.get('offset') ? parseInt(url.searchParams.get('offset')!) : undefined

    // Handle different routes
    if (req.method === 'GET') {
      // If we have a slug parameter, fetch a specific blog
      if (slug && slug !== 'api-blogs') {
        // Fetch specific blog by slug
        const { data, error } = await supabaseClient
          .from('blog_with_authors')
          .select(`
            id, title, slug, excerpt, body, cover_image_url, published_at, created_at,
            updated_at, category, featured, comments_enabled, author_id, 
            meta_title, meta_description, canonical_url, keywords, og_title, og_description,
            twitter_title, twitter_description, first_name, last_name, avatar_url
          `)
          .eq('slug', slug)
          .eq('status', 'published')
          .lte('published_at', new Date().toISOString())
          .single()

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
          )
        }

        if (!data) {
          return new Response(
            JSON.stringify({ error: 'Blog not found' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
          )
        }

        // Format the response to match our Blog type
        const formattedData = {
          id: data.id,
          title: data.title,
          slug: data.slug,
          excerpt: data.excerpt,
          body: data.body,
          coverImage: data.cover_image_url,
          category: data.category || [],
          date: data.published_at || data.created_at,
          featured: data.featured || false,
          commentsEnabled: data.comments_enabled || true,
          author: {
            id: data.author_id,
            name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Anonymous',
            avatar: data.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous'
          },
          seo: {
            metaTitle: data.meta_title || '',
            metaDescription: data.meta_description || '',
            canonicalUrl: data.canonical_url || '',
            keywords: data.keywords || []
          },
          socialPreview: {
            ogTitle: data.og_title || '',
            ogDescription: data.og_description || '',
            twitterTitle: data.twitter_title || '',
            twitterDescription: data.twitter_description || ''
          }
        }

        return new Response(
          JSON.stringify(formattedData),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      } 
      else {
        // Fetch list of blogs with pagination
        let query = supabaseClient
          .from('blog_with_authors')
          .select(`
            id, title, slug, excerpt, cover_image_url, published_at, category, featured,
            author_id, first_name, last_name, avatar_url
          `)
          .eq('status', 'published')
          .lte('published_at', new Date().toISOString())
          .order('published_at', { ascending: false })

        // Apply pagination if specified
        if (limit !== undefined) {
          query = query.limit(limit)
        }
        
        if (offset !== undefined) {
          query = query.range(offset, offset + (limit || 10) - 1)
        }

        const { data, error, count } = await query

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          )
        }

        // Format the response to match our Blog list type
        const formattedData = data.map(item => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          excerpt: item.excerpt,
          coverImage: item.cover_image_url,
          category: item.category || [],
          date: item.published_at,
          featured: item.featured || false,
          author: {
            id: item.author_id,
            name: `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Anonymous',
            avatar: item.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous'
          }
        }))

        return new Response(
          JSON.stringify(formattedData),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      }
    }

    // Return 405 Method Not Allowed for other HTTP methods
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
