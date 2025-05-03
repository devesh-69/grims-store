import { supabase } from '@/integrations/supabase/client';
import { Blog } from '@/types/blog';
import { BlogFormData } from '@/types/blog-admin';

/**
 * Fetch all published blogs
 */
export const fetchPublishedBlogs = async (): Promise<Blog[]> => {
  const { data, error } = await supabase
    .from('blog_with_authors')
    .select(`
      id,
      title,
      slug,
      excerpt,
      content,
      cover_image,
      published_at,
      created_at,
      updated_at,
      category,
      author_id,
      seo,
      social_preview,
      first_name,
      last_name,
      avatar_url
    `)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false });

  if (error) throw error;

  // Transform the data to match our Blog type
  return data.map((item: any): Blog => ({
    id: item.id,
    title: item.title,
    excerpt: item.excerpt,
    content: item.content,
    coverImage: item.cover_image,
    date: item.published_at || item.created_at,
    category: item.category,
    author: {
      id: item.author_id,
      name: `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Anonymous',
      avatar: item.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous'
    },
    seo: item.seo as Blog['seo'],
    socialPreview: item.social_preview as Blog['socialPreview']
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
      content,
      cover_image,
      published_at,
      created_at,
      updated_at,
      category,
      author_id,
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
    excerpt: data.excerpt,
    content: data.content,
    coverImage: data.cover_image,
    date: data.published_at || data.created_at,
    category: data.category,
    author: {
      id: data.author_id,
      name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Anonymous',
      avatar: data.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous'
    },
    seo: data.seo as Blog['seo'],
    socialPreview: data.social_preview as Blog['socialPreview']
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
      content,
      cover_image,
      published_at,
      created_at,
      updated_at,
      category,
      status,
      author_id,
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
    excerpt: item.excerpt,
    content: item.content,
    coverImage: item.cover_image,
    date: item.published_at || item.created_at,
    status: item.status,
    category: item.category,
    author: {
      id: item.author_id,
      name: `${item.first_name || ''} ${item.last_name || ''}`.trim() || 'Anonymous',
      avatar: item.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous'
    },
    seo: item.seo as Blog['seo'],
    socialPreview: item.social_preview as Blog['socialPreview']
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
      content,
      cover_image,
      published_at,
      created_at,
      updated_at,
      category,
      status,
      author_id,
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
    excerpt: data.excerpt,
    content: data.content,
    coverImage: data.cover_image,
    date: data.published_at || data.created_at,
    status: data.status,
    category: data.category,
    author: {
      id: data.author_id,
      name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Anonymous',
      avatar: data.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous'
    },
    seo: data.seo as Blog['seo'],
    socialPreview: data.social_preview as Blog['socialPreview']
  };
};

/**
 * Admin API: Create a new blog post
 */
export const createBlog = async (blogData: BlogFormData): Promise<string> => {
  // Generate a slug from the title
  const slug = blogData.title
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '-');

  const { data, error } = await supabase
    .from('blog_with_authors')
    .insert({
      title: blogData.title,
      slug: `${slug}-${Date.now()}`, // Ensure uniqueness
      excerpt: blogData.excerpt,
      content: blogData.content,
      cover_image: blogData.coverImage,
      published_at: blogData.status === 'published' ? new Date().toISOString() : null,
      author_id: blogData.author.id,
      status: blogData.status || 'draft',
      category: blogData.category,
      seo: blogData.seo,
      social_preview: blogData.socialPreview
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
  // Update the slug only if the title has changed significantly
  let slugUpdate = {};
  if (blogData.title) {
    const slug = blogData.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
    
    slugUpdate = { slug: `${slug}-${Date.now()}` };
  }

  // Handle status change to published
  let publishedUpdate = {};
  if (blogData.status === 'published' && !blogData.publishedAt) {
    publishedUpdate = { published_at: new Date().toISOString() };
  }

  const { error } = await supabase
    .from('blog_with_authors')
    .update({
      title: blogData.title,
      ...slugUpdate,
      excerpt: blogData.excerpt,
      content: blogData.content,
      cover_image: blogData.coverImage,
      ...publishedUpdate,
      status: blogData.status,
      category: blogData.category,
      seo: blogData.seo,
      social_preview: blogData.socialPreview,
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
    .from('blog_with_authors')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

/**
 * Admin API: Publish a blog post
 */
export const publishBlog = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('blog_with_authors')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) throw error;
};
