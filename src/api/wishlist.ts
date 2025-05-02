import { supabase } from "@/integrations/supabase/client";

export const addProductToWishlist = async (userId: string, productId: string) => {
  // Check if the product is already in the wishlist to avoid duplicates
  const { data: existingItem, error: fetchError } = await supabase
    .from('wishlist_products')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
    console.error("Error checking existing wishlist item:", fetchError);
    throw fetchError;
  }

  if (existingItem) {
    // Item already exists, no need to insert
    console.log("Product already in wishlist.");
    return existingItem; // Or null, depending on desired return for existing items
  }

  // If not exists, insert
  const { data, error } = await supabase
    .from('wishlist_products')
    .insert([
      { user_id: userId, product_id: productId }
    ])
    .select(); // Select the inserted row

  if (error) {
    console.error("Error adding product to wishlist:", error);
    throw error;
  }
  return data ? data[0] : null; // Return the inserted item
};

export const removeProductFromWishlist = async (userId: string, productId: string) => {
  const { error } = await supabase
    .from('wishlist_products')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) {
    console.error("Error removing product from wishlist:", error);
    throw error;
  }
  // For delete operations, typically no data is returned, just success/failure
};

export const fetchUserWishlist = async (userId: string) => {
  const { data, error } = await supabase
    .from('wishlist_products')
    .select('*, products(*)') // Select all from wishlist_products and join with products table
    .eq('user_id', userId);

  if (error) {
    console.error("Error fetching user wishlist:", error);
    throw error;
  }
  // Return the full wishlist entry including product details
  return data || [];
};

// New function to create a shareable wishlist link
export const createShareableWishlist = async (userId: string): Promise<string> => {
  // Fetch the user's current wishlist product IDs
  const { data: wishlistItems, error: fetchError } = await supabase
    .from('wishlist_products')
    .select('product_id')
    .eq('user_id', userId);

  if (fetchError) {
    console.error("Error fetching user wishlist for sharing:", fetchError);
    throw fetchError;
  }

  const productIds = wishlistItems.map(item => item.product_id);

  if (productIds.length === 0) {
      throw new Error("Your wishlist is empty. Cannot create a shareable link.");
  }

  // Insert the product IDs into the shared_wishlists table
  const { data: sharedData, error: insertError } = await supabase
    .from('shared_wishlists')
    .insert([
      { product_ids: productIds }
    ])
    .select('id'); // Select the generated ID

  if (insertError) {
    console.error("Error creating shareable wishlist entry:", insertError);
    throw insertError;
  }

  if (!sharedData || sharedData.length === 0) {
      throw new Error("Failed to create shareable wishlist ID.");
  }

  // Return the generated share ID
  return sharedData[0].id as string;
};

// New function to import a wishlist from a shareable link
export const importWishlist = async (userId: string, shareId: string): Promise<void> => {
  // Fetch the shared wishlist product IDs
  const { data: sharedWishlist, error: fetchError } = await supabase
    .from('shared_wishlists')
    .select('product_ids')
    .eq('id', shareId)
    .single();

  if (fetchError) {
    console.error("Error fetching shared wishlist:", fetchError);
    throw fetchError;
  }

  if (!sharedWishlist || !sharedWishlist.product_ids || sharedWishlist.product_ids.length === 0) {
    throw new Error("Shared wishlist not found or is empty.");
  }

  const sharedProductIds: string[] = sharedWishlist.product_ids;

  // Fetch the user's current wishlist product IDs
  const { data: userWishlistItems, error: fetchUserWishlistError } = await supabase
    .from('wishlist_products')
    .select('product_id')
    .eq('user_id', userId);

  if (fetchUserWishlistError && fetchUserWishlistError.code !== 'PGRST116') {
      console.error("Error fetching user's current wishlist:", fetchUserWishlistError);
      throw fetchUserWishlistError;
  }

  const currentUserProductIds = userWishlistItems ? userWishlistItems.map(item => item.product_id) : [];

  // Filter out products already in the user's wishlist
  const productIdsToImport = sharedProductIds.filter(
    productId => !currentUserProductIds.includes(productId)
  );

  if (productIdsToImport.length === 0) {
      console.log("All products from the shared wishlist are already in the user's wishlist.");
      // Optionally, throw a specific error or return a message indicating this
      return; 
  }

  // Prepare data for insertion
  const itemsToInsert = productIdsToImport.map(productId => ({
    user_id: userId,
    product_id: productId,
  }));

  // Insert new items into the user's wishlist
  const { error: insertError } = await supabase
    .from('wishlist_products')
    .insert(itemsToInsert);

  if (insertError) {
    console.error("Error importing wishlist items:", insertError);
    throw insertError;
  }

  console.log(`Successfully imported ${itemsToInsert.length} items.`);
};
