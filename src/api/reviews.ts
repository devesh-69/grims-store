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
  const { data: reviewsData, error: reviewsError } = await supabase
    .from('reviews')
    .select(
      `
      id,
      content,
      created_at,
      ratings!inner ( score ),
      profiles!inner ( id, first_name, last_name, avatar_url )
      `
    )
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (reviewsError) {
    console.error('Error fetching reviews:', reviewsError);
    throw reviewsError;
  }

  // Fetch the aggregate rating data (count and average)
  const { data: ratingsData, error: ratingsError, count } = await supabase
    .from('ratings')
    .select('score', { count: 'exact' })
    .eq('product_id', productId);

  if (ratingsError) {
    console.error('Error fetching ratings aggregate:', ratingsError);
    // Proceed with reviews data even if ratings aggregate fails, setting count/avg to 0
    return {
      totalReviews: 0,
      averageRating: 0,
      reviews: reviewsData.map((review) => ({
        id: review.id,
        content: review.content,
        date: review.created_at,
        score: (review.ratings as { score: number }).score,
        user: {
          id: (review.profiles as { id: string }).id,
          name: `${(review.profiles as { first_name: string; last_name: string }).first_name || ''} ${(review.profiles as { first_name: string; last_name: string }).last_name || ''}`.trim() || 'Anonymous',
          avatar: (review.profiles as { avatar_url: string }).avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous', // Default avatar
        },
      })),
    };
  }

  const totalReviews = count || 0;
  const averageRating = ratingsData ? ratingsData.reduce((sum, rating) => sum + rating.score, 0) / ratingsData.length || 0 : 0;


  const reviews: ProductReview[] = reviewsData.map((review) => ({
    id: review.id,
    content: review.content,
    date: review.created_at,
    score: (review.ratings as { score: number }).score, // Type assertion for nested data
    user: {
      id: (review.profiles as { id: string }).id, // Type assertion
      name: `${(review.profiles as { first_name: string; last_name: string }).first_name || ''} ${(review.profiles as { first_name: string; last_name: string }).last_name || ''}`.trim() || 'Anonymous',
      avatar: (review.profiles as { avatar_url: string }).avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=anonymous', // Default avatar
    },
  }));

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

  const ratingData: TablesInsert<'ratings'> = {
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

  const reviewData: TablesInsert<'reviews'> = {
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
