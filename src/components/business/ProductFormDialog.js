'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { LoadingSpinner } from '@/components/ui/loading-states';

const productFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(800).optional().or(z.literal('')),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  imageUrl: z.string().url('Invalid image URL (e.g., https://example.com/image.jpg)').optional().or(z.literal('')),
  isHalal: z.boolean().default(true),
});

export function ProductFormDialog({ open, onOpenChange, product, onFormSubmitSuccess }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditMode = Boolean(product && product._id);

  const form = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      isHalal: true,
    }
  });

  useEffect(() => {
    if (isEditMode && product) {
      form.reset({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        imageUrl: product.imageUrl || '',
        isHalal: typeof product.isHalal === 'boolean' ? product.isHalal : true,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        price: 0,
        imageUrl: '',
        isHalal: true,
      });
    }
  }, [product, isEditMode, form, open]);

  async function onSubmit(values) {
    setIsSubmitting(true);
    try {
      let response;

      if (isEditMode) {
        response = await axios.patch(`/api/business/products/${product._id}`, values);
        toast({
          title: "Product Updated",
          description: "Your product has been successfully updated."
        });
      } else {
        response = await axios.post('/api/business/products', values);
        toast({
          title: "Product Created",
          description: "Your new product has been successfully added to your store."
        });
      }

      if (onFormSubmitSuccess) {
        onFormSubmitSuccess();
      }

      onOpenChange(false); // Close dialog
    } catch (error) {
      console.error("Form submission error:", error);
      toast({
        title: "Submission Failed",
        description: error.response?.data?.error || "Could not save product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update your product details below.'
              : 'Fill in the details to add a new product to your business.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name*</FormLabel>
                  <FormControl><Input placeholder="e.g., Baklava Tray" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your product..."
                      {...field}
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormDescription>Provide details about your product (optional).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (£)*</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="19.99"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl><Input placeholder="https://example.com/image.jpg" {...field} /></FormControl>
                  <FormDescription>Link to an image of your product (optional).</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isHalal"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 shadow-sm bg-gray-50">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="isHalalProduct"
                    />
                  </FormControl>
                  <FormLabel htmlFor="isHalalProduct" className="font-normal cursor-pointer">
                    This product is Halal
                  </FormLabel>
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <LoadingSpinner message={isEditMode ? 'Saving...' : 'Creating...'} size="sm" />
                ) : (
                  isEditMode ? 'Save Changes' : 'Add Product'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
