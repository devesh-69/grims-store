import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ProductOrderUpdate } from "@/types/product";

export interface ProductFormData {
  name: string;
  category_id: string;
  short_description: string;
  detailed_description?: string;
  price?: number;
  original_price?: number;
  image_url?: string;
  is_featured?: boolean;
}

export interface Product {
  id: string;
  name: string;
  category_id: string;
  category?: {
    id: string;
    name: string;
  };
  short_description: string;
  detailed_description?: string;
  price?: number;
  original_price?: number;
  image_url?: string;
  is_featured?: boolean;
  is_new?: boolean;
  rating?: number;
  review_count?: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  display_order?: number;
}

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        category: categories(id, name)
      `)
      .order("display_order", { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error: any) {
    toast.error(`Error fetching products: ${error.message}`);
    return [];
  }
};

export const fetchFeaturedProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        category: categories(id, name)
      `)
      .eq("is_featured", true)
      .order("display_order", { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error: any) {
    toast.error(`Error fetching featured products: ${error.message}`);
    return [];
  }
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        category: categories(id, name)
      `)
      .eq("id", id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error: any) {
    toast.error(`Error fetching product: ${error.message}`);
    return null;
  }
};

export const fetchProduct = fetchProductById;

export const createProduct = async (productData: ProductFormData): Promise<Product | null> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("User not authenticated");

    // Get the highest display_order value to ensure new products are added at the end
    const { data: products } = await supabase
      .from("products")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1);

    const lastProduct = products && products.length > 0 ? products[0] : null;
    const newDisplayOrder = lastProduct?.display_order ? lastProduct.display_order + 1 : 1;

    const { data, error } = await supabase
      .from("products")
      .insert({
        ...productData,
        created_by: userData.user.id,
        display_order: newDisplayOrder
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success("Product created successfully");
    return data;
  } catch (error: any) {
    toast.error(`Error creating product: ${error.message}`);
    return null;
  }
};

export const updateProduct = async (id: string, productData: Partial<ProductFormData>): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .update(productData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success("Product updated successfully");
    return data;
  } catch (error: any) {
    toast.error(`Error updating product: ${error.message}`);
    return null;
  }
};

export const updateProductOrder = async (updates: ProductOrderUpdate[]): Promise<boolean> => {
  try {
    // We'll use a transaction to update all products at once
    const updatePromises = updates.map(update => 
      supabase
        .from("products")
        .update({ display_order: update.display_order })
        .eq("id", update.id)
    );
    
    await Promise.all(updatePromises);
    
    return true;
  } catch (error: any) {
    toast.error(`Error updating product order: ${error.message}`);
    return false;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    toast.success("Product deleted successfully");
    return true;
  } catch (error: any) {
    toast.error(`Error deleting product: ${error.message}`);
    return false;
  }
};

export const fetchCategories = async () => {
  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error: any) {
    toast.error(`Error fetching categories: ${error.message}`);
    return [];
  }
};

export const uploadProductImage = async (file: File, userId: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from('product_images')
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from('product_images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error: any) {
    toast.error(`Error uploading image: ${error.message}`);
    return null;
  }
};
