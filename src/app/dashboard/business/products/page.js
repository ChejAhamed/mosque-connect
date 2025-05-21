'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner, EmptyState, ErrorState } from '@/components/ui/loading-states';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Package, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ProductFormDialog } from '@/components/business/ProductFormDialog';

export default function BusinessProductsPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/business/products');
      setProducts(response.data.products || []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError(err.response?.data?.error || "Could not load products. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenCreateDialog = () => {
    setSelectedProduct(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (product) => {
    setSelectedProduct(product);
    setIsDialogOpen(true);
  };

  const handleDialogSubmitSuccess = () => {
    fetchProducts(); // Refresh the list
  };

  const handleDelete = async (productId) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`/api/business/products/${productId}`);
      toast({ title: "Product Deleted", description: "The product has been successfully removed." });
      fetchProducts(); // Re-fetch the list to show changes
    } catch (err) {
      console.error("Delete failed:", err);
      toast({
        title: "Delete Failed",
        description: err.response?.data?.error || "Could not delete the product.",
        variant: "destructive"
      });
    }
  };

  // Format currency in GBP
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manage Products</h1>
          <p className="text-gray-600">
            Add, edit, and manage products your business offers.
          </p>
        </div>
        <Button onClick={handleOpenCreateDialog} className="mt-2 sm:mt-0">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
        </Button>
      </div>

      {isLoading && <LoadingSpinner message="Loading products..." />}

      {error && !isLoading && (
        <ErrorState
          message={error}
          onRetry={fetchProducts}
          retryButtonText="Try Again"
        />
      )}

      {!isLoading && !error && products.length === 0 && (
        <EmptyState
          title="No Products Yet"
          description="Get started by adding your first product."
          icon={<Package className="h-12 w-12 text-gray-400" />}
          actionButton={
            <Button onClick={handleOpenCreateDialog}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add First Product
            </Button>
          }
        />
      )}

      {!isLoading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <Card key={product._id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {product.imageUrl && (
                <div className="h-40 w-full overflow-hidden bg-gray-200">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader className={product.imageUrl ? "pb-2" : "pb-4 pt-5"}>
                <div className="flex justify-between">
                  <CardTitle className="text-xl mb-1 line-clamp-1">{product.name}</CardTitle>
                  <div className="flex items-center">
                    {product.isHalal && (
                      <Badge variant="outline" className="border-green-500 text-green-600 mr-2">
                        <CheckCircle className="h-3 w-3 mr-1" /> Halal
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-sm text-primary">
                    {formatPrice(product.price)}
                  </span>
                  {product.createdAt && (
                    <span className="text-xs text-gray-500">
                      Added {formatDistanceToNow(new Date(product.createdAt), { addSuffix: true })}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                {product.description && (
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">{product.description}</p>
                )}
              </CardContent>

              <CardFooter className="flex justify-end gap-2 border-t pt-3 bg-gray-50">
                <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(product)}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(product._id)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <ProductFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        product={selectedProduct}
        onFormSubmitSuccess={handleDialogSubmitSuccess}
      />
    </div>
  );
}
