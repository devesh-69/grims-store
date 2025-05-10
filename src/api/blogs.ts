import { supabase } from '@/integrations/supabase/client';
import { Blog, BlogCategory } from '@/types/blog';
import { BlogFormData } from '@/types/blog-admin';

// Type for blog status
type BlogStatus = "published" | "draft";

/**
 * Fetch all blogs from the database
 */
export const fetchAllBlogs = async (): Promise<Blog[]> => {
  const { data, error } = await supabase
    .from('blogs')
    .select(`
      *,
      author:user_id (
        id,
        email,
        user_metadata
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching blogs:', error);
    throw new Error(error.message);
  }

  // Transform the data to match our Blog type
  return data.map((blog) => ({
    id: blog.id,
    title: blog.title,
    content: blog.content,
    excerpt: blog.excerpt,
    featured_image: blog.featured_image,
    slug: blog.slug,
    status: blog.status,
    category: blog.category,
    tags: blog.tags,
    created_at: blog.created_at,
    updated_at: blog.updated_at,
    author: {
      id: blog.author?.id || 'unknown',
      name: blog.author?.user_metadata?.first_name 
        ? `${blog.author.user_metadata.first_name} ${blog.author.user_metadata.last_name || ''}`
        : blog.author?.email?.split('@')[0] || 'Unknown Author',
      avatar: blog.author?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${blog.author?.id || 'unknown'}`
    }
  }));
};

/**
 * Fetch a single blog by ID
 */
export const fetchBlogById = async (id: string): Promise<Blog> => {
  const { data, error } = await supabase
    .from('blogs')
    .select(`
      *,
      author:user_id (
        id,
        email,
        user_metadata
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching blog with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return {
    id: data.id,
    title: data.title,
    content: data.content,
    excerpt: data.excerpt,
    featured_image: data.featured_image,
    slug: data.slug,
    status: data.status,
    category: data.category,
    tags: data.tags,
    created_at: data.created_at,
    updated_at: data.updated_at,
    author: {
      id: data.author?.id || 'unknown',
      name: data.author?.user_metadata?.first_name 
        ? `${data.author.user_metadata.first_name} ${data.author.user_metadata.last_name || ''}`
        : data.author?.email?.split('@')[0] || 'Unknown Author',
      avatar: data.author?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.author?.id || 'unknown'}`
    }
  };
};

/**
 * Fetch blogs by category
 */
export const fetchBlogsByCategory = async (category: BlogCategory): Promise<Blog[]> => {
  const { data, error } = await supabase
    .from('blogs')
    .select(`
      *,
      author:user_id (
        id,
        email,
        user_metadata
      )
    `)
    .contains('category', [category])
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching blogs with category ${category}:`, error);
    throw new Error(error.message);
  }

  return data.map((blog) => ({
    id: blog.id,
    title: blog.title,
    content: blog.content,
    excerpt: blog.excerpt,
    featured_image: blog.featured_image,
    slug: blog.slug,
    status: blog.status,
    category: blog.category,
    tags: blog.tags,
    created_at: blog.created_at,
    updated_at: blog.updated_at,
    author: {
      id: blog.author?.id || 'unknown',
      name: blog.author?.user_metadata?.first_name 
        ? `${blog.author.user_metadata.first_name} ${blog.author.user_metadata.last_name || ''}`
        : blog.author?.email?.split('@')[0] || 'Unknown Author',
      avatar: blog.author?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${blog.author?.id || 'unknown'}`
    }
  }));
};

/**
 * Fetch published blogs
 */
export const fetchPublishedBlogs = async (): Promise<Blog[]> => {
  const { data, error } = await supabase
    .from('blogs')
    .select(`
      *,
      author:user_id (
        id,
        email,
        user_metadata
      )
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching published blogs:', error);
    throw new Error(error.message);
  }

  return data.map((blog) => ({
    id: blog.id,
    title: blog.title,
    content: blog.content,
    excerpt: blog.excerpt,
    featured_image: blog.featured_image,
    slug: blog.slug,
    status: blog.status,
    category: blog.category,
    tags: blog.tags,
    created_at: blog.created_at,
    updated_at: blog.updated_at,
    author: {
      id: blog.author?.id || 'unknown',
      name: blog.author?.user_metadata?.first_name 
        ? `${blog.author.user_metadata.first_name} ${blog.author.user_metadata.last_name || ''}`
        : blog.author?.email?.split('@')[0] || 'Unknown Author',
      avatar: blog.author?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${blog.author?.id || 'unknown'}`
    }
  }));
};

/**
 * Create a new blog
 */
export const createBlog = async (data: BlogFormData): Promise<Blog> => {
  // Generate a slug from the title
  const slug = data.title
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '-');
  
  // Ensure status is a valid value
  const status = data.status as BlogStatus;

  const { data: newBlog, error } = await supabase
    .from('blogs')
    .insert({
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      featured_image: data.featured_image,
      slug,
      status,
      category: data.category,
      tags: data.tags,
      user_id: data.author.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating blog:', error);
    throw new Error(error.message);
  }

  return {
    ...newBlog,
    author: data.author
  };
};

/**
 * Update an existing blog
 */
export const updateBlog = async (id: string, data: BlogFormData): Promise<Blog> => {
  // Generate a slug from the title if not provided
  const slug = data.slug || data.title
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '-');
  
  // Ensure status is a valid value
  const status = data.status as BlogStatus;

  const { data: updatedBlog, error } = await supabase
    .from('blogs')
    .update({
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      featured_image: data.featured_image,
      slug,
      status,
      category: data.category,
      tags: data.tags,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating blog with ID ${id}:`, error);
    throw new Error(error.message);
  }

  return {
    ...updatedBlog,
    author: data.author
  };
};

/**
 * Delete a blog
 */
export const deleteBlog = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('blogs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting blog with ID ${id}:`, error);
    throw new Error(error.message);
  }
};
