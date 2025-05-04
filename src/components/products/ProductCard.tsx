
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Star } from "lucide-react"; // Import Star icon
import { Product } from "@/types/product";
import { useQuery } from "@tanstack/react-query"; // Import useQuery
import { fetchProductReviews } from "@/api/reviews"; // Import the API function
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton for loading state

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string, isWishlisted: boolean) => void;
  disabled?: boolean; // Optional prop to disable the button
}

const ProductCard = ({ product, isWishlisted, onToggleWishlist, disabled }: ProductCardProps) => {
  // Fetch review data for this product
  const { data: reviewData, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['product-reviews-summary', product.id],
    queryFn: () => fetchProductReviews(product.id),
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
    select: (data) => ({ // Select only the summary data needed for the card
      totalReviews: data.totalReviews,
      averageRating: data.averageRating,
    }),
  });

  const averageRating = reviewData?.averageRating || 0;
  const totalReviews = reviewData?.totalReviews || 0;

  return (
    <Card className="overflow-hidden card-hover flex flex-col">
      <CardHeader className="p-0 relative">
        <Link to={`/products/${product.id}`} className="block">
          <img
            src={product.image_url || product.image || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-48 object-cover transition-transform hover:scale-105"
          />
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {(product.is_new || product.isNew) && (
              <Badge className="bg-primary text-white">New</Badge>
            )}
            {(product.is_featured || product.isFeatured) && (
              <Badge className="bg-orange-500 text-white">Featured</Badge>
            )}
          </div>
        </Link>
      </CardHeader>
      <CardContent className="pt-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <Link to={`/products/${product.id}`} className="flex-grow">
            <h3 className="font-semibold text-lg hover:text-primary transition-colors leading-tight">
              {product.name}
            </h3>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full flex-shrink-0"
            onClick={() => onToggleWishlist(product.id, isWishlisted)}
            disabled={disabled}
          >
            <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
            <span className="sr-only">{isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}</span>
          </Button>
        </div>
        <div className="flex items-center gap-1 mb-2">
          {isLoadingReviews ? (
             <Skeleton className="h-4 w-20" />
          ) : (
            <>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(averageRating) ? "text-primary fill-primary" : "text-muted-foreground"
                  }`}
                />
              ))}
              <span className="text-sm text-muted-foreground ml-1">({totalReviews})</span>
            </>
          )}
        </div>
        <p className="text-muted-foreground text-sm line-clamp-2 h-10">{product.short_description || product.description || ""}</p>
      </CardContent>
      <CardFooter className="flex justify-center border-t border-border pt-4">
        <Link to={`/products/${product.id}`}>
          <Button size="sm">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
