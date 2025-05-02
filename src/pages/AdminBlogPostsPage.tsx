
import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Blog } from "@/types/blog";
import { blogs as initialBlogs } from "@/data/blogs"; // Assuming this is your local data source
import { BlogsTable } from "@/components/blog/BlogsTable";
import { BlogEditor } from "@/components/blog/BlogEditor";
import { BlogFormData } from "@/types/blog-admin";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Search } from "lucide-react";
import { toast } from "sonner";
import { useTitle } from "@/hooks/useTitle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // Import Input for the search bar

const AdminBlogPostsPage = () => {
  useTitle("Blog Posts Management | Admin");
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<Blog | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term

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
          // Add default values for missing Blog properties if needed
          date: new Date().toISOString(), // Example default date
          author: { name: "Admin", avatar: "/placeholder-avatar.jpg" }, // Example default author
          excerpt: blogData.content?.substring(0, 150) || "", // Use content instead of detailedDescription
          coverImage: "/placeholder.svg", // Example default image
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

  // Filter blogs based on search term (moved from BlogsTable)
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
          <Button onClick={() => setIsEditorOpen(true)} className="whitespace-nowrap bg-primary text-primary-foreground hover:bg-primary/90">
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
          <Card className="bg-background rounded-lg shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground">Blog Posts</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search blogs..."
                    className="pl-10  text-foreground border-border shadow-sm bg-secondary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {filteredBlogs.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-border rounded-lg bg-background">
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
