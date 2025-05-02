
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUserWishlist, removeProductFromWishlist, createShareableWishlist } from "@/api/wishlist";
import { Button } from "@/components/ui/button";
import { Trash2, Share2, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from 'sonner';
import { motion, AnimatePresence } from "framer-motion";

const WishlistPage = () => {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const { data: wishlistItems, isLoading, error } = useQuery({
    queryKey: ['userWishlist', user?.id],
    queryFn: () => fetchUserWishlist(user!.id),
    enabled: !!user?.id && !authLoading,
  });

  const removeMutation = useMutation({
    mutationFn: ({ userId, productId }: { userId: string, productId: string }) =>
      removeProductFromWishlist(userId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userWishlist', user?.id] });
      toast.success("Item removed from wishlist.");
      setDeletingItemId(null);
    },
    onError: (err) => {
      toast.error("Failed to remove item from wishlist.");
      console.error("Remove wishlist item error:", err);
      setDeletingItemId(null);
    },
  });

  const shareMutation = useMutation({
    mutationFn: (userId: string) => createShareableWishlist(userId),
    onSuccess: (shareId) => {
      const shareLink = `${window.location.origin}/wishlist/import/${shareId}`;
      navigator.clipboard.writeText(shareLink);
      toast.success("Shareable link copied to clipboard!", {
        description: shareLink,
        duration: 10000, // Keep toast visible longer
      });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create shareable link.");
      console.error("Share wishlist error:", err);
    },
  });

  const handleRemoveItem = (productId: string) => {
    if (user) {
      setDeletingItemId(productId);
      removeMutation.mutate({ userId: user.id, productId });
    }
  };

  const handleShareWishlist = () => {
    if (user) {
      shareMutation.mutate(user.id);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 border-t-2 border-primary rounded-full animate-spin"></div>
            <span className="ml-2">Loading authentication status...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto bg-card p-6 rounded-lg shadow-md text-center">
            <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
            <p className="mb-6 text-muted-foreground">Please log in to view and manage your wishlist.</p>
            <Button asChild size="lg" className="w-full">
              <Link to="/login">Login to View Wishlist</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 border-t-2 border-primary rounded-full animate-spin"></div>
            <span className="ml-2">Loading wishlist...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
          <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/30">
            <p className="text-destructive">Error loading wishlist: {(error as Error).message}</p>
            <Button variant="outline" className="mt-4" onClick={() => queryClient.invalidateQueries({ queryKey: ['userWishlist', user?.id] })}>
              Retry
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Wishlist</h1>
          {wishlistItems && wishlistItems.length > 0 && (
             <Button
               variant="outline"
               onClick={handleShareWishlist}
               disabled={shareMutation.isPending}
               className="hover:bg-accent/10 transition-colors"
             >
               <Share2 className="mr-2 h-4 w-4" />
               {shareMutation.isPending ? 'Generating Link...' : 'Share Wishlist'}
             </Button>
          )}
        </div>

        {wishlistItems && wishlistItems.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
            <AnimatePresence>
              {wishlistItems.map((item) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20, height: 0, marginBottom: 0, paddingBottom: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  layout
                  className={`bg-card rounded-lg shadow-sm overflow-hidden ${deletingItemId === item.product_id ? 'opacity-50' : ''}`}
                >
                  <div className="flex flex-col md:flex-row p-4 gap-4">
                    <Link to={`/products/${item.product_id}`} className="md:w-24">
                      <img
                        src={item.products?.image_url || "/placeholder.svg"}
                        alt={item.products?.name || "Product"}
                        className="w-full h-24 object-cover rounded-md"
                      />
                    </Link>
                    <div className="flex-1">
                      <Link to={`/products/${item.product_id}`} className="text-lg font-semibold hover:text-primary transition-colors">
                        {item.products?.name || "Product Name"}
                      </Link>
                      <p className="text-muted-foreground text-sm mt-1">
                        {item.products?.short_description || "No description available"}
                      </p>
                      <div className="mt-4 flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveItem(item.product_id)}
                          disabled={removeMutation.isPending && deletingItemId === item.product_id}
                          className="flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                        <Link to={`/products/${item.product_id}`}>
                          <Button variant="secondary" size="sm">
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-lg shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg mb-6">Your wishlist is empty.</p>
            <Button asChild>
              <Link to="/products">Browse Products</Link>
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WishlistPage;
