
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import BlogCard from "@/components/blog/BlogCard";
import { blogs } from "@/data/blogs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const BlogPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>

          {filteredBlogs.length === 0 && (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <h3 className="text-xl font-medium mb-2">No articles found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search to find articles.
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default BlogPage;
