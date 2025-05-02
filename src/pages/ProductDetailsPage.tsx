import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchProductById } from "@/api/products";
import { addProductToWishlist, removeProductFromWishlist, fetchUserWishlist } from "@/api/wishlist";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, ShoppingCart, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from 'sonner';

const ProductDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showAnimation, setShowAnimation] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const productImgRef = useRef<HTMLImageElement>(null);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id as string),
    enabled: !!id,
  });

  const { data: userWishlist, isLoading: isLoadingWishlist } = useQuery({
    queryKey: ['userWishlist', user?.id],
    queryFn: () => fetchUserWishlist(user!.id),
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (userWishlist && product) {
      setIsWishlisted(userWishlist.includes(product.id));
    }
  }, [userWishlist, product]);

  const handlePurchase = () => {
    setShowAnimation(true);

    // Reset animation after it completes
    setTimeout(() => {
      setShowAnimation(false);
    }, 2000);
  };

  const handleToggleWishlist = useCallback(async () => {
    if (!user) {
      toast.info("Please log in to add items to your wishlist.");
      navigate('/login');
      return;
    }

    if (!product) return; // Should not happen if button is visible, but good practice

    try {
      if (isWishlisted) {
        await removeProductFromWishlist(user.id, product.id);
        toast.success("Removed from wishlist");
        setIsWishlisted(false);
      } else {
        await addProductToWishlist(user.id, product.id);
        toast.success("Added to wishlist");
        setIsWishlisted(true);
      }
      // Invalidate the wishlist query to refetch the latest state
      queryClient.invalidateQueries({ queryKey: ['userWishlist', user.id] });
    } catch (err) {
      toast.error("Failed to update wishlist.");
      console.error("Wishlist update error:", err);
    }
  }, [isWishlisted, user, product, queryClient, navigate]);

  // Apply 3D animation effect when showAnimation changes
  useEffect(() => {
    if (!productImgRef.current) return;

    if (showAnimation) {
      // Add animation class
      productImgRef.current.style.transition = "transform 1.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)";
      productImgRef.current.style.transform = "perspective(1000px) rotateY(360deg) scale(1.08) translateZ(50px)";

      // Add a shadow glow effect
      productImgRef.current.style.filter = "drop-shadow(0 0 15px rgba(111, 76, 255, 0.8))";
    } else {
      // Reset animation
      productImgRef.current.style.transform = "perspective(1000px) rotateY(0deg) scale(1) translateZ(0)";
      productImgRef.current.style.filter = "none";
    }
  }, [showAnimation]);

  if (isLoading || isLoadingWishlist) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-secondary rounded mb-8"></div>
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-1/2 h-96 bg-secondary rounded"></div>
              <div className="w-full md:w-1/2 space-y-4">
                <div className="h-8 w-full bg-secondary rounded"></div>
                <div className="h-6 w-36 bg-secondary rounded"></div>
                <div className="h-4 w-full bg-secondary rounded"></div>
                <div className="h-4 w-full bg-secondary rounded"></div>
                <div className="h-4 w-3/4 bg-secondary rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/products')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-12">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/products')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Product Image with 3D animation */}
          <div className="w-full md:w-1/2 overflow-hidden rounded-lg">
            <div className={`relative ${showAnimation ? 'bg-gradient-to-r from-purple-500/10 to-purple-800/10 rounded-lg p-2' : ''}`}>
              <img
                ref={productImgRef}
                src={product.image_url || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-auto object-cover rounded-lg transition-all duration-500"
                style={{
                  transformStyle: "preserve-3d",
                  backfaceVisibility: "hidden"
                }}
              />
              {product.is_new && (
                <Badge className="absolute top-4 left-4 bg-primary">New</Badge>
              )}
              {product.is_featured && (
                <Badge className="absolute top-4 right-4 bg-orange-500">Featured</Badge>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="w-full md:w-1/2">
            {/* Title row - visible on sm screens and up */}
            <div className="hidden sm:block mb-4">
              <h1 className="text-3xl font-bold">{product.name}</h1>
            </div>

            {/* Mobile header with title and purchase button (visible only on smallest screens) */}
            <div className="sm:hidden flex justify-between items-start mb-6 flex-wrap">
              <h1 className="text-2xl font-bold">{product.name}</h1>

              {/* Rating */}
              <div className="flex gap-1 flex-shrink-0 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.floor(product.rating || 0) ? "text-primary fill-primary" : "text-muted"
                      }`}
                  />
                ))}
                <span className="text-sm text-muted-foreground ml-2">
                  ({product.review_count || 0} reviews)s
                </span>
              </div>
            </div>
            <Separator className="my-6" />

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p className="text-base text-foreground leading-relaxed">{product.description || product.short_description}</p>
              </div>
            </div>

            {/* Product Metadata - 3 columns on desktop, 2 on mobile */}
            <div className="mb-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="border border-border rounded-lg p-4">
                <span className="text-sm text-muted-foreground">Category</span>
                <p className="font-medium">{product.category?.name || "Uncategorized"}</p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <span className="text-sm text-muted-foreground">Status</span>
                <p className="font-medium">
                  {product.is_new ? "New Arrival" : "Regular Item"}
                </p>
              </div>
              <div className="border border-border rounded-lg p-4 sm:col-span-1 col-span-2">
                <span className="text-sm text-muted-foreground">Rating</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-primary fill-primary" />
                  <span>{product.rating || 0} ({product.review_count || 0})</span>
                </div>
              </div>
            </div>

            {/* Desktop Purchase Button and Wishlist Button */}
            <div className="hidden sm:flex gap-4">
              <Button
                size="lg"
                className={`
                  w-auto py-6 text-lg font-semibold 
                  transition-all duration-300 hover:scale-105
                  ${showAnimation ? 'bg-gradient-to-r from-purple-600 to-purple-800 shadow-lg shadow-purple-500/50' : ''}
                `}
                onClick={handlePurchase}
              >
                <ShoppingCart className={`mr-2 h-5 w-5 ${showAnimation ? 'animate-bounce' : ''}`} />
                Purchase Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-auto py-6 text-lg font-semibold transition-all duration-300 hover:scale-105"
                onClick={handleToggleWishlist}
                disabled={isLoadingWishlist} // Disable button while loading wishlist status
              >
                <Heart className={`mr-2 h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile floating purchase button and Wishlist Button */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border flex gap-4">
          <Button
            size="lg"
            className={`
              flex-1 py-4 text-md font-semibold 
              transition-all duration-300 hover:scale-105
              ${showAnimation ? 'bg-gradient-to-r from-purple-600 to-purple-800 shadow-lg shadow-purple-500/50' : ''}
            `}
            onClick={handlePurchase}
          >
            <ShoppingCart className={`mr-2 h-5 w-5 ${showAnimation ? 'animate-bounce' : ''}`} />
            Purchase Now
          </Button>
           <Button
            variant="outline"
            size="lg"
            className="flex-1 py-4 text-md font-semibold transition-all duration-300 hover:scale-105"
            onClick={handleToggleWishlist}
            disabled={isLoadingWishlist} // Disable button while loading wishlist status
          >
            <Heart className={`mr-2 h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
            {isWishlisted ? 'Remove' : 'Wishlist'}
          </Button>
        </div>

        {/* Extra padding at the bottom on mobile to account for the fixed button */}
        <div className="sm:hidden h-20"></div>
      </div>
    </Layout>
  );
};

export default ProductDetailsPage; 