"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  SearchIcon,
  FilterIcon,
  XIcon
} from "lucide-react";

export default function VolunteerFilters({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  locationFilter,
  setLocationFilter,
  dateFilter,
  setDateFilter,
  mosqueFilter,
  setMosqueFilter,
  mosques = [],
  showMosqueFilter = false,
  activeFiltersCount = 0,
  onClearFilters
}) {
  const categories = [
    { value: "all", label: "All Categories" },
    { value: "education", label: "Education" },
    { value: "cleaning", label: "Cleaning & Maintenance" },
    { value: "technical", label: "Technical Support" },
    { value: "administration", label: "Administration" },
    { value: "events", label: "Events" },
    { value: "outreach", label: "Community Outreach" },
    { value: "other", label: "Other" }
  ];

  const statuses = [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" }
  ];

  const dateOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" }
  ];

  const locations = [
    "London", "Birmingham", "Manchester", "Liverpool", "Leeds", 
    "Glasgow", "Edinburgh", "Bristol", "Sheffield", "Leicester"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <FilterIcon className="mr-2 h-5 w-5" />
            Search & Filters
          </div>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount} active
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <SearchIcon className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search volunteers, skills, mosques..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Location Filter */}
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters Button */}
          <Button 
            variant="outline" 
            onClick={onClearFilters}
            className="flex items-center"
          >
            <XIcon className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>

        {/* Second Row for Additional Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          {/* Mosque Filter (shown conditionally) */}
          {showMosqueFilter && (
            <Select value={mosqueFilter} onValueChange={setMosqueFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Mosque" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Mosques</SelectItem>
                {mosques.map((mosque) => (
                  <SelectItem key={mosque._id} value={mosque._id}>
                    {mosque.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Date Filter */}
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              {dateOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary" className="text-xs">
                  Search: "{searchTerm}"
                  <XIcon 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setSearchTerm("")}
                  />
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  Status: {statuses.find(s => s.value === statusFilter)?.label}
                  <XIcon 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setStatusFilter("all")}
                  />
                </Badge>
              )}
              {categoryFilter !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  Category: {categories.find(c => c.value === categoryFilter)?.label}
                  <XIcon 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setCategoryFilter("all")}
                  />
                </Badge>
              )}
              {locationFilter !== "all" && (
                <Badge variant="secondary" className="text-xs">
                  Location: {locationFilter}
                  <XIcon 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => setLocationFilter("all")}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}