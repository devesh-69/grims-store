import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { importWishlist } from "@/api/wishlist";
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const ImportWishlistPage = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const importMutation = useMutation({
    mutationFn: ({ userId, shareId }: { userId: string, shareId: string }) =>
      importWishlist(userId, shareId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userWishlist', user?.id] });
      toast.success("Wishlist imported successfully!");
      navigate('/wishlist');
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to import wishlist.");
      console.error("Import wishlist error:", err);
      // Optionally redirect to wishlist page even on error, or show an error page
      navigate('/wishlist'); 
    },
  });

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        // If not logged in, redirect to login with a message
        toast.info("Please log in to import the wishlist.");
        navigate('/login');
      } else if (shareId) {
        // If logged in and shareId is available, trigger the import mutation
        importMutation.mutate({ userId: user.id, shareId });
      }
    }
  }, [user, authLoading, shareId, navigate, importMutation]);

  // Show loading state while authenticating or importing
  if (authLoading || importMutation.isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Importing wishlist...</p>
        </div>
      </Layout>
    );
  }

   // If user is null after auth loading, they were redirected to login
   // The useEffect handles the redirect and toast message.
   // We can render a placeholder or nothing here as the redirect will happen.
   // If shareId is missing but user is logged in (shouldn't happen via the share link flow), 
   // we could show an error or redirect.
  if (!shareId) {
       return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Share Link</h1>
          <p>The wishlist share link is missing the necessary information.</p>
           <Button asChild className="mt-4">
            <Link to="/wishlist">Go to my Wishlist</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  // If we reach here, it means the useEffect logic is running
  // or has finished. The mutations handle their own loading/error states and redirects.
  // We can return a minimal loading/processing indicator.
  return (
       <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
           <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
           <p>Processing import...</p>
        </div>
      </Layout>
  );
};

export default ImportWishlistPage;
