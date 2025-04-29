
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import { Blog } from "@/types/blog";

interface BlogCardProps {
  blog: Blog;
}

const BlogCard = ({ blog }: BlogCardProps) => {
  return (
    <Card className="overflow-hidden card-hover">
      <CardHeader className="p-0">
        <Link to={`/blog/${blog.id}`} className="block relative">
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full h-48 object-cover transition-transform hover:scale-105"
          />
          {blog.category && (
            <Badge className="absolute bottom-2 left-2 bg-primary">
              {blog.category}
            </Badge>
          )}
        </Link>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <CalendarDays className="h-4 w-4" />
          <time dateTime={blog.date}>{new Date(blog.date).toLocaleDateString()}</time>
        </div>
        <Link to={`/blog/${blog.id}`}>
          <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-2">
            {blog.title}
          </h3>
        </Link>
        <p className="text-muted-foreground text-sm mt-2 line-clamp-3">
          {blog.excerpt}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between items-center border-t border-border pt-4">
        <div className="flex items-center">
          <img
            src={blog.author.avatar}
            alt={blog.author.name}
            className="h-8 w-8 rounded-full mr-2"
          />
          <span className="text-sm">{blog.author.name}</span>
        </div>
        <Link to={`/blog/${blog.id}`} className="text-sm text-primary hover:underline">
          Read More
        </Link>
      </CardFooter>
    </Card>
  );
};

export default BlogCard;
