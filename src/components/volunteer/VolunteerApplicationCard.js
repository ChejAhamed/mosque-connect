"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  BuildingIcon,
  CheckCircleIcon,
  XCircleIcon,
  MessageSquareIcon,
  EyeIcon
} from "lucide-react";

export default function VolunteerApplicationCard({ 
  application, 
  onStatusChange, 
  onContact, 
  onViewDetails,
  showMosqueInfo = true,
  showActions = true,
  currentUserRole = null 
}) {
  const [isUpdating, setIsUpdating] = useState(false);

  const getStatusColor = (status) => {
    const statusMap = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      reviewed: "bg-blue-100 text-blue-800"
    };
    return statusMap[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusBadge = (status) => {
    const statusLabels = {
      pending: "Pending",
      accepted: "Accepted",
      rejected: "Rejected",
      reviewed: "Reviewed"
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
      await onStatusChange(application._id, newStatus);
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
              {application.userId?.name}
            </CardTitle>
            <p className="text-gray-600 mt-1">{application.title}</p>
          </div>
          {getStatusBadge(application.status)}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Mosque Information */}
        {showMosqueInfo && application.mosqueId && (
          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="font-medium text-sm flex items-center mb-1">
              <BuildingIcon className="h-3 w-3 mr-1" />
              Mosque
            </h4>
            <p className="text-gray-700">{application.mosqueId.name}</p>
            <p className="text-sm text-gray-500">{application.mosqueId.city}</p>
          </div>
        )}

        {/* Contact Information */}
        <div>
          <h4 className="font-medium text-sm mb-2">Contact Information</h4>
          <div className="space-y-1">
            <div className="flex items-center text-sm">
              <MailIcon className="h-3 w-3 mr-2 text-gray-400" />
              {application.contactInfo?.email || application.userId?.email}
            </div>
            {application.contactInfo?.phone && (
              <div className="flex items-center text-sm">
                <PhoneIcon className="h-3 w-3 mr-2 text-gray-400" />
                {application.contactInfo.phone}
              </div>
            )}
            <div className="flex items-center text-sm">
              <MapPinIcon className="h-3 w-3 mr-2 text-gray-400" />
              {application.userId?.city}
            </div>
          </div>
        </div>

        {/* Application Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm">Category & Availability</h4>
            <Badge variant="outline" className="mb-1">{application.category}</Badge>
            <div className="flex items-center text-sm text-gray-600">
              <ClockIcon className="h-3 w-3 mr-1" />
              {application.availability}
            </div>
            <p className="text-xs text-gray-500">
              Time: {application.timeCommitment}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-sm">Application Date</h4>
            <div className="flex items-center text-sm text-gray-600">
              <CalendarIcon className="h-3 w-3 mr-1" />
              {new Date(application.createdAt).toLocaleDateString()}
            </div>
            {application.mosqueResponse?.respondedAt && (
              <p className="text-xs text-gray-500">
                Responded: {new Date(application.mosqueResponse.respondedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Motivation Message */}
        {application.motivationMessage && (
          <div>
            <h4 className="font-medium text-sm mb-2">Motivation</h4>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-md text-sm line-clamp-3">
              {application.motivationMessage}
            </p>
          </div>
        )}

        {/* Skills */}
        {application.skillsOffered?.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">Skills Offered</h4>
            <div className="flex flex-wrap gap-1">
              {application.skillsOffered.slice(0, 4).map(skill => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {application.skillsOffered.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{application.skillsOffered.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Mosque Response */}
        {application.mosqueResponse && (
          <Alert className="bg-blue-50 border-blue-200">
            <MessageSquareIcon className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium text-sm">Mosque Response:</p>
                <p className="text-sm">{application.mosqueResponse.message}</p>
                <p className="text-xs text-gray-500">
                  By {application.mosqueResponse.respondedBy?.name} on{" "}
                  {new Date(application.mosqueResponse.respondedAt).toLocaleDateString()}
                </p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2 border-t">
            {application.status === "pending" && (currentUserRole === 'imam' || currentUserRole === 'admin') && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleStatusChange('accepted')}
                  disabled={isUpdating}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange('rejected')}
                  disabled={isUpdating}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  <XCircleIcon className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
            
            {onContact && (
              <Button size="sm" variant="outline" onClick={() => onContact(application)}>
                <MailIcon className="h-4 w-4 mr-2" />
                Contact
              </Button>
            )}
            
            {onViewDetails && (
              <Button size="sm" variant="outline" onClick={() => onViewDetails(application)}>
                <EyeIcon className="h-4 w-4 mr-2" />
                Details
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}