"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  ActivityIcon,
  MessageSquareIcon,
  EyeIcon,
  StarIcon
} from "lucide-react";

export default function VolunteerOfferCard({ 
  offer, 
  onContact, 
  onViewDetails,
  onStatusChange,
  showActions = true,
  currentUserRole = null 
}) {
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusColor = (status) => {
    const statusMap = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      matched: "bg-blue-100 text-blue-800"
    };
    return statusMap[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusBadge = (status) => {
    const statusLabels = {
      active: "Active",
      inactive: "Inactive",
      matched: "Matched"
    };

    return (
      <Badge className={getStatusColor(status)}>
        {statusLabels[status] || status}
      </Badge>
    );
  };

  const handleStatusChange = async (newStatus) => {
    if (!onStatusChange) return;
    
    setIsUpdating(true);
    try {
      await onStatusChange(offer._id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start mb-2">
          <div>
            <CardTitle className="text-lg flex items-center">
              <UserIcon className="h-4 w-4 mr-2" />
              {offer.userId?.name}
            </CardTitle>
            <p className="text-gray-600 mt-1">{offer.title}</p>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <MapPinIcon className="h-3 w-3 mr-1" />
              {offer.userId?.city}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {getStatusBadge(offer.status)}
            {offer.isGeneralOffer && (
              <Badge variant="outline" className="text-xs">
                General Offer
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Description */}
        <div>
          <p className="text-gray-700 text-sm line-clamp-3">
            {offer.description}
          </p>
        </div>

        {/* Contact Information */}
        <div>
          <h4 className="font-medium text-sm mb-2">Contact Information</h4>
          <div className="space-y-1">
            <div className="flex items-center text-sm">
              <MailIcon className="h-3 w-3 mr-2 text-gray-400" />
              {offer.contactInfo?.email || offer.userId?.email}
            </div>
            {offer.contactInfo?.phone && (
              <div className="flex items-center text-sm">
                <PhoneIcon className="h-3 w-3 mr-2 text-gray-400" />
                {offer.contactInfo.phone}
              </div>
            )}
          </div>
        </div>

        {/* Offer Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm">Category & Availability</h4>
            <Badge variant="outline" className="mb-1">{offer.category}</Badge>
            <div className="flex items-center text-sm text-gray-600">
              <ClockIcon className="h-3 w-3 mr-1" />
              {offer.availability}
            </div>
            <p className="text-xs text-gray-500">
              Commitment: {offer.timeCommitment}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-sm">Posted</h4>
            <div className="flex items-center text-sm text-gray-600">
              <CalendarIcon className="h-3 w-3 mr-1" />
              {new Date(offer.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Skills Offered */}
        {offer.skillsOffered?.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">Skills Offered</h4>
            <div className="flex flex-wrap gap-1">
              {offer.skillsOffered.slice(0, 4).map(skill => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {offer.skillsOffered.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{offer.skillsOffered.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Preferred Locations */}
        {offer.preferredLocations?.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">Preferred Locations</h4>
            <div className="flex flex-wrap gap-1">
              {offer.preferredLocations.slice(0, 3).map(location => (
                <Badge key={location} variant="outline" className="text-xs">
                  {location}
                </Badge>
              ))}
              {offer.preferredLocations.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{offer.preferredLocations.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Languages */}
        {offer.languages?.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">Languages</h4>
            <div className="flex flex-wrap gap-1">
              {offer.languages.slice(0, 4).map(language => (
                <Badge key={language} variant="outline" className="text-xs">
                  {language}
                </Badge>
              ))}
              {offer.languages.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{offer.languages.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Experience */}
        {offer.experience && (
          <div>
            <h4 className="font-medium text-sm mb-2">Experience</h4>
            <p className="text-gray-700 text-sm bg-gray-50 p-2 rounded line-clamp-2">
              {offer.experience}
            </p>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2 border-t">
            {/* Admin actions */}
            {currentUserRole === 'admin' && (
              <>
                {offer.status === "active" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange('inactive')}
                    disabled={isUpdating}
                    className="text-gray-600"
                  >
                    Deactivate
                  </Button>
                )}
                {offer.status === "inactive" && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange('active')}
                    disabled={isUpdating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Activate
                  </Button>
                )}
              </>
            )}

            {/* Imam actions */}
            {(currentUserRole === 'imam' || currentUserRole === 'admin') && onContact && (
              <Button size="sm" onClick={() => onContact(offer)}>
                <MailIcon className="h-4 w-4 mr-2" />
                Contact Volunteer
              </Button>
            )}

            {/* Interest button for imams */}
            {currentUserRole === 'imam' && (
              <Button size="sm" variant="outline">
                <StarIcon className="h-4 w-4 mr-2" />
                Express Interest
              </Button>
            )}
            
            {onViewDetails && (
              <Button size="sm" variant="outline" onClick={() => onViewDetails(offer)}>
                <EyeIcon className="h-4 w-4 mr-2" />
                View Full Profile
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}