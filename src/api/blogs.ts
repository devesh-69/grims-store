
import { supabase } from '@/integrations/supabase/client';
import { Blog } from '@/types/blog';
import { BlogFormData } from '@/types/blog-admin';

// API response types for error handling
interface ApiError {
  message: string;
  status: number;
  details?: any;
}

/**
 * Fetch all published blogs
 * @param limit Optional number of blogs to fetch
 * @param offset Optional pagination offset
 */
export const fetchPublishedBlogs = async (limit?: number, offset?: number): Promise<Blog[]> => {
  let query = supabase
    .from('blog_with_authors')
    .select(`
      id,
      title,
      slug,
      excerpt,
      body,
      cover_image_url,
      published_at,
      created_at,
      updated_at,
      category,
      author_id,
      featured,
      comments_enabled,
      meta_title,
      meta_description,
      canonical_url,
      keywords,
      og_title,
      og_description,
      twitter_title,
      twitter_description,
      seo,
      social_preview,
      first_name,
      last_name,
      avatar_url
    `)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false });

  // Apply pagination if specified
  if (limit !== undefined) {
    query = query.limit(limit);
  }
  
  if (offset !== undefined) {
    query = query.range(offset, offset + (limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Transform the data to match our Blog type
  return data.map((item: any): Blog => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    body: item.body,
    coverImage: item.cover_image_url,
    category: item.category || [],
    date: item.published_at || item.created_at,
    featured: item.featured || false,
    commentsEnabled: item.comments_enabled || true,
    author: {
      id: item.author_id,
      name: `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Anonymous',
      avatar: item.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous'
    },
    seo: {
      metaTitle: item.meta_title || '',
      metaDescription: item.meta_description || '',
      canonicalUrl: item.canonical_url || '',
      keywords: item.keywords || []
    },
    socialPreview: {
      ogTitle: item.og_title || '',
      ogDescription: item.og_description || '',
      twitterTitle: item.twitter_title || '',
      twitterDescription: item.twitter_description || ''
    }
  }));
};

/**
 * Fetch a single published blog by slug
 */
export const fetchBlogBySlug = async (slug: string): Promise<Blog | null> => {
  const { data, error } = await supabase
    .from('blog_with_authors')
    .select(`
      id,
      title,
      slug,
      excerpt,
      body,
      cover_image_url,
      published_at,
      created_at,
      updated_at,
      category,
      featured,
      comments_enabled,
      author_id,
      meta_title,
      meta_description,
      canonical_url,
      keywords,
      og_title,
      og_description,
      twitter_title,
      twitter_description,
      seo,
      social_preview,
      first_name,
      last_name,
      avatar_url
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    throw error;
  }

  return {
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
  };
};

/**
 * Admin API: Fetch all blogs (both draft and published)
 */
export const fetchAllBlogs = async (): Promise<Blog[]> => {
  const { data, error } = await supabase
    .from('blog_with_authors')
    .select(`
      id,
      title,
      slug,
      excerpt,
      body,
      cover_image_url,
      published_at,
      created_at,
      updated_at,
      category,
      status,
      featured,
      comments_enabled,
      author_id,
      meta_title,
      meta_description,
      canonical_url,
      keywords,
      og_title,
      og_description,
      twitter_title,
      twitter_description,
      seo,
      social_preview,
      first_name,
      last_name,
      avatar_url
    `)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  // Transform the data to match our Blog type
  return data.map((item: any): Blog => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    body: item.body,
    coverImage: item.cover_image_url,
    category: item.category || [],
    date: item.published_at || item.created_at,
    status: item.status,
    featured: item.featured || false,
    commentsEnabled: item.comments_enabled || true,
    author: {
      id: item.author_id,
      name: `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Anonymous',
      avatar: item.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous'
    },
    seo: {
      metaTitle: item.meta_title || '',
      metaDescription: item.meta_description || '',
      canonicalUrl: item.canonical_url || '',
      keywords: item.keywords || []
    },
    socialPreview: {
      ogTitle: item.og_title || '',
      ogDescription: item.og_description || '',
      twitterTitle: item.twitter_title || '',
      twitterDescription: item.twitter_description || ''
    }
  }));
};

/**
 * Admin API: Fetch a single blog by ID
 */
export const fetchBlogById = async (id: string): Promise<Blog | null> => {
  const { data, error } = await supabase
    .from('blog_with_authors')
    .select(`
      id,
      title,
      slug,
      excerpt,
      body,
      cover_image_url,
      published_at,
      created_at,
      updated_at,
      category,
      status,
      featured,
      comments_enabled,
      author_id,
      meta_title,
      meta_description,
      canonical_url,
      keywords,
      og_title,
      og_description,
      twitter_title,
      twitter_description,
      seo,
      social_preview,
      first_name,
      last_name,
      avatar_url
    `)
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    throw error;
  }

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    body: data.body,
    coverImage: data.cover_image_url,
    category: data.category || [],
    date: data.published_at || data.created_at,
    status: data.status,
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
  };
};

/**
 * Generate a slug from a blog title
 */
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '-') + 
    '-' + Date.now().toString().substring(9);
};

/**
 * Admin API: Create a new blog post
 */
export const createBlog = async (blogData: BlogFormData): Promise<string> => {
  // Generate a slug from the title if not provided
  const slug = blogData.slug || generateSlug(blogData.title);

  const { data, error } = await supabase
    .from('blogs')
    .insert({
      title: blogData.title,
      slug: slug,
      excerpt: blogData.excerpt,
      body: blogData.body,
      cover_image_url: blogData.coverImage,
      published_at: blogData.status === 'published' ? new Date().toISOString() : null,
      author_id: blogData.author.id,
      status: blogData.status,
      category: blogData.category || [],
      featured: blogData.featured || false,
      comments_enabled: blogData.commentsEnabled || true,
      meta_title: blogData.seo?.metaTitle || '',
      meta_description: blogData.seo?.metaDescription || '',
      canonical_url: blogData.seo?.canonicalUrl || '',
      keywords: blogData.seo?.keywords || [],
      og_title: blogData.socialPreview?.ogTitle || '',
      og_description: blogData.socialPreview?.ogDescription || '',
      twitter_title: blogData.socialPreview?.twitterTitle || '',
      twitter_description: blogData.socialPreview?.twitterDescription || ''
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
};

/**
 * Admin API: Update an existing blog post
 */
export const updateBlog = async (id: string, blogData: BlogFormData): Promise<void> => {
  // Update the slug only if it was provided or if title has changed significantly
  const slug = blogData.slug || (blogData.title ? generateSlug(blogData.title) : undefined);
  
  // Handle status change to published
  let publishedAt = undefined;
  if (blogData.status === 'published' && !blogData.publishedAt) {
    publishedAt = new Date().toISOString();
  }

  const { error } = await supabase
    .from('blogs')
    .update({
      title: blogData.title,
      slug: slug,
      excerpt: blogData.excerpt,
      body: blogData.body,
      cover_image_url: blogData.coverImage,
      published_at: publishedAt,
      status: blogData.status as 'draft' | 'published',
      category: blogData.category || [],
      featured: blogData.featured || false,
      comments_enabled: blogData.commentsEnabled || true,
      meta_title: blogData.seo?.metaTitle || '',
      meta_description: blogData.seo?.metaDescription || '',
      canonical_url: blogData.seo?.canonicalUrl || '',
      keywords: blogData.seo?.keywords || [],
      og_title: blogData.socialPreview?.ogTitle || '',
      og_description: blogData.socialPreview?.ogDescription || '',
      twitter_title: blogData.socialPreview?.twitterTitle || '',
      twitter_description: blogData.socialPreview?.twitterDescription || '',
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) throw error;
};

/**
 * Admin API: Delete a blog post
 */
export const deleteBlog = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('blogs')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

/**
 * Admin API: Publish a blog post
 */
export const publishBlog = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('blogs')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) throw error;
};

/**
 * Create Supabase Edge Functions for the API endpoints
 */

// Now let's create the Edge Functions for RESTful API endpoints
