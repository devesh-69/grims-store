import { useState, useCallback } from "react";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/products/ProductCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProducts, fetchCategories } from "@/api/products";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUserWishlist, addProductToWishlist, removeProductFromWishlist } from "@/api/wishlist";
import { toast } from 'sonner';

const ProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filtersVisible, setFiltersVisible] = useState(false);

  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts
  });

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  const { data: userWishlist = [], isLoading: loadingWishlist } = useQuery({
    queryKey: ['userWishlist', user?.id],
    queryFn: () => fetchUserWishlist(user!.id),
    enabled: !!user?.id && !authLoading,
    select: (data) => data.map(item => item.product_id), // Select only product_ids
  });

  const addWishlistMutation = useMutation({
    mutationFn: ({ userId, productId }: { userId: string, productId: string }) =>
      addProductToWishlist(userId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userWishlist', user?.id] });
      toast.success("Added to wishlist");
    },
    onError: (err) => {
      toast.error("Failed to add to wishlist.");
      console.error("Add wishlist item error:", err);
    },
  });

  const removeWishlistMutation = useMutation({
    mutationFn: ({ userId, productId }: { userId: string, productId: string }) =>
      removeProductFromWishlist(userId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userWishlist', user?.id] });
      toast.success("Removed from wishlist");
    },
    onError: (err) => {
      toast.error("Failed to remove from wishlist.");
      console.error("Remove wishlist item error:", err);
    },
  });

  const handleToggleWishlist = useCallback(async (productId: string, isWishlisted: boolean) => {
    if (!user) {
      toast.info("Please log in to add items to your wishlist.");
      return;
    }

    if (isWishlisted) {
      removeWishlistMutation.mutate({ userId: user.id, productId });
    } else {
      addWishlistMutation.mutate({ userId: user.id, productId });
    }
  }, [user, addWishlistMutation, removeWishlistMutation]);

  // Filter products
  const filteredProducts = products.filter((product) => {
    // Search term filter
    const matchesSearchTerm = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) || 
      (product.short_description || '').toLowerCase().includes(searchTerm.toLowerCase()); // Handle null/undefined short_description

    // Category filter
    const matchesCategory = selectedCategory === "all" || product.category_id === selectedCategory;

    return matchesSearchTerm && matchesCategory;
  });

  // Sort products - featured products first, then by display_order
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    // Featured products first
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    
    // Then by display_order if available
    if (a.display_order != null && b.display_order != null) { // Check for null/undefined
      return a.display_order - b.display_order;
    }
    
    // Fallback to created_at
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime(); // Latest first for fallback
  });

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
  };

  return (
    <Layout>
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            {/* Mobile filter toggle */}
            <div className="w-full md:hidden mb-4">
              <Button 
                variant="outline" 
                onClick={() => setFiltersVisible(!filtersVisible)}
                className="w-full flex items-center justify-center"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                {filtersVisible ? "Hide Filters" : "Show Filters"}
              </Button>
            </div>

            {/* Filters sidebar */}
            <div 
              className={`w-full md:w-1/4 lg:w-1/5 space-y-6 ${
                filtersVisible ? "block" : "hidden md:block"
              }`}
            >
              <div>
                <h2 className="text-lg font-semibold mb-4">Filters</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetFilters}
                  className="flex items-center text-muted-foreground mb-4"
                >
                  <X className="mr-1 h-3 w-3" />
                  Clear all filters
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {loadingCategories ? (
                        <SelectItem value="loading" disabled>Loading...</SelectItem>
                      ) : (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Products grid */}
            <div className="w-full md:w-3/4 lg:w-4/5">
              <div className="flex flex-col sm:flex-row justify-between mb-6 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold">All Products</h1>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-[250px]"
                  />
                </div>
              </div>

              {loadingProducts || loadingWishlist ? (
                <div className="flex justify-center items-center py-24">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : sortedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product}
                      isWishlisted={userWishlist.includes(product.id)}
                      onToggleWishlist={handleToggleWishlist}
                      disabled={addWishlistMutation.isPending || removeWishlistMutation.isPending}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-border rounded-lg">
                  <h3 className="text-xl font-medium mb-2">No products found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search or filters to find products.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ProductsPage;
