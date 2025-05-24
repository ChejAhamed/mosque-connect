"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building,
  Timer,
  BookOpen,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function VolunteerManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [volunteers, setVolunteers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVolunteer, setSelectedVolunteer] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [assignmentDetails, setAssignmentDetails] = useState("");
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0,
    activeAssignments: 0
  });
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedAvailability, setSelectedAvailability] = useState({});

  // Available skills for filtering
  const skillOptions = [
    "Teaching", "Cleaning", "Event Organization", "Translation",
    "Administrative", "Social Media", "IT Support", "Graphic Design",
    "Website Management", "Cooking", "Childcare", "Fundraising",
    "Security", "First Aid", "Counseling", "Tutoring"
  ];

  // Days of the week for availability filtering
  const daysOfWeek = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];

  // Time slots for availability filtering
  const timeSlots = ["Morning", "Afternoon", "Evening"];

  // Check if user is authenticated and is an admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/volunteers");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/unauthorized");
      return;
    }

    if (status === "authenticated") {
      fetchVolunteers();
    }
  }, [status, session, router]);

  // Fetch volunteers
  const fetchVolunteers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/admin/volunteers");
      if (response.data.volunteers) {
        setVolunteers(response.data.volunteers);

        // Calculate stats
        const newStats = {
          pending: 0,
          approved: 0,
          rejected: 0,
          total: response.data.volunteers.length,
          activeAssignments: 0
        };

        response.data.volunteers.forEach(volunteer => {
          if (volunteer.status) {
            newStats[volunteer.status]++;
          }

          if (volunteer.currentAssignment) {
            newStats.activeAssignments++;
          }
        });

        setStats(newStats);
      }
    } catch (error) {
      console.error("Error fetching volunteers:", error);
      toast({
        title: "Error",
        description: "Failed to load volunteer data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter volunteers based on search term and filters
  const getFilteredVolunteers = () => {
    return volunteers.filter(volunteer => {
      // Text search
      const matchesSearch =
        (volunteer.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (volunteer.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (volunteer.preferredMosque?.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      // Skills filter
      if (selectedSkills.length > 0) {
        const hasSelectedSkill = selectedSkills.some(skill =>
          volunteer.skills?.includes(skill)
        );
        if (!hasSelectedSkill) return false;
      }

      // Availability filter
      const selectedDays = Object.keys(selectedAvailability).filter(
        day => selectedAvailability[day] && selectedAvailability[day].length > 0
      );

      if (selectedDays.length > 0) {
        const isAvailable = selectedDays.some(day => {
          // Check if volunteer is available on this day
          if (!volunteer.availability?.[day.toLowerCase()]) return false;

          // Check if volunteer is available during selected time slots
          return selectedAvailability[day].some(timeSlot =>
            volunteer.availability[day.toLowerCase()].includes(timeSlot)
          );
        });

        if (!isAvailable) return false;
      }

      return true;
    });
  };

  // Get volunteers by status
  const getVolunteersByStatus = (status) => {
    return getFilteredVolunteers().filter(volunteer => volunteer.status === status);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Toggle skill selection for filtering
  const toggleSkillSelection = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // Toggle availability selection for filtering
  const toggleAvailabilitySelection = (day, timeSlot) => {
    const currentTimeSlots = selectedAvailability[day] || [];

    if (currentTimeSlots.includes(timeSlot)) {
      setSelectedAvailability({
        ...selectedAvailability,
        [day]: currentTimeSlots.filter(t => t !== timeSlot)
      });
    } else {
      setSelectedAvailability({
        ...selectedAvailability,
        [day]: [...currentTimeSlots, timeSlot]
      });
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSkills([]);
    setSelectedAvailability({});
  };

  // Handle volunteer action (approve, reject, assign)
  const handleVolunteerAction = async () => {
    if (!selectedVolunteer || !actionType) return;

    try {
      setLoading(true);

      const payload = {
        status: actionType,
        notes: reviewNotes
      };

      // Add assignment details if assigning
      if (actionType === "assign") {
        if (!assignmentDetails) {
          toast({
            title: "Missing Information",
            description: "Please provide assignment details.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        payload.currentAssignment = assignmentDetails;
        payload.assignmentDate = new Date().toISOString();
      }

      const response = await axios.patch(
        `/api/admin/volunteers/${selectedVolunteer._id}`,
        payload
      );

      if (response.data.volunteer) {
        // Update the volunteer in the local state
        setVolunteers(prevVolunteers =>
          prevVolunteers.map(volunteer =>
            volunteer._id === selectedVolunteer._id ? response.data.volunteer : volunteer
          )
        );

        // Recalculate stats if status changed
        if (actionType === "approved" || actionType === "rejected" || actionType === "pending") {
          setStats(prevStats => {
            const newStats = { ...prevStats };
            if (selectedVolunteer.status) {
              newStats[selectedVolunteer.status]--;
            }
            newStats[actionType]++;

            if (actionType === "assign") {
              newStats.activeAssignments++;
            }

            return newStats;
          });
        }

        toast({
          title: "Success",
          description: actionType === "assign"
            ? "Volunteer assigned successfully."
            : `Volunteer ${actionType === "approved" ? "approved" : actionType === "rejected" ? "rejected" : "updated"} successfully.`,
        });

        // Clear selection and form
        setDialogOpen(false);
        setSelectedVolunteer(null);
        setReviewNotes("");
        setAssignmentDetails("");
        setActionType(null);
      }
    } catch (error) {
      console.error("Error updating volunteer:", error);
      toast({
        title: "Error",
        description: "Failed to update volunteer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Open action dialog
  const openActionDialog = (volunteer, type) => {
    setSelectedVolunteer(volunteer);
    setActionType(type);
    setReviewNotes("");
    setAssignmentDetails("");
    setDialogOpen(true);
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  // Render volunteer skills
  const renderSkills = (skills) => {
    if (!skills || skills.length === 0) return <p className="text-gray-500 text-sm">No skills specified</p>;

    return (
      <div className="flex flex-wrap gap-1">
        {skills.map(skill => (
          <Badge key={skill} variant="outline" className="text-xs">
            {skill}
          </Badge>
        ))}
      </div>
    );
  };

  // Render volunteer availability
  const renderAvailability = (availability) => {
    if (!availability || Object.keys(availability).length === 0) {
      return <p className="text-gray-500 text-sm">No availability specified</p>;
    }

    return (
      <div className="grid grid-cols-1 gap-1">
        {Object.entries(availability).map(([day, times]) => (
          <div key={day} className="flex items-center text-xs">
            <span className="font-medium mr-1">{day.charAt(0).toUpperCase() + day.slice(1)}:</span>
            <span>{Array.isArray(times) ? times.join(", ") : times}</span>
          </div>
        ))}
      </div>
    );
  };

  // Loading state
  if (loading && volunteers.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Volunteer Management</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Volunteers</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <User className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-3xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-3xl font-bold">{stats.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Assignments</p>
                <p className="text-3xl font-bold">{stats.activeAssignments}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Search & Filters</CardTitle>
          <CardDescription>Find volunteers based on skills, availability, and more</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-10"
                placeholder="Search by name, email, or preferred mosque..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Skills Filter */}
            <div>
              <Label className="mb-2 block">Skills</Label>
              <div className="flex flex-wrap gap-2">
                {skillOptions.map(skill => (
                  <Badge
                    key={skill}
                    variant={selectedSkills.includes(skill) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleSkillSelection(skill)}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Availability Filter */}
            <div>
              <Label className="mb-2 block">Availability</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {daysOfWeek.map(day => (
                  <div key={day} className="border rounded-md p-2">
                    <p className="font-medium text-sm mb-1">{day}</p>
                    <div className="flex flex-wrap gap-1">
                      {timeSlots.map(timeSlot => (
                        <Badge
                          key={`${day}-${timeSlot}`}
                          variant={
                            selectedAvailability[day]?.includes(timeSlot)
                              ? "default"
                              : "outline"
                          }
                          className="cursor-pointer text-xs"
                          onClick={() => toggleAvailabilitySelection(day, timeSlot)}
                        >
                          {timeSlot}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
          <div className="text-sm text-gray-500">
            {getFilteredVolunteers().length} volunteers matching filters
          </div>
        </CardFooter>
      </Card>

      {/* Volunteer Tabs */}
      <Tabs defaultValue="all" className="mb-6">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            All ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approved ({stats.approved})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Rejected ({stats.rejected})
          </TabsTrigger>
        </TabsList>

        {/* All Volunteers Tab */}
        <TabsContent value="all">
          {getFilteredVolunteers().length > 0 ? (
            <div className="space-y-4">
              {getFilteredVolunteers().map((volunteer) => (
                <VolunteerCard
                  key={volunteer._id}
                  volunteer={volunteer}
                  renderStatusBadge={renderStatusBadge}
                  renderSkills={renderSkills}
                  renderAvailability={renderAvailability}
                  formatDate={formatDate}
                  openActionDialog={openActionDialog}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Volunteers Found</h3>
              <p className="text-gray-500">No volunteers match your current filters.</p>
            </div>
          )}
        </TabsContent>

        {/* Pending Volunteers Tab */}
        <TabsContent value="pending">
          {getVolunteersByStatus("pending").length > 0 ? (
            <div className="space-y-4">
              {getVolunteersByStatus("pending").map((volunteer) => (
                <VolunteerCard
                  key={volunteer._id}
                  volunteer={volunteer}
                  renderStatusBadge={renderStatusBadge}
                  renderSkills={renderSkills}
                  renderAvailability={renderAvailability}
                  formatDate={formatDate}
                  openActionDialog={openActionDialog}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Pending Volunteers</h3>
              <p className="text-gray-500">There are no pending volunteer applications.</p>
            </div>
          )}
        </TabsContent>

        {/* Approved Volunteers Tab */}
        <TabsContent value="approved">
          {getVolunteersByStatus("approved").length > 0 ? (
            <div className="space-y-4">
              {getVolunteersByStatus("approved").map((volunteer) => (
                <VolunteerCard
                  key={volunteer._id}
                  volunteer={volunteer}
                  renderStatusBadge={renderStatusBadge}
                  renderSkills={renderSkills}
                  renderAvailability={renderAvailability}
                  formatDate={formatDate}
                  openActionDialog={openActionDialog}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Approved Volunteers</h3>
              <p className="text-gray-500">There are no approved volunteers yet.</p>
            </div>
          )}
        </TabsContent>

        {/* Rejected Volunteers Tab */}
        <TabsContent value="rejected">
          {getVolunteersByStatus("rejected").length > 0 ? (
            <div className="space-y-4">
              {getVolunteersByStatus("rejected").map((volunteer) => (
                <VolunteerCard
                  key={volunteer._id}
                  volunteer={volunteer}
                  renderStatusBadge={renderStatusBadge}
                  renderSkills={renderSkills}
                  renderAvailability={renderAvailability}
                  formatDate={formatDate}
                  openActionDialog={openActionDialog}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <XCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Rejected Volunteers</h3>
              <p className="text-gray-500">There are no rejected volunteer applications.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approved"
                ? "Approve Volunteer"
                : actionType === "rejected"
                ? "Reject Volunteer"
                : actionType === "assign"
                ? "Assign Volunteer"
                : "Update Volunteer"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approved"
                ? "Approve this volunteer application."
                : actionType === "rejected"
                ? "Provide a reason for rejecting this volunteer application."
                : actionType === "assign"
                ? "Assign this volunteer to a task or role."
                : "Update the status of this volunteer application."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Volunteer Info Summary */}
            {selectedVolunteer && (
              <div className="border rounded-md p-3 bg-gray-50">
                <p className="font-medium">{selectedVolunteer.name}</p>
                <p className="text-sm text-gray-500">{selectedVolunteer.email}</p>
              </div>
            )}

            {/* Notes Field */}
            <div className="space-y-2">
              <Label htmlFor="notes">
                {actionType === "rejected" ? "Rejection Reason" : "Notes"}
              </Label>
              <Textarea
                id="notes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={
                  actionType === "rejected"
                    ? "Explain why this application is being rejected..."
                    : "Add any notes about this volunteer..."
                }
                rows={4}
              />
            </div>

            {/* Assignment Fields */}
            {actionType === "assign" && (
              <div className="space-y-2">
                <Label htmlFor="assignmentDetails">Assignment Details</Label>
                <Textarea
                  id="assignmentDetails"
                  value={assignmentDetails}
                  onChange={(e) => setAssignmentDetails(e.target.value)}
                  placeholder="Describe the assignment, location, times, and responsibilities..."
                  rows={4}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant={
                actionType === "approved"
                  ? "default"
                  : actionType === "rejected"
                  ? "destructive"
                  : actionType === "assign"
                  ? "default"
                  : "outline"
              }
              className={
                actionType === "approved" || actionType === "assign"
                  ? "bg-green-600 hover:bg-green-700"
                  : ""
              }
              onClick={handleVolunteerAction}
              disabled={loading}
            >
              {loading ? "Processing..." : actionType === "approved"
                ? "Approve Volunteer"
                : actionType === "rejected"
                ? "Reject Volunteer"
                : actionType === "assign"
                ? "Assign Volunteer"
                : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Volunteer Card Component
function VolunteerCard({
  volunteer,
  renderStatusBadge,
  renderSkills,
  renderAvailability,
  formatDate,
  openActionDialog
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{volunteer.name}</CardTitle>
            <CardDescription className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {volunteer.email}
            </CardDescription>
          </div>
          {renderStatusBadge(volunteer.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-medium mb-2">Contact Information</h3>
            <div className="space-y-1">
              {volunteer.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-500" />
                  {volunteer.phone}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                Applied: {formatDate(volunteer.createdAt)}
              </div>
              {volunteer.preferredMosque && (
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-gray-500" />
                  Preferred Mosque: {volunteer.preferredMosque}
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-sm font-medium mb-2">Skills</h3>
            {renderSkills(volunteer.skills)}
          </div>

          {/* Availability */}
          <div>
            <h3 className="text-sm font-medium mb-2">Availability</h3>
            {renderAvailability(volunteer.availability)}
          </div>
        </div>

        {/* Expanded details */}
        {isExpanded && (
          <div className="mt-4 space-y-4">
            {/* Status & Review Information */}
            {volunteer.reviewedAt && (
              <div className="border rounded-md p-3 bg-gray-50">
                <h3 className="text-sm font-medium mb-1">Review Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3 text-gray-500" />
                    Reviewed by: {volunteer.reviewerName || "Admin"}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-gray-500" />
                    Reviewed on: {formatDate(volunteer.reviewedAt)}
                  </div>
                </div>
                {volunteer.notes && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-500">Notes:</p>
                    <p className="text-sm">{volunteer.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Current Assignment */}
            {volunteer.currentAssignment && (
              <div className="border rounded-md p-3 bg-blue-50">
                <h3 className="text-sm font-medium mb-1">Current Assignment</h3>
                <div className="text-sm">
                  {volunteer.currentAssignment}
                </div>
                {volunteer.assignmentDate && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-600">
                    <Calendar className="h-3 w-3" />
                    Assigned: {formatDate(volunteer.assignmentDate)}
                  </div>
                )}
              </div>
            )}

            {/* Additional Info */}
            {volunteer.additionalInfo && (
              <div className="border rounded-md p-3">
                <h3 className="text-sm font-medium mb-1">Additional Information</h3>
                <p className="text-sm">{volunteer.additionalInfo}</p>
              </div>
            )}
          </div>
        )}

        {/* Expand/Collapse Button */}
        <Button
          variant="ghost"
          className="w-full mt-2 text-gray-500"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Show Less" : "Show More"}
        </Button>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {volunteer.status === "pending" && (
          <>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => openActionDialog(volunteer, "approved")}
            >
              Approve
            </Button>
            <Button
              variant="destructive"
              onClick={() => openActionDialog(volunteer, "rejected")}
            >
              Reject
            </Button>
          </>
        )}

        {volunteer.status === "approved" && (
          <>
            <Button
              variant="outline"
              onClick={() => openActionDialog(volunteer, "assign")}
            >
              Assign
            </Button>
            <Button
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
              onClick={() => openActionDialog(volunteer, "rejected")}
            >
              Revoke Approval
            </Button>
          </>
        )}

        {volunteer.status === "rejected" && (
          <Button
            variant="outline"
            onClick={() => openActionDialog(volunteer, "approved")}
          >
            Reconsider
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
