
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminNav from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchProduct, updateProduct, fetchCategories, uploadProductImage, ProductFormData } from "@/api/products";
import { useAuth } from "@/contexts/AuthContext";

const AdminEditProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<Omit<ProductFormData, 'price' | 'original_price'>>({
    name: "",
    category_id: "",
    short_description: "",
    detailed_description: "",
    image_url: "",
    is_featured: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: product, isLoading: loadingProduct } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id!),
    enabled: !!id
  });

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        category_id: product.category_id,
        short_description: product.short_description,
        detailed_description: product.detailed_description || "",
        image_url: product.image_url || "",
        is_featured: product.is_featured || false,
      });
    }
  }, [product]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | React.ChangeEvent<HTMLTextAreaElement>>) => {
    const { name, value } = e.target;
     setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user) return;
    
    setIsSubmitting(true);
    try {
      // Upload image if selected
      let imageUrl = formData.image_url;
      
      if (imageFile) {
        imageUrl = await uploadProductImage(imageFile, user.id) || "";
      }

      // Update product with the uploaded image URL
      const updatedProduct = await updateProduct(id, {
        ...formData,
        image_url: imageUrl
      });
      
      if (updatedProduct) {
        // Invalidate queries to update the UI
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        queryClient.invalidateQueries({ queryKey: ['product', id] });
        navigate("/admin/products");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <AdminNav />
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminNav />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate("/admin/products")}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
            <h1 className="text-2xl font-bold">Edit Product</h1>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Product Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name*</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter product name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category*</Label>
                    <Select
                      value={formData.category_id}
                      onValueChange={(value) => handleSelectChange("category_id", value)}
                      required
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingCategories ? (
                          <SelectItem value="loading" disabled>Loading categories...</SelectItem>
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

                <div className="space-y-2">
                  <Label htmlFor="short_description">Short Description*</Label>
                  <Textarea
                    id="short_description"
                    name="short_description"
                    placeholder="Brief product description"
                    rows={2}
                    value={formData.short_description}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="detailed_description">Detailed Description</Label>
                  <Textarea
                    id="detailed_description"
                    name="detailed_description"
                    placeholder="Comprehensive product details"
                    rows={6}
                    value={formData.detailed_description || ""}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Removed Price and Original Price fields */}

                <div className="space-y-2">
                  <Label htmlFor="image">Product Image</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-4">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="cursor-pointer"
                        />
                      </div>
                      {!imageFile && (
                        <div className="mt-2">
                          <Label htmlFor="image_url">Or enter image URL</Label>
                          <Input
                            id="image_url"
                            name="image_url"
                            placeholder="https://example.com/image.jpg"
                            value={formData.image_url || ""}
                            onChange={handleInputChange}
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      {imagePreview ? (
                        <div className="mt-2 rounded-md overflow-hidden border border-border h-40 flex items-center justify-center">
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      ) : formData.image_url ? (
                        <div className="mt-2 rounded-md overflow-hidden border border-border h-40 flex items-center justify-center">
                          <img 
                            src={formData.image_url} 
                            alt="Preview" 
                            className="max-h-full max-w-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="mt-2 rounded-md border border-border h-40 flex items-center justify-center bg-muted">
                          <Upload className="h-10 w-10 text-muted-foreground opacity-50" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-4">
                  <Checkbox 
                    id="is_featured" 
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => 
                      handleCheckboxChange("is_featured", checked === true)
                    }
                  />
                  <label
                    htmlFor="is_featured"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Feature this product on homepage
                  </label>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/admin/products")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Update Product"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminEditProductPage;
