"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { EVENT_CATEGORIES } from "@/lib/constants";

// Dummy events data for the MVP
const DUMMY_EVENTS = [
  {
    id: "1",
    title: "Friday Khutbah",
    description: "Weekly Friday sermon and prayers led by Sheikh Abdul Qayum.",
    startDate: "2023-07-21T13:00:00Z",
    endDate: "2023-07-21T14:30:00Z",
    mosque: {
      id: "1",
      name: "East London Mosque",
      city: "London",
    },
    category: "lecture",
    isPublic: true,
  },
  {
    id: "2",
    title: "Islamic Studies Class",
    description: "Learn about Islamic principles and Quran with Sheikh Abdul Qayum.",
    startDate: "2023-07-23T10:00:00Z",
    endDate: "2023-07-23T12:00:00Z",
    mosque: {
      id: "1",
      name: "East London Mosque",
      city: "London",
    },
    category: "class",
    isPublic: true,
  },
  {
    id: "3",
    title: "Quran Classes",
    description: "Learn to read and memorize Quran with experienced teachers.",
    startDate: "2023-07-22T09:00:00Z",
    endDate: "2023-07-22T11:00:00Z",
    mosque: {
      id: "2",
      name: "Birmingham Central Mosque",
      city: "Birmingham",
    },
    category: "class",
    isPublic: true,
  },
  {
    id: "4",
    title: "Charity Fundraising Dinner",
    description: "Join us for a fundraising dinner to support humanitarian causes.",
    startDate: "2023-07-29T18:00:00Z",
    endDate: "2023-07-29T21:00:00Z",
    mosque: {
      id: "1",
      name: "East London Mosque",
      city: "London",
    },
    category: "fundraising",
    isPublic: true,
  },
  {
    id: "5",
    title: "Youth Group Meeting",
    description: "Weekly meeting for young Muslims to discuss community issues and plan activities.",
    startDate: "2023-07-24T18:30:00Z",
    endDate: "2023-07-24T20:00:00Z",
    mosque: {
      id: "3",
      name: "Manchester Central Mosque",
      city: "Manchester",
    },
    category: "community",
    isPublic: true,
  },
  {
    id: "6",
    title: "Eid Celebration Planning",
    description: "Meeting to plan the upcoming Eid celebration events. Volunteers welcome!",
    startDate: "2023-07-26T19:00:00Z",
    endDate: "2023-07-26T20:30:00Z",
    mosque: {
      id: "4",
      name: "Leeds Grand Mosque",
      city: "Leeds",
    },
    category: "community",
    isPublic: true,
  },
  {
    id: "7",
    title: "Food Bank Distribution",
    description: "Help distribute food parcels to those in need in our community.",
    startDate: "2023-07-30T10:00:00Z",
    endDate: "2023-07-30T14:00:00Z",
    mosque: {
      id: "5",
      name: "Glasgow Central Mosque",
      city: "Glasgow",
    },
    category: "charity",
    isPublic: true,
  },
  {
    id: "8",
    title: "Arabic Language Course",
    description: "Beginner's Arabic language course, taught by qualified teachers.",
    startDate: "2023-07-25T18:00:00Z",
    endDate: "2023-07-25T19:30:00Z",
    mosque: {
      id: "2",
      name: "Birmingham Central Mosque",
      city: "Birmingham",
    },
    category: "class",
    isPublic: true,
  },
];

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Get today's date at the beginning of the day
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter the events based on search term, filters, and only include future events
  const filteredEvents = DUMMY_EVENTS.filter((event) => {
    const matchesSearch = searchTerm
      ? event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesLocation = locationFilter
      ? event.mosque.city.toLowerCase().includes(locationFilter.toLowerCase())
      : true;

    const matchesCategory = categoryFilter === "all" || !categoryFilter
      ? true
      : event.category === categoryFilter;

    // Only include events that are today or in the future
    const eventDate = new Date(event.startDate);
    const isFutureEvent = eventDate >= today;

    return matchesSearch && matchesLocation && matchesCategory && isFutureEvent;
  });

  // Sort events by date (earliest first)
  const sortedEvents = [...filteredEvents].sort((a, b) =>
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Community Events</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover upcoming events at mosques in your community.
        </p>
      </div>

      {/* Search and filters */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <Input
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <Input
            placeholder="Filter by location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
          />
        </div>
        <div>
          <Select
            value={categoryFilter}
            onValueChange={setCategoryFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Event category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {EVENT_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Events list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {sortedEvents.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No events found</h3>
          <p className="text-gray-600">
            Try adjusting your search filters or check back later for new events.
          </p>
        </div>
      )}

      {/* Registration CTA */}
      <div className="mt-12 p-6 bg-green-50 rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">
            Are you an imam or mosque administrator?
          </h3>
          <p className="text-gray-600 mb-4">
            Register your mosque on MosqueConnect to publish your events and connect with volunteers.
          </p>
          <Link href="/register?role=imam">
            <Button>Register Your Mosque</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Event card component
function EventCard({ event }: { event: any }) {
  // Format date and time nicely
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const startDate = formatDate(event.startDate);
  const startTime = formatTime(event.startDate);
  const endTime = formatTime(event.endDate);

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fundraising':
        return 'bg-purple-100 text-purple-800';
      case 'class':
        return 'bg-blue-100 text-blue-800';
      case 'lecture':
        return 'bg-yellow-100 text-yellow-800';
      case 'community':
        return 'bg-green-100 text-green-800';
      case 'charity':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className={`h-2 ${getCategoryColor(event.category).split(' ')[0]}`}></div>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg">{event.title}</h3>
          <div className={`${getCategoryColor(event.category)} text-xs font-medium px-2 py-1 rounded`}>
            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
          </div>
        </div>

        <div className="mb-3">
          <div className="text-sm font-medium text-gray-600">{startDate}</div>
          <div className="text-sm text-gray-500">{startTime} - {endTime}</div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="flex justify-between items-end">
          <div className="text-xs text-gray-500">
            {event.mosque.name}, {event.mosque.city}
          </div>
          <Link href={`/events/${event.id}`}>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
