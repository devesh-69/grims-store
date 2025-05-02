import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { fetchUserWishlist, removeProductFromWishlist, createShareableWishlist } from "@/api/wishlist";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Trash2, Share2 } from "lucide-react"; // Import Share2 icon
import { Link } from "react-router-dom";
import { toast } from 'sonner';

const WishlistPage = () => {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

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
    },
    onError: (err) => {
      toast.error("Failed to remove item from wishlist.");
      console.error("Remove wishlist item error:", err);
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
          <p>Loading authentication status...</p>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
          <p>Please log in to view your wishlist.</p>
          <Button asChild className="mt-4">
            <Link to="/login">Login</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
          <p>Loading wishlist...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
          <p>Error loading wishlist: {(error as Error).message}</p>
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
               disabled={shareMutation.isLoading}
             >
               <Share2 className="mr-2 h-4 w-4" />
               {shareMutation.isLoading ? 'Generating Link...' : 'Share Wishlist'}
             </Button>
          )}
        </div>

        {wishlistItems && wishlistItems.length > 0 ? (
          <div className="space-y-6">
            {wishlistItems.map((item) => (
              <div key={item.product.id} className="flex items-center space-x-4 border-b pb-4 last:border-b-0 last:pb-0">
                <Link to={`/products/${item.product.id}`}>
                  <img
                    src={item.product.image_url || "/placeholder.svg"}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                </Link>
                <div className="flex-1">
                  <Link to={`/products/${item.product.id}`} className="text-lg font-semibold hover:underline">
                    {item.product.name}
                  </Link>
                  <p className="text-muted-foreground text-sm">{item.product.short_description}</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleRemoveItem(item.product_id)}
                  disabled={removeMutation.isLoading}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p>Your wishlist is empty.</p>
        )}
      </div>
    </Layout>
  );
};

export default WishlistPage; 