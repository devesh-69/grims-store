
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminNav from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, GripVertical } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchProducts, deleteProduct, updateProduct, updateProductOrder } from "@/api/products";
import { Switch } from "@/components/ui/switch";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { toast } from "sonner";

const AdminProductsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const queryClient = useQueryClient();

  const { data = [], isLoading, error } = useQuery({
    queryKey: ['admin-products'],
    queryFn: fetchProducts
  });

  // Set local products state when data is loaded
  useEffect(() => {
    if (data && data.length > 0) {
      // Sort by display_order if available, otherwise by created_at
      const sortedProducts = [...data].sort((a, b) => {
        if (a.display_order && b.display_order) {
          return a.display_order - b.display_order;
        }
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
      setProducts(sortedProducts);
    }
  }, [data]);

  // Filter products by name
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      const success = await deleteProduct(productToDelete);
      if (success) {
        queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      }
    }
    setIsDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const handleFeatureToggle = async (productId: string, isCurrentlyFeatured: boolean) => {
    try {
      await updateProduct(productId, { is_featured: !isCurrentlyFeatured });
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      toast.success(`Product ${!isCurrentlyFeatured ? 'featured' : 'unfeatured'} successfully`);
    } catch (error) {
      console.error("Error updating feature status:", error);
      toast.error("Failed to update product feature status");
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    if (sourceIndex === destinationIndex) return;
    
    // Reorder products in local state
    const reorderedProducts = [...filteredProducts];
    const [removed] = reorderedProducts.splice(sourceIndex, 1);
    reorderedProducts.splice(destinationIndex, 0, removed);
    
    // Update display order numbers
    const updatedProducts = reorderedProducts.map((product, index) => ({
      ...product,
      display_order: index + 1
    }));
    
    setProducts(updatedProducts);
    
    try {
      // Save the new order to the database
      await updateProductOrder(updatedProducts.map(p => ({ id: p.id, display_order: p.display_order })));
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Product order updated successfully");
    } catch (error) {
      console.error("Error updating product order:", error);
      toast.error("Failed to update product order");
      
      // Revert to original order if there's an error
      setProducts(data);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminNav />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Manage Products</h1>
            <Link to="/admin/products/add">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-10">Loading products...</div>
              ) : error ? (
                <div className="text-center py-10 text-red-500">Error loading products.</div>
              ) : (
                <div className="rounded-md border">
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="products">
                      {(provided) => (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead style={{ width: '50px' }}></TableHead>
                              <TableHead style={{ width: '80px' }}>Image</TableHead>
                              <TableHead>Product Name</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Featured</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody {...provided.droppableProps} ref={provided.innerRef}>
                            {filteredProducts.length > 0 ? (
                              filteredProducts.map((product, index) => (
                                <Draggable 
                                  key={product.id} 
                                  draggableId={product.id} 
                                  index={index}
                                >
                                  {(provided) => (
                                    <TableRow 
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                    >
                                      <TableCell 
                                        {...provided.dragHandleProps}
                                        className="cursor-grab"
                                      >
                                        <div className="flex items-center justify-center">
                                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                      </TableCell>
                                      <TableCell className="p-2">
                                        {product.image_url ? (
                                          <img 
                                            src={product.image_url} 
                                            alt={product.name} 
                                            className="h-12 w-12 object-cover rounded-md"
                                          />
                                        ) : (
                                          <div className="h-12 w-12 bg-muted rounded-md flex items-center justify-center">
                                            <span className="text-xs text-muted-foreground">No Image</span>
                                          </div>
                                        )}
                                      </TableCell>
                                      <TableCell className="font-medium">{product.name}</TableCell>
                                      <TableCell>{product.category?.name}</TableCell>
                                      <TableCell>
                                        {product.price 
                                          ? `$${product.price}${product.original_price ? ` (was $${product.original_price})` : ''}` 
                                          : 'N/A'}
                                      </TableCell>
                                      <TableCell>
                                        <Switch 
                                          checked={product.is_featured || false}
                                          onCheckedChange={() => handleFeatureToggle(product.id, product.is_featured || false)}
                                        />
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                          <Link to={`/admin/products/edit/${product.id}`}>
                                            <Button variant="outline" size="icon">
                                              <Edit className="h-4 w-4" />
                                            </Button>
                                          </Link>
                                          <Button 
                                            variant="outline" 
                                            size="icon" 
                                            className="text-destructive"
                                            onClick={() => handleDeleteClick(product.id)}
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  )}
                                </Draggable>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={7} className="text-center py-10">
                                  No products found.
                                </TableCell>
                              </TableRow>
                            )}
                            {provided.placeholder}
                          </TableBody>
                        </Table>
                      )}
                    </Droppable>
                  </DragDropContext>
                </div>
              )}
            </CardContent>
          </Card>

          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the product.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={confirmDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default AdminProductsPage;
