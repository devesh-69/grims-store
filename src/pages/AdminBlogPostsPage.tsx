
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { Blog } from "@/types/blog";
import { BlogsTable } from "@/components/blog/BlogsTable";
import { BlogEditor } from "@/components/blog/BlogEditor";
import { BlogFormData } from "@/types/blog-admin";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Search } from "lucide-react";
import { toast } from "sonner";
import { useTitle } from "@/hooks/useTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchAllBlogs, createBlog, updateBlog, deleteBlog } from "@/api/blogs";
import { useAuth } from "@/contexts/AuthContext";

const AdminBlogPostsPage = () => {
  useTitle("Blog Posts Management | Admin");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<Blog | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");

  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch blogs from API
  const { data: blogs = [], isLoading, error } = useQuery({
    queryKey: ['admin-blogs'],
    queryFn: fetchAllBlogs,
    enabled: !!user?.isAdmin, // Only fetch if user is admin
  });

  // Create blog mutation
  const createBlogMutation = useMutation({
    mutationFn: createBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      toast.success("Blog post created successfully");
      setIsEditorOpen(false);
      setCurrentBlog(undefined);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create blog post: ${error.message}`);
    }
  });

  // Update blog mutation
  const updateBlogMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: BlogFormData }) => 
      updateBlog(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      toast.success("Blog post updated successfully");
      setIsEditorOpen(false);
      setCurrentBlog(undefined);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update blog post: ${error.message}`);
    }
  });

  // Delete blog mutation
  const deleteBlogMutation = useMutation({
    mutationFn: deleteBlog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      toast.success("Blog post deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete blog post: ${error.message}`);
    }
  });

  const handleEdit = (blog: Blog) => {
    setCurrentBlog(blog);
    setIsEditorOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteBlogMutation.mutate(id);
  };

  const handleView = (id: string) => {
    // Find the blog to get its slug
    const blog = blogs.find(b => b.id === id);
    if (blog) {
      // In a real app we would use the slug to view the blog post
      // For now, just open in a new tab with ID
      window.open(`/blog/${id}`, "_blank");
    }
  };

  const handleSave = async (blogData: BlogFormData) => {
    if (blogData.id) {
      // Update existing blog
      updateBlogMutation.mutate({
        id: blogData.id,
        data: blogData
      });
    } else {
      // Create new blog
      createBlogMutation.mutate({
        ...blogData,
        author: {
          id: user?.id || 'anonymous',
          name: user?.email?.split('@')[0] || 'Anonymous',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.id || 'anonymous'}`
        }
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditorOpen(false);
    setCurrentBlog(undefined);
  };

  // Filter blogs based on search term
  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Blog Posts Management</h1>
            <p className="text-muted-foreground">
              Create, edit, and manage your blog posts
            </p>
          </div>
          <Button 
            onClick={() => setIsEditorOpen(true)} 
            className="whitespace-nowrap bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isLoading}
          >
            <Plus className="mr-2" />
            New Blog Post
          </Button>
        </div>

        {isEditorOpen ? (
          <BlogEditor
            blog={currentBlog}
            onSave={handleSave}
            onCancel={handleCancelEdit}
          />
        ) : (
          <Card className="bg-background/30 rounded-lg border border-border shadow-lg backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-border/40">
              <CardTitle className="text-foreground">Blog Posts</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search blogs..."
                    className="pl-10 text-foreground bg-background/50 border-border"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="mt-2 text-muted-foreground">Loading blog posts...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12 border border-dashed border-border rounded-lg bg-background/20">
                  <FileText className="h-12 w-12 mx-auto text-destructive" />
                  <h2 className="mt-4 text-xl font-semibold text-foreground">Error loading blog posts</h2>
                  <p className="text-muted-foreground mt-2">
                    {(error as Error).message || "Failed to load blog posts"}
                  </p>
                </div>
              ) : filteredBlogs.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-lg bg-background/20">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h2 className="mt-4 text-xl font-semibold text-foreground">No blog posts yet</h2>
                  <p className="text-muted-foreground mt-2">
                    Create your first blog post to get started
                  </p>
                  <Button
                    onClick={() => setIsEditorOpen(true)}
                    className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Plus className="mr-2" />
                    Create Blog Post
                  </Button>
                </div>
              ) : (
                <BlogsTable
                  blogs={filteredBlogs}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onView={handleView}
                />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBlogPostsPage;
