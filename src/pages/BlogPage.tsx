
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import BlogCard from "@/components/blog/BlogCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { fetchPublishedBlogs } from "@/api/blogs";
import { Blog } from "@/types/blog";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const BlogPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch blogs using React Query
  const { data: blogs = [], isLoading, error } = useQuery({
    queryKey: ['blogs'],
    queryFn: fetchPublishedBlogs,
  });

  // Extract categories from blogs
  const categories = Array.from(
    new Set(blogs.filter(blog => blog.category).map((blog) => blog.category))
  );

  // Filter blogs
  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Our Blog</h1>
            <p className="text-muted-foreground">
              Expert guides, product reviews, and industry insights to help you make informed decisions.
            </p>
          </div>

          <div className="mb-8 flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                className="px-4 py-2 rounded-full bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  className="px-4 py-2 rounded-full bg-secondary/50 text-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-[250px]"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-lg overflow-hidden border border-border">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-5/6 mb-1" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <h3 className="text-xl font-medium mb-2 text-destructive">Error loading blogs</h3>
              <p className="text-muted-foreground">
                {(error as Error).message || "Something went wrong. Please try again later."}
              </p>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <h3 className="text-xl font-medium mb-2">No articles found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search to find articles.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default BlogPage;
