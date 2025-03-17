import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AdminSidebar from "@/components/layout/admin-sidebar";
import ProductForm from "@/components/admin/product-form";
import { Product, Category } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Loader2, Edit, Trash, Plus } from "lucide-react";

export default function AdminProducts() {
  const { toast } = useToast();
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  const { 
    data: products = [], 
    isLoading: productsLoading,
    refetch: refetchProducts
  } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { 
    data: categories = [],
    isLoading: categoriesLoading
  } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const createProductMutation = useMutation({
    mutationFn: async (productData: Omit<Product, "id">) => {
      const res = await apiRequest("POST", "/api/products", productData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product created",
        description: "The product has been created successfully",
      });
      setIsAddProductOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (productData: Product) => {
      const { id, ...data } = productData;
      const res = await apiRequest("PUT", `/api/products/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product updated",
        description: "The product has been updated successfully",
      });
      setIsEditProductOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("DELETE", `/api/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      toast({
        title: "Product deleted",
        description: "The product has been deleted successfully",
      });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete product",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setIsEditProductOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (currentProduct) {
      deleteProductMutation.mutate(currentProduct.id);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      <AdminSidebar />
      
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex justify-between items-center">
              <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
              <Button onClick={() => setIsAddProductOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {productsLoading || categoriesLoading ? (
                <div className="flex justify-center items-center h-96">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
              ) : (
                <div className="mt-8 flex flex-col">
                  <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                      <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Image</TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead>Stock</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {products.map((product) => {
                              const category = categories.find(c => c.id === product.categoryId);
                              return (
                                <TableRow key={product.id}>
                                  <TableCell>
                                    <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden">
                                      <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="w-full h-full object-center object-cover"
                                      />
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-medium">{product.name}</TableCell>
                                  <TableCell>${product.price.toFixed(2)}</TableCell>
                                  <TableCell>{category?.name || 'Unknown'}</TableCell>
                                  <TableCell>
                                    <span 
                                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        product.stock > 0 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {product.stock}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex space-x-2">
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleEditProduct(product)}
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleDeleteProduct(product)}
                                      >
                                        <Trash className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add Product Dialog */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <ProductForm 
            categories={categories} 
            onSubmit={(data) => createProductMutation.mutate(data)} 
            isLoading={createProductMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <ProductForm 
            product={currentProduct} 
            categories={categories} 
            onSubmit={(data) => updateProductMutation.mutate(data as Product)} 
            isLoading={updateProductMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <p className="py-4">
            Are you sure you want to delete the product "{currentProduct?.name}"? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
