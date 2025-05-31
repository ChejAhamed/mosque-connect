'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { OfferForm } from '@/components/business/OfferForm';
import {
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AddOffer() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/dashboard/business/offers/add");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "business") {
      router.push("/unauthorized");
      return;
    }
  }, [status, session, router]);

  const handleSubmit = async (offerData) => {
    try {
      setSubmitting(true);
      
      await axios.post('/api/business/offers', offerData);

      toast({
        title: "Success",
        description: "Offer created successfully"
      });

      router.push('/dashboard/business/offers');
    } catch (error) {
      console.error('Error creating offer:', error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create offer",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => router.push('/dashboard/business/offers')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Offers
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Offer</h1>
          <p className="text-gray-600">Set up a promotional offer for your customers</p>
        </div>
      </div>

      <OfferForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/dashboard/business/offers')}
        submitting={submitting}
        isEditing={false}
      />
    </div>
  );
}