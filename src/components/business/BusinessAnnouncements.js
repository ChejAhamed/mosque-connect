'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Megaphone, Tag, Calendar, AlertCircle, ArrowRightIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

export function BusinessAnnouncements({ announcements = [] }) {
  const [activePage, setActivePage] = useState(0);
  const itemsPerPage = 2;

  // Filter to only show active announcements
  const activeAnnouncements = announcements.filter(
    announcement => announcement.isActive &&
    (!announcement.endDate || new Date(announcement.endDate) >= new Date())
  );

  // Sort announcements by type (offers first) and then by date (newest first)
  const sortedAnnouncements = [...activeAnnouncements].sort((a, b) => {
    // First sort by type priority: offer, promotion, news, announcement
    const typePriority = { offer: 0, promotion: 1, news: 2, announcement: 3 };
    const typeComparison = typePriority[a.type] - typePriority[b.type];

    if (typeComparison !== 0) return typeComparison;

    // Then sort by date (newest first)
    return new Date(b.startDate) - new Date(a.startDate);
  });

  const totalPages = Math.ceil(sortedAnnouncements.length / itemsPerPage);
  const currentAnnouncements = sortedAnnouncements.slice(
    activePage * itemsPerPage,
    (activePage + 1) * itemsPerPage
  );

  // If no active announcements, don't render anything
  if (sortedAnnouncements.length === 0) {
    return null;
  }

  // Get announcement type badge
  const getTypeBadge = (type) => {
    switch (type) {
      case 'offer':
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-600">
            <Tag className="h-3 w-3 mr-1" /> Special Offer
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
    <div className="my-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Announcements & Offers</h2>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActivePage(prev => Math.max(0, prev - 1))}
              disabled={activePage === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              {activePage + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActivePage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={activePage === totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {currentAnnouncements.map((announcement) => (
          <Card
            key={announcement._id}
            className={`
              overflow-hidden transition-shadow hover:shadow-md
              ${announcement.type === 'offer' ? 'border-blue-200 bg-blue-50/30' : ''}
              ${announcement.type === 'promotion' ? 'border-purple-200 bg-purple-50/30' : ''}
            `}
          >
            <div className="flex flex-col lg:flex-row">
              {announcement.imageUrl && (
                <div className="lg:w-1/4">
                  <div className="h-36 lg:h-full w-full overflow-hidden bg-gray-200">
                    <img
                      src={announcement.imageUrl}
                      alt={announcement.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              <div className={`flex-1 ${announcement.imageUrl ? 'lg:w-3/4' : 'w-full'}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl mb-1">{announcement.title}</CardTitle>
                    <div>
                      {getTypeBadge(announcement.type)}
                    </div>
                  </div>
                  <CardDescription className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {announcement.startDate && format(new Date(announcement.startDate), 'MMM d, yyyy')}
                    {announcement.endDate && ` - ${format(new Date(announcement.endDate), 'MMM d, yyyy')}`}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <p className="text-sm text-gray-700">{announcement.content}</p>
                </CardContent>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
