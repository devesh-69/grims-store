
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

// Define types for the API response and combined review data
export type ProductReview = {
  id: string;
  content: string;
  date: string;
  score: number;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
};

export type ProductReviewsApiResponse = {
  totalReviews: number;
  averageRating: number;
  reviews: ProductReview[];
};

/**
 * Fetches reviews, average rating, and total count for a specific product.
 * @param productId The ID of the product.
 * @returns An object containing totalReviews, averageRating, and a list of reviews.
 */
export const fetchProductReviews = async (productId: string): Promise<ProductReviewsApiResponse> => {
  // Fetch the list of reviews with user and rating information
  const reviewsQuery = await supabase
    .from('reviews')
    .select(`
      id,
      content,
      created_at,
      rating_id,
      user_id,
      product_id
    `)
    .eq('product_id', productId)
    .order('created_at', { ascending: false });
    
  if (reviewsQuery.error) {
    console.error('Error fetching reviews:', reviewsQuery.error);
    throw reviewsQuery.error;
  }
  
  const reviewsData = reviewsQuery.data;
  
  // Fetch ratings separately
  const ratingsQuery = await supabase
    .from('ratings')
    .select('id, score, user_id')
    .eq('product_id', productId);
    
  if (ratingsQuery.error) {
    console.error('Error fetching ratings:', ratingsQuery.error);
    throw ratingsQuery.error;
  }
  
  const ratingsData = ratingsQuery.data;
  
  // Fetch user profiles
  const userIds = [...new Set([
    ...reviewsData.map(review => review.user_id),
    ...ratingsData.map(rating => rating.user_id)
  ])];
  
  const profilesQuery = await supabase
    .from('profiles')
    .select('id, first_name, last_name, avatar_url')
    .in('id', userIds);
    
  if (profilesQuery.error) {
    console.error('Error fetching profiles:', profilesQuery.error);
    throw profilesQuery.error;
  }
  
  const profilesData = profilesQuery.data;
  
  // Calculate average rating
  const totalReviews = ratingsData.length;
  const averageRating = totalReviews > 0 
    ? ratingsData.reduce((sum, rating) => sum + rating.score, 0) / totalReviews 
    : 0;

  // Combine the data to form complete reviews
  const reviews: ProductReview[] = reviewsData.map(review => {
    const rating = ratingsData.find(r => r.id === review.rating_id);
    const profile = profilesData.find(p => p.id === review.user_id);
    
    return {
      id: review.id,
      content: review.content,
      date: review.created_at,
      score: rating?.score || 0,
      user: {
        id: profile?.id || '',
        name: `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Anonymous',
        avatar: profile?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous'
      }
    };
  });

  return {
    totalReviews,
    averageRating,
    reviews,
  };
};

/**
 * Creates a new rating for a product. Requires authentication.
 * @param productId The ID of the product.
 * @param score The rating score (1-5).
 * @returns The ID of the newly created rating.
 */
export const createProductRating = async (productId: string, score: number): Promise<string> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated.');
  }

  if (score < 1 || score > 5) {
    throw new Error('Rating score must be between 1 and 5.');
  }

  // Check if user already rated this product
  const { data: existingRating } = await supabase
    .from('ratings')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single();

  if (existingRating) {
    // Update existing rating
    const { error } = await supabase
      .from('ratings')
      .update({ score })
      .eq('id', existingRating.id);

    if (error) {
      console.error('Error updating rating:', error);
      throw error;
    }
    
    return existingRating.id;
  }

  // Create new rating
  const ratingData = {
    user_id: user.id,
    product_id: productId,
    score: score,
  };

  const { data, error } = await supabase
    .from('ratings')
    .insert(ratingData)
    .select('id')
    .single();

  if (error) {
    console.error('Error creating rating:', error);
    throw error;
  }

  return data.id;
};

/**
 * Creates a new text review for a product, linked to an existing rating. Requires authentication.
 * @param productId The ID of the product.
 * @param ratingId The ID of the associated rating.
 * @param content The review text.
 */
export const createProductReview = async (productId: string, ratingId: string, content: string): Promise<void> => {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('User not authenticated.');
  }

  if (!content.trim()) {
    throw new Error('Review content cannot be empty.');
  }

  // Check if a review already exists for this rating
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('rating_id', ratingId)
    .single();

  if (existingReview) {
    // Update existing review
    const { error } = await supabase
      .from('reviews')
      .update({ content: content.trim() })
      .eq('id', existingReview.id);

    if (error) {
      console.error('Error updating review:', error);
      throw error;
    }
    
    return;
  }

  // Create new review
  const reviewData = {
    user_id: user.id,
    product_id: productId,
    rating_id: ratingId,
    content: content.trim(),
  };

  const { error } = await supabase
    .from('reviews')
    .insert(reviewData);

  if (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};
