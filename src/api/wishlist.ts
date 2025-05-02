import { supabase } from "@/integrations/supabase/client";

export const addProductToWishlist = async (userId: string, productId: string) => {
  // Check if the item is already wishlisted to prevent duplicates
  const { data: existingItem, error: fetchError } = await supabase
    .from('wishlist_products')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine
    console.error("Error checking existing wishlist item:", fetchError);
    throw fetchError;
  }

  if (existingItem) {
    // Item already exists, do not insert
    console.log("Product already in wishlist");
    return null; // Indicate that no new item was added
  }

  // Insert the new wishlist item
  const { data, error } = await supabase
    .from('wishlist_products')
    .insert([
      { user_id: userId, product_id: productId }
    ])
    .select(); // Select the inserted data

  if (error) {
    console.error("Error adding product to wishlist:", error);
    throw error;
  }
  return data;
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
  // No data is typically returned on delete, just check for error
  return true; // Indicate success
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

// Function to create a shareable wishlist link
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
      // Return a specific indicator or throw a distinct error for empty wishlist
      // Throwing an error might be better to handle in the UI
      throw new Error("Your wishlist is empty. Cannot create a shareable link.");
  }

  // Insert the product IDs into the shared_wishlists table
  const { data: sharedData, error: insertError } = await supabase
    .from('shared_wishlists')
    .insert([
      { user_id: userId, product_ids: productIds } // Include user_id
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

// Function to import a wishlist from a shareable link
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

  const sharedProductIds: string[] = sharedWishlist.product_ids as string[]; // Cast to string array

  // Fetch the user's current wishlist product IDs to avoid duplicates
  const { data: userWishlistItems, error: fetchUserWishlistError } = await supabase
    .from('wishlist_products')
    .select('product_id')
    .eq('user_id', userId);

  if (fetchUserWishlistError) {
    console.error("Error fetching user wishlist during import:", fetchUserWishlistError);
    throw fetchUserWishlistError;
  }

  const currentUserProductIds = userWishlistItems?.map(item => item.product_id) || [];

  // Filter out product IDs that are already in the user's wishlist
  const productIdsToImport = sharedProductIds.filter(
    (productId) => !currentUserProductIds.includes(productId)
  );

  if (productIdsToImport.length === 0) {
      console.log("All products from shared wishlist are already in the user's wishlist.");
      return; // Nothing to import
  }

  // Prepare data for insertion
  const insertData = productIdsToImport.map(productId => ({
      user_id: userId,
      product_id: productId
  }));

  // Insert the new wishlist items
  const { error: insertError } = await supabase
    .from('wishlist_products')
    .insert(insertData);

  if (insertError) {
    console.error("Error importing wishlist items:", insertError);
    throw insertError;
  }

  console.log(`Successfully imported ${insertData.length} items.`);
};
