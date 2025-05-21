'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Loader2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

// Form validation schema
const announcementFormSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  content: z.string()
    .min(10, 'Content must be at least 10 characters')
    .max(2000, 'Content cannot exceed 2000 characters'),
  type: z.enum(['announcement', 'offer', 'promotion', 'news'], {
    required_error: 'Please select an announcement type',
  }),
  imageUrl: z.string().optional().nullable(),
  startDate: z.date({
    required_error: 'Please select a start date',
  }),
  endDate: z.date().optional().nullable(),
  isActive: z.boolean().default(true),
});

export function AnnouncementFormDialog({ open, onOpenChange, announcement, onFormSubmitSuccess }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!announcement;

  // Initialize form with default values or existing announcement data
  const form = useForm({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: '',
      content: '',
      type: 'announcement',
      imageUrl: '',
      startDate: new Date(),
      endDate: null,
      isActive: true,
    },
  });

  // Reset form when dialog opens/closes or when announcement changes
  useEffect(() => {
    if (open) {
      if (announcement) {
        // Editing mode - populate form with existing data
        form.reset({
          title: announcement.title,
          content: announcement.content,
          type: announcement.type,
          imageUrl: announcement.imageUrl || '',
          startDate: announcement.startDate ? new Date(announcement.startDate) : new Date(),
          endDate: announcement.endDate ? new Date(announcement.endDate) : null,
          isActive: announcement.isActive,
        });
      } else {
        // Creation mode - reset to defaults
        form.reset({
          title: '',
          content: '',
          type: 'announcement',
          imageUrl: '',
          startDate: new Date(),
          endDate: null,
          isActive: true,
        });
      }
    }
  }, [open, announcement, form]);

  // Handle form submission
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        // Update existing announcement
        await axios.patch(`/api/business/announcements/${announcement._id}`, data);
        toast({
          title: 'Announcement Updated',
          description: 'Your announcement has been updated successfully.',
        });
      } else {
        // Create new announcement
        await axios.post('/api/business/announcements', data);
        toast({
          title: 'Announcement Created',
          description: 'Your announcement has been created successfully.',
        });
      }

      // Close dialog and notify parent about success
      onOpenChange(false);
      if (onFormSubmitSuccess) {
        onFormSubmitSuccess();
      }
    } catch (error) {
      console.error('Announcement submission error:', error);
      toast({
        title: 'Submission Failed',
        description: error.response?.data?.error || 'Failed to save the announcement. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle image upload (placeholder - can be expanded with actual upload logic)
  const handleImageUpload = async (e) => {
    // This is a placeholder. In a real implementation, you would:
    // 1. Upload the image to your server or a service like Cloudinary
    // 2. Get the URL back and set it in the form
    toast({
      title: 'Image Upload',
      description: 'Image upload functionality will be implemented in a future update.',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Announcement' : 'Create New Announcement'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter announcement title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter announcement content"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Announcement Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="announcement" id="type-announcement" />
                        <label htmlFor="type-announcement" className="text-sm font-medium">Announcement</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="offer" id="type-offer" />
                        <label htmlFor="type-offer" className="text-sm font-medium">Special Offer</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="promotion" id="type-promotion" />
                        <label htmlFor="type-promotion" className="text-sm font-medium">Promotion</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="news" id="type-news" />
                        <label htmlFor="type-news" className="text-sm font-medium">News</label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image URL */}
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (Optional)</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder="Enter image URL or upload"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleImageUpload}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start Date */}
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="pl-3 text-left font-normal w-full"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Select a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End Date */}
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date (Optional)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="pl-3 text-left font-normal w-full"
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>No end date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Is Active */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active</FormLabel>
                    <p className="text-sm text-gray-500">
                      If checked, this announcement will be visible to users
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
