'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { ProductForm } from '@/components/business/ProductForm';
import {
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AddProduct() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/dashboard/business/products/add");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "business") {
      router.push("/unauthorized");
      return;
    }
  }, [status, session, router]);

  const handleSubmit = async (productData) => {
    try {
      setSubmitting(true);
      
      await axios.post('/api/business/products', productData);

      toast({
        title: "Success",
        description: "Product created successfully"
      });

      router.push('/dashboard/business/products');
    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create product",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl pt-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push('/dashboard/business/products')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-600">Create a new product for your store</p>
        </div>
      </div>

      <ProductForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/dashboard/business/products')}
        submitting={submitting}
        isEditing={false}
      />
    </div>
  );
}