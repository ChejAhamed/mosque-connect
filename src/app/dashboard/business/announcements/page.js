'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner, EmptyState, ErrorState } from '@/components/ui/loading-states';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Megaphone, Calendar, Tag, AlertCircle } from 'lucide-react';
import { format, formatDistanceToNow, isAfter, isBefore } from 'date-fns';
import { AnnouncementFormDialog } from '@/components/business/AnnouncementFormDialog';

export default function BusinessAnnouncementsPage() {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/business/announcements');
      setAnnouncements(response.data.announcements || []);
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
      setError(err.response?.data?.error || "Could not load announcements. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenCreateDialog = () => {
    setSelectedAnnouncement(null);
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDialogOpen(true);
  };

  const handleDialogSubmitSuccess = () => {
    fetchAnnouncements(); // Refresh the list
  };

  const handleDelete = async (announcementId) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      await axios.delete(`/api/business/announcements/${announcementId}`);
      toast({ title: "Announcement Deleted", description: "The announcement has been successfully removed." });
      fetchAnnouncements(); // Re-fetch the list to show changes
    } catch (err) {
      console.error("Delete failed:", err);
      toast({
        title: "Delete Failed",
        description: err.response?.data?.error || "Could not delete the announcement.",
        variant: "destructive"
      });
    }
  };

  // Get announcement status badge
  const getStatusBadge = (announcement) => {
    const now = new Date();

    if (!announcement.isActive) {
      return (
        <Badge variant="outline" className="border-gray-500 text-gray-600">
          Inactive
        </Badge>
      );
    }

    if (announcement.endDate && isBefore(new Date(announcement.endDate), now)) {
      return (
        <Badge variant="outline" className="border-red-500 text-red-600">
          Expired
        </Badge>
      );
    }

    if (announcement.startDate && isAfter(new Date(announcement.startDate), now)) {
      return (
        <Badge variant="outline" className="border-orange-500 text-orange-600">
          Scheduled
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="border-green-500 text-green-600">
        Active
      </Badge>
    );
  };

  // Get announcement type badge
  const getTypeBadge = (type) => {
    switch (type) {
      case 'offer':
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-600">
            <Tag className="h-3 w-3 mr-1" /> Offer
          </Badge>
        );
      case 'promotion':
        return (
          <Badge variant="outline" className="border-purple-500 text-purple-600">
            <Tag className="h-3 w-3 mr-1" /> Promotion
          </Badge>
        );
      case 'news':
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-600">
            <AlertCircle className="h-3 w-3 mr-1" /> News
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-gray-500 text-gray-600">
            <Megaphone className="h-3 w-3 mr-1" /> Announcement
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Manage Announcements</h1>
          <p className="text-gray-600">
            Add, edit, and manage announcements, offers, and news for your business.
          </p>
        </div>
        <Button onClick={handleOpenCreateDialog} className="mt-2 sm:mt-0">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Announcement
        </Button>
      </div>

      {isLoading && <LoadingSpinner message="Loading announcements..." />}

      {error && !isLoading && (
        <ErrorState
          message={error}
          onRetry={fetchAnnouncements}
          retryButtonText="Try Again"
        />
      )}

      {!isLoading && !error && announcements.length === 0 && (
        <EmptyState
          title="No Announcements Yet"
          description="Get started by adding your first announcement or special offer."
          icon={<Megaphone className="h-12 w-12 text-gray-400" />}
          actionButton={
            <Button onClick={handleOpenCreateDialog}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add First Announcement
            </Button>
          }
        />
      )}

      {!isLoading && !error && announcements.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {announcements.map((announcement) => (
            <Card key={announcement._id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {announcement.imageUrl && (
                <div className="h-32 w-full overflow-hidden bg-gray-200">
                  <img
                    src={announcement.imageUrl}
                    alt={announcement.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader className={announcement.imageUrl ? "pb-2" : "pb-4 pt-5"}>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl mb-1 line-clamp-1">{announcement.title}</CardTitle>
                  <div className="flex items-center gap-2">
                    {getTypeBadge(announcement.type)}
                    {getStatusBadge(announcement)}
                  </div>
                </div>
                <CardDescription className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {announcement.startDate && format(new Date(announcement.startDate), 'MMM d, yyyy')}
                    {announcement.endDate && ` - ${format(new Date(announcement.endDate), 'MMM d, yyyy')}`}
                  </span>
                  <span className="text-xs text-gray-500">
                    Added {formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}
                  </span>
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-sm text-gray-700 mb-3 line-clamp-3">{announcement.content}</p>
              </CardContent>

              <CardFooter className="flex justify-end gap-2 border-t pt-3 bg-gray-50">
                <Button variant="outline" size="sm" onClick={() => handleOpenEditDialog(announcement)}>
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(announcement._id)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <AnnouncementFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        announcement={selectedAnnouncement}
        onFormSubmitSuccess={handleDialogSubmitSuccess}
      />
    </div>
  );
}
