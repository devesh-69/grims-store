
import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Blog } from "@/types/blog";
import { blogs as initialBlogs } from "@/data/blogs";
import { BlogsTable } from "@/components/blog/BlogsTable";
import { BlogEditor } from "@/components/blog/BlogEditor";
import { BlogFormData } from "@/types/blog-admin";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { toast } from "sonner";
import { useTitle } from "@/hooks/useTitle";

const AdminBlogPostsPage = () => {
  useTitle("Blog Posts Management | Admin");
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<Blog | undefined>(undefined);

  const handleEdit = (blog: Blog) => {
    setCurrentBlog(blog);
    setIsEditorOpen(true);
  };

  const handleDelete = (id: string) => {
    // In a real application, this would be an API call
    setBlogs(blogs.filter((blog) => blog.id !== id));
    toast.success("Blog post deleted successfully");
  };

  const handleView = (id: string) => {
    // In a real application, this would navigate to the blog post page
    window.open(`/blog/${id}`, "_blank");
  };

  const handleSave = async (blogData: BlogFormData) => {
    // In a real application, this would be an API call
    try {
      if (blogData.id) {
        // Update existing blog
        setBlogs(
          blogs.map((blog) =>
            blog.id === blogData.id ? { ...blogData, id: blog.id } as Blog : blog
          )
        );
        toast.success("Blog post updated successfully");
      } else {
        // Create new blog
        const newBlog = {
          ...blogData,
          id: Math.random().toString(36).substring(2, 11),
        } as Blog;
        setBlogs([newBlog, ...blogs]);
        toast.success("Blog post created successfully");
      }
      setIsEditorOpen(false);
      setCurrentBlog(undefined);
    } catch (error) {
      toast.error("Failed to save blog post");
      console.error(error);
    }
  };

  const handleCancelEdit = () => {
    setIsEditorOpen(false);
    setCurrentBlog(undefined);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Blog Posts Management</h1>
            <p className="text-muted-foreground">
              Create, edit, and manage your blog posts
            </p>
          </div>
          <Button onClick={() => setIsEditorOpen(true)} className="whitespace-nowrap">
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
          <div className="bg-white rounded-lg shadow">
            {blogs.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                <FileText className="h-12 w-12 mx-auto text-gray-400" />
                <h2 className="mt-4 text-xl font-semibold">No blog posts yet</h2>
                <p className="text-muted-foreground mt-2">
                  Create your first blog post to get started
                </p>
                <Button
                  onClick={() => setIsEditorOpen(true)}
                  className="mt-4"
                  variant="outline"
                >
                  <Plus className="mr-2" />
                  Create Blog Post
                </Button>
              </div>
            ) : (
              <BlogsTable
                blogs={blogs}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminBlogPostsPage;
