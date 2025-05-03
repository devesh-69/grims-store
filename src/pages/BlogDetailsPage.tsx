
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import Layout from "@/components/layout/Layout";
import { fetchBlogBySlug } from "@/api/blogs";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, User, Tag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const BlogDetailsPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: blog, isLoading, error } = useQuery({
    queryKey: ['blog', slug],
    queryFn: () => slug ? fetchBlogBySlug(slug) : null,
    enabled: !!slug,
  });

  // Set document title and meta description
  useEffect(() => {
    if (blog) {
      document.title = `${blog.title} | Blog`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', blog.excerpt);
      }
    }
    return () => {
      document.title = 'Blog';
    };
  }, [blog]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(-1)} 
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to blogs
            </Button>
            <Skeleton className="h-10 w-3/4 mb-4" />
            <div className="flex items-center mb-6">
              <Skeleton className="h-8 w-8 rounded-full mr-2" />
              <Skeleton className="h-4 w-32 mr-4" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-60 w-full rounded-lg mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !blog) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Blog not found</h1>
            <p className="text-muted-foreground mb-6">
              {error ? (error as Error).message : "This blog post doesn't exist or may have been removed."}
            </p>
            <Button onClick={() => navigate('/blog')}>
              Go back to all blogs
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/blog')} 
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to blogs
          </Button>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mb-8 text-muted-foreground">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border border-border">
                <img 
                  src={blog.author.avatar} 
                  alt={blog.author.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {blog.author.name}
              </span>
            </div>
            
            <span className="flex items-center">
              <CalendarDays className="h-4 w-4 mr-1" />
              {format(new Date(blog.date), 'MMMM d, yyyy')}
            </span>
            
            {blog.category && (
              <span className="flex items-center">
                <Tag className="h-4 w-4 mr-1" />
                <Badge variant="secondary">{blog.category}</Badge>
              </span>
            )}
          </div>

          <div className="mb-10 rounded-lg overflow-hidden">
            <img 
              src={blog.coverImage} 
              alt={blog.title} 
              className="w-full h-auto object-cover"
            />
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            {/* Render blog content - for now, just use dangerouslySetInnerHTML */}
            <div 
              dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br />') }} 
            />
          </div>
        </div>
      </article>
    </Layout>
  );
};

export default BlogDetailsPage;
