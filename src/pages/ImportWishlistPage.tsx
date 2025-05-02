import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { importWishlist } from "@/api/wishlist";
import { toast } from 'sonner';
import { Loader2 } from "lucide-react";

const ImportWishlistPage = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const importMutation = useMutation({
    mutationFn: ({ userId, shareId }: { userId: string, shareId: string }) =>
      importWishlist(userId, shareId),
    onSuccess: () => {
      toast.success("Wishlist imported successfully!");
      navigate('/wishlist');
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to import wishlist.");
      console.error("Import wishlist error:", err);
      navigate('/wishlist'); // Redirect even on error
    },
  });

  useEffect(() => {
    // Only attempt to import if user is logged in and we have a shareId
    if (user && shareId && !authLoading && !importMutation.isLoading) {
      importMutation.mutate({ userId: user.id, shareId });
    } else if (!user && !authLoading) {
        // If auth loading is complete and no user, redirect to login
        toast.info("Please log in to import a wishlist.");
        navigate('/login');
    } else if (!shareId) {
        // If no shareId in URL, redirect to main wishlist or home
        toast.error("Invalid share link.");
        navigate('/wishlist'); // Or navigate('/')
    }
  }, [user, shareId, authLoading, navigate, importMutation.mutate, importMutation.isLoading]); // Added importMutation.isLoading to deps

  // Show a loading state while authentication or import is in progress
  if (authLoading || importMutation.isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <p>Importing wishlist...</p>
        </div>
      </Layout>
    );
  }

  // If not loading and no user, the effect would have redirected to login
  // If not loading and user exists, the effect handles mutation and redirection
  // This component mainly serves as a redirect handler and loading screen.
  return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
           <p>Processing your wishlist import...</p>
        </div>
      </Layout>
  );
};

export default ImportWishlistPage;
