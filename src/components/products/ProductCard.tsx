import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string, isWishlisted: boolean) => void;
  disabled?: boolean; // Optional prop to disable the button
}

const ProductCard = ({ product, isWishlisted, onToggleWishlist, disabled }: ProductCardProps) => {
  return (
    <Card className="overflow-hidden card-hover flex flex-col">
      <CardHeader className="p-0 relative">
        <Link to={`/products/${product.id}`} className="block">
          <img
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-48 object-cover transition-transform hover:scale-105"
          />
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {product.is_new && (
              <Badge className="bg-primary text-white">New</Badge>
            )}
            {product.is_featured && (
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
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              className={`h-4 w-4 ${
                i < Math.floor(product.rating || 0) ? "text-primary fill-primary" : "text-muted"
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 13.293l-4.364 2.563 1.11-5.327-3.95-3.571 5.302-.483L10 2.208l1.902 4.267 5.302.483-3.95 3.571 1.11 5.327z"
                clipRule="evenodd"
              />
            </svg>
          ))}
          <span className="text-sm text-muted-foreground ml-1">({product.review_count || 0})</span>
        </div>
        <p className="text-muted-foreground text-sm line-clamp-2 h-10">{product.short_description || product.description}</p>
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
