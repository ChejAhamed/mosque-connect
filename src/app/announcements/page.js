'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  Building2,
  MapPin,
  Calendar,
  Clock,
  Search,
  Filter,
  Megaphone,
  Star,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';

export default function PublicAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      // This endpoint should return all public announcements
      const response = await axios.get('/api/announcements/public');
      setAnnouncements(response.data.announcements || []);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      // For demo purposes, set empty array
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadge = (type) => {
    const colors = {
      event: 'bg-blue-100 text-blue-800',
      general: 'bg-gray-100 text-gray-800',
      urgent: 'bg-red-100 text-red-800',
      promotion: 'bg-green-100 text-green-800',
      sale: 'bg-yellow-100 text-yellow-800',
      news: 'bg-purple-100 text-purple-800',
      service: 'bg-indigo-100 text-indigo-800',
      system: 'bg-orange-100 text-orange-800'
    };

    return (
      <Badge className={colors[type] || colors.general}>
        {type?.charAt(0).toUpperCase() + type?.slice(1)}
      </Badge>
    );
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'urgent') return <AlertCircle className="h-4 w-4 text-red-500" />;
    if (priority === 'high') return <Star className="h-4 w-4 text-orange-500" />;
    return null;
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || announcement.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center">Loading announcements...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Megaphone className="h-8 w-8 text-blue-600" />
          Community Announcements
        </h1>
        <p className="text-gray-600">Stay updated with the latest news and events from our community</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search announcements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="md:w-48">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="event">Events</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="promotion">Promotions</SelectItem>
                  <SelectItem value="sale">Sales</SelectItem>
                  <SelectItem value="news">News</SelectItem>
                  <SelectItem value="service">Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Megaphone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
            <p className="text-gray-500">Check back later for community updates and news.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredAnnouncements.map((announcement) => (
            <Card key={announcement._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getPriorityIcon(announcement.priority)}
                      <CardTitle className="text-xl">{announcement.title}</CardTitle>
                      {getTypeBadge(announcement.type)}
                    </div>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </div>
                      {announcement.endDate && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Until {new Date(announcement.endDate).toLocaleDateString()}
                        </div>
                      )}
                      {announcement.isAdminAnnouncement && (
                        <Badge variant="outline" className="text-xs">
                          Platform Announcement
                        </Badge>
                      )}
                      {announcement.businessId && (
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          Business
                        </div>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
                
                {announcement.targetAudience && announcement.targetAudience !== 'all' && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-500">
                      Target Audience: <span className="capitalize">{announcement.targetAudience}</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}