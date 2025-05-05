import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom"; // Import Link
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { fetchProductById } from "@/api/products";
import { addProductToWishlist, removeProductFromWishlist, fetchUserWishlist } from "@/api/wishlist";
import { fetchProductReviews, createProductRating, createProductReview, ProductReview } from "@/api/reviews"; // Import review APIs and types
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, ShoppingCart, Heart, Loader2 } from "lucide-react"; // Import Loader2
import { useAuth } from "@/contexts/AuthContext";
import { toast } from 'sonner';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

const ProductDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showAnimation, setShowAnimation] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviewContent, setReviewContent] = useState('');
  const [ratingScore, setRatingScore] = useState<number | null>(null);
  const productImgRef = useRef<HTMLImageElement>(null);

  const { data: product, isLoading: isLoadingProduct, error: productError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id as string),
    enabled: !!id,
  });

  const { data: userWishlist, isLoading: isLoadingWishlist } = useQuery({
    queryKey: ['userWishlist', user?.id],
    queryFn: () => fetchUserWishlist(user!.id),
    enabled: !!user?.id,
    select: (data) => data.map(item => item.product_id), // Select only product_ids
  });

  const { data: reviewData, isLoading: isLoadingReviews, error: reviewsError, refetch: refetchReviews } = useQuery({
    queryKey: ['product-reviews', id],
    queryFn: () => fetchProductReviews(id as string),
    enabled: !!id,
    staleTime: 1000 * 60, // Cache reviews for 1 minute
  });

  // Mutations for creating rating and review
  const createRatingMutation = useMutation({
    mutationFn: ({ productId, score }: { productId: string; score: number }) => createProductRating(productId, score),
    onSuccess: (ratingId) => {
      // If rating is successful, proceed to create the review if content exists
      if (reviewContent.trim()) {
        createReviewMutation.mutate({ productId: id as string, ratingId, content: reviewContent });
      } else {
         toast.success("Rating submitted!");
         // If only rating, just refetch reviews to update average/count
         refetchReviews();
      }
    },
    onError: (error) => {
      toast.error(`Failed to submit rating: ${error.message}`);
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: ({ productId, ratingId, content }: { productId: string; ratingId: string; content: string }) => createProductReview(productId, ratingId, content),
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      setReviewContent(''); // Clear the form
      setRatingScore(null);
      refetchReviews(); // Refetch reviews to show the new one
    },
    onError: (error) => {
      toast.error(`Failed to submit review: ${error.message}`);
    },
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
    } catch (err: any) {
      toast.error(`Failed to update wishlist: ${err.message}`);
      console.error("Wishlist update error:", err);
    }
  }, [isWishlisted, user, product, queryClient, navigate]);

  const handleReviewSubmit = useCallback(async () => {
    if (!user) {
      toast.info("Please log in to submit a review.");
      navigate('/login');
      return;
    }

    if (!id) return; // Should not happen

    if (ratingScore === null) {
      toast.warning("Please select a star rating.");
      return;
    }

    // Start the mutation process by creating the rating
    createRatingMutation.mutate({ productId: id, score: ratingScore });

  }, [user, id, ratingScore, reviewContent, createRatingMutation, createReviewMutation, navigate]);

  // Apply 3D animation effect when showAnimation changes
  useEffect(() => {
    if (!productImgRef.current) return;

    if (showAnimation) {
      // Add animation class
      productImgRef.current.style.transition = "transform 1.5s cubic-bezier(0.68, -0.55, 0.27, 1.55)";
      productImgRef.current.style.transform = "perspective(1000px) rotateY(360deg) scale(1.08) translateZ(50px)";

      // Add a shadow glow effect
      productImgRef.current.style.filter = "drop-shadow(0 0 15px rgba(111, 76, 255, 0.8))"; // Using primary accent color for glow
    } else {
      // Reset animation
      productImgRef.current.style.transform = "perspective(1000px) rotateY(0deg) scale(1) translateZ(0)";
      productImgRef.current.style.filter = "none";
    }
  }, [showAnimation]);

  const averageRating = reviewData?.averageRating || 0;
  const totalReviews = reviewData?.totalReviews || 0;

  if (isLoadingProduct || isLoadingWishlist || isLoadingReviews) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <div className="animate-pulse w-full">
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
             <div className="mt-12">
              <div className="h-8 w-48 bg-secondary rounded mb-6"></div>
              <div className="space-y-4">
                 {Array.from({ length: 3 }).map((_, i) => (
                   <div key={i} className="border border-border rounded-lg p-4 space-y-2">
                     <div className="flex items-center gap-3">
                       <div className="h-8 w-8 rounded-full bg-secondary"></div>
                       <div className="h-4 w-32 bg-secondary rounded"></div>
                     </div>
                     <div className="h-4 w-full bg-secondary rounded"></div>
                     <div className="h-4 w-5/6 bg-secondary rounded"></div>
                   </div>
                 ))}
              </div>
             </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (productError || reviewsError || !product) {
    const errorMessage = productError?.message || reviewsError?.message || "An unknown error occurred.";
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4 text-destructive">Error</h1>
            <p className="text-muted-foreground mb-6">{errorMessage}</p>
            <Button onClick={() => navigate('/products')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const isSubmitting = createRatingMutation.isPending || createReviewMutation.isPending;
  
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
            </div>
             {/* Rating and Review Count (Mobile and Desktop) */}
            <div className="flex items-center gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(averageRating) ? "text-primary fill-primary" : "text-muted-foreground"
                  }`}
                />
              ))}
              <span className="text-sm text-muted-foreground ml-2">
                ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
              </span>
            </div>
            <Separator className="my-6" />

            {/* Product Description */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Product Description</h3>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {product.detailed_description || product.short_description}
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
                   {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(averageRating) ? "text-primary fill-primary" : "text-muted-foreground"
                      }`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">{averageRating.toFixed(1)} ({totalReviews})</span>
                </div>
              </div>
            </div>

            {/* Desktop Purchase Button and Wishlist Button */}
            <div className="hidden sm:flex gap-4 mb-8">
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

        {/* Review Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Customer Reviews ({totalReviews})</h2>

          {/* Write a Review Form */}
          {user ? (
            <div className="border border-border rounded-lg p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
              <div className="mb-4">
                <Label htmlFor="rating" className="block text-sm font-medium text-muted-foreground mb-2">Your Rating</Label>
                <div className="flex items-center gap-1" id="rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 cursor-pointer transition-colors ${
                        ratingScore !== null && star <= ratingScore ? "text-primary fill-primary" : "text-muted-foreground"
                      }`}
                      onClick={() => setRatingScore(star)}
                    />
                  ))}
                </div>
              </div>
              <div className="mb-4">
                 <Label htmlFor="review" className="block text-sm font-medium text-muted-foreground mb-2">Your Review</Label>
                <Textarea
                  id="review"
                  placeholder="Share your thoughts on the product..."
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  rows={4}
                />
              </div>
              <Button onClick={handleReviewSubmit} disabled={isSubmitting}> {/* Disable if loading or no rating selected */}
                {isSubmitting ? (
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Submit Review
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-border rounded-lg mb-8">
               <p className="text-muted-foreground">Please <Link to="/login" className="text-primary hover:underline">log in</Link> to write a review.</p>
            </div>
          )}

          {/* List of Reviews */}
          {isLoadingReviews ? (
            <div className="space-y-4">
                 {Array.from({ length: 3 }).map((_, i) => (
                   <div key={i} className="border border-border rounded-lg p-4 space-y-2">
                     <div className="flex items-center gap-3">
                       <div className="h-8 w-8 rounded-full bg-secondary"></div>
                       <div className="h-4 w-32 bg-secondary rounded"></div>
                     </div>
                     <div className="h-4 w-full bg-secondary rounded"></div>
                     <div className="h-4 w-5/6 bg-secondary rounded"></div>
                   </div>
                 ))}
              </div>
          ) : totalReviews > 0 ? (
            <div className="space-y-6">
              {reviewData?.reviews.map((review) => (
                <div key={review.id} className="border border-border rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-10 w-10 mr-4">
                       <AvatarImage src={review.user.avatar} alt={review.user.name} />
                       <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{review.user.name}</p>
                      <div className="flex items-center gap-1">
                         {Array.from({ length: 5 }).map((_, i) => (
                           <Star
                             key={i}
                             className={`h-4 w-4 ${
                               i < Math.floor(review.score) ? "text-primary fill-primary" : "text-muted-foreground"
                             }`}
                           />
                         ))}
                         <span className="text-sm text-muted-foreground ml-1">{new Date(review.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{review.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-border rounded-lg">
              <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
            </div>
          )}
        </div>

        {/* Mobile floating purchase button and Wishlist Button */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-md border-t border-border flex gap-4 z-10">
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
