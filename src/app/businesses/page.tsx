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
import { BUSINESS_TYPES } from "@/lib/constants";

// Dummy business data for the MVP
export const DUMMY_BUSINESSES = [
  {
    id: "1",
    name: "Halal Kitchen",
    description: "Authentic halal food and catering services.",
    type: "Restaurant",
    address: "123 High Street",
    city: "London",
    country: "United Kingdom",
    postalCode: "E1 6BT",
    phone: "+44 20 7123 4567",
    email: "info@halalkitchen.co.uk",
    website: "https://www.halalkitchen.co.uk",
    isVerified: true,
    isFeatured: true,
  },
  {
    id: "2",
    name: "Barakah Butchers",
    description: "Quality halal meat and poultry.",
    type: "Butcher",
    address: "45 Green Lane",
    city: "Birmingham",
    country: "United Kingdom",
    postalCode: "B11 4DS",
    phone: "+44 121 456 7890",
    email: "info@barakahbutchers.co.uk",
    website: "https://www.barakahbutchers.co.uk",
    isVerified: true,
    isFeatured: false,
  },
  {
    id: "3",
    name: "Al-Nur Bookstore",
    description: "Islamic books, Qurans, and educational materials.",
    type: "Book Store",
    address: "78 Main Road",
    city: "Manchester",
    country: "United Kingdom",
    postalCode: "M14 7JB",
    phone: "+44 161 789 1234",
    email: "sales@alnurbookstore.co.uk",
    website: "https://www.alnurbookstore.co.uk",
    isVerified: true,
    isFeatured: false,
  },
  {
    id: "4",
    name: "Medina Pharmacy",
    description: "Community pharmacy with halal medicines and products.",
    type: "Pharmacy",
    address: "12 Health Street",
    city: "Leeds",
    country: "United Kingdom",
    postalCode: "LS1 5DF",
    phone: "+44 113 567 8901",
    email: "info@medinahealth.co.uk",
    website: "https://www.medinahealth.co.uk",
    isVerified: true,
    isFeatured: true,
  },
  {
    id: "5",
    name: "Al-Madina Travel",
    description: "Hajj and Umrah travel packages and services.",
    type: "Travel Agency",
    address: "34 Pilgrim Street",
    city: "Glasgow",
    country: "United Kingdom",
    postalCode: "G2 7DQ",
    phone: "+44 141 234 5678",
    email: "bookings@almadinatravel.co.uk",
    website: "https://www.almadinatravel.co.uk",
    isVerified: true,
    isFeatured: false,
  },
  {
    id: "6",
    name: "Bismillah Repairs",
    description: "Car maintenance and repair services.",
    type: "Mechanic",
    address: "56 Workshop Lane",
    city: "Cardiff",
    country: "United Kingdom",
    postalCode: "CF10 2GH",
    phone: "+44 29 1234 5678",
    email: "service@bismillahrepairs.co.uk",
    website: "https://www.bismillahrepairs.co.uk",
    isVerified: false,
    isFeatured: false,
  },
  {
    id: "7",
    name: "Aisha's Beauty Salon",
    description: "Women's beauty services in a private, halal environment.",
    type: "Beauty Salon",
    address: "22 Style Avenue",
    city: "London",
    country: "United Kingdom",
    postalCode: "E2 7FG",
    phone: "+44 20 8765 4321",
    email: "bookings@aishasbeauty.co.uk",
    website: "https://www.aishasbeauty.co.uk",
    isVerified: true,
    isFeatured: false,
  },
  {
    id: "8",
    name: "Baraka Bakery",
    description: "Fresh bread, cakes, and pastries daily.",
    type: "Bakery",
    address: "3 Flour Street",
    city: "Birmingham",
    country: "United Kingdom",
    postalCode: "B13 5RT",
    phone: "+44 121 987 6543",
    email: "orders@barakabakery.co.uk",
    website: "https://www.barakabakery.co.uk",
    isVerified: true,
    isFeatured: true,
  },
];

export default function BusinessesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Filter the businesses based on search term and filters
  const filteredBusinesses = DUMMY_BUSINESSES.filter((business) => {
    const matchesSearch = searchTerm
      ? business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesLocation = locationFilter
      ? business.city.toLowerCase().includes(locationFilter.toLowerCase())
      : true;

    const matchesType = typeFilter === "all" || !typeFilter
      ? true
      : business.type === typeFilter;

    const matchesVerified = verifiedOnly
      ? business.isVerified
      : true;

    return matchesSearch && matchesLocation && matchesType && matchesVerified;
  });

  // Featured businesses
  const featuredBusinesses = DUMMY_BUSINESSES.filter(
    (business) => business.isFeatured && business.isVerified
  );

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-4">Halal Business Directory</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover local halal-certified businesses and services in your community.
        </p>
      </div>

      {/* Search and filters */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Input
            placeholder="Search businesses..."
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
            value={typeFilter}
            onValueChange={setTypeFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Business type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {BUSINESS_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="verified-only"
            checked={verifiedOnly}
            onChange={(e) => setVerifiedOnly(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="verified-only" className="text-sm">
            Halal Verified Only
          </label>
          <Button
            onClick={() => {
              setSearchTerm("");
              setLocationFilter("");
              setTypeFilter("all");
              setVerifiedOnly(false);
            }}
            variant="outline"
            size="sm"
            className="ml-auto"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Featured businesses section - only show if there are featured businesses */}
      {featuredBusinesses.length > 0 && (
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6">Featured Businesses</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredBusinesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        </div>
      )}

      {/* All businesses */}
      <div>
        <h2 className="text-xl font-semibold mb-6">All Businesses</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBusinesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>

        {filteredBusinesses.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No businesses found</h3>
            <p className="text-gray-600">
              Try adjusting your search filters or register your business if you
              are a business owner.
            </p>
          </div>
        )}
      </div>

      {/* Registration CTA */}
      <div className="mt-12 p-6 bg-green-50 rounded-lg">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">
            Are you a halal business owner?
          </h3>
          <p className="text-gray-600 mb-4">
            Register your business on MosqueConnect to get visibility in the Muslim community
            and apply for halal certification.
          </p>
          <Link href="/register?role=business">
            <Button>Register Your Business</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Business card component
function BusinessCard({ business }: { business: any }) {
  return (
    <Card className="overflow-hidden">
      <div className="h-40 bg-gray-100 flex items-center justify-center">
        <div className="text-gray-400">Business Image</div>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-md">{business.name}</h3>
          {business.isVerified && (
            <div className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
              Verified
            </div>
          )}
        </div>
        <p className="text-gray-600 text-xs mb-3">
          {business.type} • {business.city}
        </p>
        <p className="text-gray-600 text-xs mb-4 line-clamp-2">
          {business.description}
        </p>
        <Link href={`/businesses/${business.id}`}>
          <Button variant="outline" size="sm" className="w-full">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
