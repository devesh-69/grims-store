import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/products/ProductCard";
import BlogCard from "@/components/blog/BlogCard";
import { useQuery } from "@tanstack/react-query";
import { fetchFeaturedProducts } from "@/api/products";
import { blogs } from "@/data/blogs";
import { Loader2 } from "lucide-react";
import ThreeDHero from "@/components/hero/ThreeDHero";

const HomePage = () => {
  const { data: featuredProducts = [], isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: fetchFeaturedProducts
  });

  const latestBlogs = blogs.slice(0, 3);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 text-white">
        <ThreeDHero />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-6 animate-fade-in">
              Discover the Best Products for Your Lifestyle
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Honest reviews, expert recommendations, and exclusive deals on products we love.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button size="lg" className="w-full sm:w-auto">
                  Browse Products
                </Button>
              </Link>
              <Link to="/blog">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Read Our Blog
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Featured Products</h2>
            <Link to="/products" className="text-primary flex items-center hover:underline">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    description: product.short_description,
                    price: product.price,
                    originalPrice: product.original_price,
                    image: product.image_url || "/placeholder.svg",
                    category: product.category?.name || "",
                    isNew: product.is_new || false,
                    rating: product.rating || 0,
                    reviewCount: product.review_count || 0,
                    isFeatured: true,
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <h3 className="text-xl font-medium mb-2">No featured products</h3>
              <p className="text-muted-foreground">
                Visit the admin panel to feature some products.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Latest Blog Posts */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Latest Articles</h2>
            <Link to="/blog" className="text-primary flex items-center hover:underline">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="bg-secondary rounded-lg p-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Join Our Community
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Sign up to get personalized recommendations, save your favorite products, and participate in discussions.
            </p>
            <Link to="/register">
              <Button size="lg">Create an Account</Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
