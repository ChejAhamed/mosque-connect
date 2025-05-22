"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import {
  UserIcon,
  BuildingIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  UsersIcon,
  FileCheckIcon,
  FileIcon
} from "lucide-react";

export default function ImamDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [mosques, setMosques] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [halalRequests, setHalalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalMosques: 0,
    pendingVolunteers: 0,
    approvedVolunteers: 0,
    pendingHalalRequests: 0,
    approvedHalalRequests: 0,
    rejectedHalalRequests: 0,
    underReviewHalalRequests: 0
  });

  useEffect(() => {
    // Redirect if not logged in or not an imam
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/dashboard/imam");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "imam" && session?.user?.role !== "admin") {
      router.push("/unauthorized");
      return;
    }

    // Fetch imam's data
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // In a real implementation, you would fetch from your API
        // For now, use API calls with error handling

        try {
          // Fetch volunteers data
          const volunteersResponse = await axios.get('/api/imam/volunteers');
          setVolunteers(volunteersResponse.data.volunteers || []);

          // Fetch mosques data
          const mosquesResponse = await axios.get('/api/imam/mosques');
          setMosques(mosquesResponse.data.mosques || []);

          // Fetch halal certification requests
          const halalResponse = await axios.get('/api/imam/halal-certification-requests');
          setHalalRequests(halalResponse.data.requests || []);

        } catch (error) {
          console.error("Error fetching data:", error);

          // If API endpoints are not available, use mock data
          // Sample mosque data
          setMosques([
            {
              _id: "mosque1",
              name: "Example Mosque",
              address: "123 Main Street",
              city: "London",
              state: "Greater London",
              createdAt: new Date().toISOString(),
              verified: true
            }
          ]);

          // Sample volunteer data with detailed availability
          setVolunteers([
            {
              _id: "vol1",
              userId: "user1",
              name: "Ahmed Ali",
              email: "ahmed@example.com",
              skills: ["Teaching", "Cleaning", "Event Organization"],
              availability: {
                monday: ["Morning", "Evening"],
                friday: ["Afternoon"],
                sunday: ["Morning"]
              },
              preferredMosque: "Example Mosque",
              createdAt: new Date().toISOString(),
              status: "pending",
              phone: "07123456789"
            },
            {
              _id: "vol2",
              userId: "user2",
              name: "Fatima Khan",
              email: "fatima@example.com",
              skills: ["Translation", "Administrative", "Social Media"],
              availability: {
                tuesday: ["Afternoon"],
                wednesday: ["Morning"],
                saturday: ["Evening"]
              },
              preferredMosque: "Example Mosque",
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
              status: "approved",
              phone: "07987654321"
            },
            {
              _id: "vol3",
              userId: "user3",
              name: "Omar Yusuf",
              email: "omar@example.com",
              skills: ["IT Support", "Graphic Design", "Website Management"],
              availability: {
                monday: ["Evening"],
                thursday: ["Evening"],
                friday: ["Evening"]
              },
              preferredMosque: "Example Mosque",
              createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
              status: "rejected",
              phone: "07123123123"
            }
          ]);

          // Sample halal certification requests
          setHalalRequests([
            {
              _id: "cert1",
              businessId: "business1",
              businessName: "Halal Family Restaurant",
              businessType: "Restaurant",
              address: "45 Market Street, London",
              contactName: "Mohammed Ibrahim",
              contactEmail: "contact@halalfamily.com",
              contactPhone: "07111222333",
              submittedDocuments: ["Ingredient list", "Supplier certificates", "Process documentation"],
              details: "Family-owned restaurant serving authentic Middle Eastern cuisine. All meats sourced from certified halal suppliers.",
              supplierInfo: "Meat supplied by Abdullah Halal Meats Ltd. (cert #12345). Other ingredients from various local suppliers.",
              requestDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
              status: "pending"
            },
            {
              _id: "cert2",
              businessId: "business2",
              businessName: "Medina Butchers",
              businessType: "Butcher shop",
              address: "78 High Street, Birmingham",
              contactName: "Yusuf Ahmed",
              contactEmail: "info@medinabutchers.com",
              contactPhone: "07444555666",
              submittedDocuments: ["Slaughter certificates", "Supplier information", "Premises photos"],
              details: "Traditional butcher shop specializing in halal meat and poultry. All animals slaughtered according to Islamic principles.",
              supplierInfo: "Direct sourcing from local farms with Islamic slaughter. Processing done on premises.",
              requestDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              status: "under_review"
            },
            {
              _id: "cert3",
              businessId: "business3",
              businessName: "Baraka Bakery",
              businessType: "Bakery",
              address: "124 Green Lane, Manchester",
              contactName: "Aisha Malik",
              contactEmail: "aisha@barakabakery.com",
              contactPhone: "07777888999",
              submittedDocuments: ["Ingredient list", "Manufacturing process"],
              details: "Artisan bakery offering traditional breads, desserts and pastries. No alcohol or pork derivatives used.",
              supplierInfo: "Flour from Taylor's Mill. Dairy products from Organic Valley. Eggs from free-range farms.",
              requestDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
              status: "approved"
            },
            {
              _id: "cert4",
              businessId: "business4",
              businessName: "Safa Grocers",
              businessType: "Grocery Store",
              address: "15 Hillside Avenue, Leicester",
              contactName: "Hassan Khan",
              contactEmail: "hassan@safagrocers.com",
              contactPhone: "07999000111",
              submittedDocuments: ["Product list", "Supplier certificates"],
              details: "Neighborhood grocery store specializing in imported foods from the Middle East and South Asia.",
              supplierInfo: "Multiple suppliers - detailed list provided in documents.",
              requestDate: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
              status: "rejected"
            }
          ]);
        }

        // Calculate stats
        const newStats = {
          totalMosques: mosques.length,
          pendingVolunteers: volunteers.filter(v => v.status === "pending").length,
          approvedVolunteers: volunteers.filter(v => v.status === "approved").length,
          rejectedVolunteers: volunteers.filter(v => v.status === "rejected").length,
          pendingHalalRequests: halalRequests.filter(r => r.status === "pending").length,
          approvedHalalRequests: halalRequests.filter(r => r.status === "approved").length,
          rejectedHalalRequests: halalRequests.filter(r => r.status === "rejected").length,
          underReviewHalalRequests: halalRequests.filter(r => r.status === "under_review").length
        };

        setStats(newStats);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchDashboardData();
    }
  }, [session, status, router, toast]);

  const handleVolunteerStatusChange = async (volunteerId, newStatus) => {
    try {
      setLoading(true);

      // In a real implementation, you would call your API
      try {
        await axios.patch(`/api/imam/volunteers/${volunteerId}`, { status: newStatus });

        // Update local state
        setVolunteers(volunteers.map(volunteer =>
          volunteer._id === volunteerId ? { ...volunteer, status: newStatus } : volunteer
        ));

        toast({
          title: "Status Updated",
          description: `Volunteer status changed to ${newStatus}`,
        });
      } catch (error) {
        console.error("Error updating volunteer status:", error);

        // For demo, update local state anyway
        setVolunteers(volunteers.map(volunteer =>
          volunteer._id === volunteerId ? { ...volunteer, status: newStatus } : volunteer
        ));

        toast({
          title: "Status Updated (Demo)",
          description: `Volunteer status changed to ${newStatus}`,
        });
      }
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Failed to update volunteer status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleHalalRequestStatusChange = async (requestId, newStatus) => {
    try {
      setLoading(true);

      // In a real implementation, you would call your API
      try {
        await axios.patch(`/api/imam/halal-certification-requests/${requestId}`, {
          status: newStatus,
          reviewerId: session.user.id,
          reviewNotes: `Status updated to ${newStatus} by ${session.user.name}`
        });

        // Update local state
        setHalalRequests(halalRequests.map(request =>
          request._id === requestId ? { ...request, status: newStatus } : request
        ));

        toast({
          title: "Status Updated",
          description: `Certification request status changed to ${newStatus}`,
        });
      } catch (error) {
        console.error("Error updating halal certification status:", error);

        // For demo, update local state anyway
        setHalalRequests(halalRequests.map(request =>
          request._id === requestId ? { ...request, status: newStatus } : request
        ));

        toast({
          title: "Status Updated (Demo)",
          description: `Certification request status changed to ${newStatus}`,
        });
      }
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Failed to update certification status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      under_review: "bg-blue-100 text-blue-800"
    };
    return statusMap[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusBadge = (status) => {
    const statusLabels = {
      pending: "Pending",
      approved: "Approved",
      rejected: "Rejected",
      under_review: "Under Review"
    };

    return (
      <Badge className={getStatusColor(status)}>
        {statusLabels[status] || status}
      </Badge>
    );
  };

  if (status === "loading" || loading) {
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
      <h1 className="text-3xl font-bold mb-6">Imam Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="bg-green-50">
            <CardTitle className="flex items-center">
              <BuildingIcon className="mr-2 h-5 w-5" />
              My Mosques
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold">{stats.totalMosques}</p>
            <p className="text-gray-500 mt-2">Registered mosques</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center">
              <UsersIcon className="mr-2 h-5 w-5" />
              Volunteer Applications
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold">{stats.pendingVolunteers}</p>
            <p className="text-gray-500 mt-2">Pending volunteer applications</p>
            <div className="flex items-center mt-2 gap-2 flex-wrap">
              <Badge variant="outline" className="flex items-center">
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                {stats.approvedVolunteers} Approved
              </Badge>
              <Badge variant="outline" className="flex items-center">
                <XCircleIcon className="h-3 w-3 mr-1" />
                {stats.rejectedVolunteers || 0} Rejected
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-amber-50">
            <CardTitle className="flex items-center">
              <FileCheckIcon className="mr-2 h-5 w-5" />
              Halal Certification
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold">{stats.pendingHalalRequests}</p>
            <p className="text-gray-500 mt-2">Pending requests</p>
            <div className="flex items-center mt-2 gap-2 flex-wrap">
              <Badge variant="outline" className="flex items-center">
                <ClockIcon className="h-3 w-3 mr-1" />
                {stats.underReviewHalalRequests} In Review
              </Badge>
              <Badge variant="outline" className="flex items-center">
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                {stats.approvedHalalRequests} Approved
              </Badge>
              <Badge variant="outline" className="flex items-center">
                <XCircleIcon className="h-3 w-3 mr-1" />
                {stats.rejectedHalalRequests} Rejected
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="mb-8" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
          <TabsTrigger value="halal-verification">Halal Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>My Mosques</CardTitle>
                <CardDescription>Manage the mosques you administer</CardDescription>
              </CardHeader>
              <CardContent>
                {mosques.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-gray-500 mb-4">You haven't registered any mosques yet.</p>
                    <Button>Register a Mosque</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mosques.map(mosque => (
                      <div key={mosque._id} className="border rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">{mosque.name}</h3>
                          <p className="text-sm text-gray-500">{mosque.address}, {mosque.city}</p>
                          <div className="flex items-center mt-2">
                            {mosque.verified ? (
                              <Badge className="bg-green-100 text-green-800">
                                Verified
                              </Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                Pending Verification
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Manage
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Volunteer Applications</CardTitle>
                  <CardDescription>Latest volunteers for your mosque</CardDescription>
                </CardHeader>
                <CardContent>
                  {volunteers.length === 0 ? (
                    <p className="text-gray-500 text-center py-6">No volunteer applications yet</p>
                  ) : (
                    <div className="space-y-4">
                      {volunteers.slice(0, 2).map(volunteer => (
                        <div key={volunteer._id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{volunteer.name}</h3>
                              <p className="text-sm text-gray-500">{volunteer.email}</p>
                            </div>
                            {getStatusBadge(volunteer.status)}
                          </div>
                          <div className="mt-2">
                            <p className="text-xs text-gray-500">Skills: {volunteer.skills.join(", ")}</p>
                            <p className="text-xs text-gray-500">
                              Available: {Object.entries(volunteer.availability || {})
                                .filter(([_, times]) => times && times.length > 0)
                                .map(([day, times]) => `${day.charAt(0).toUpperCase() + day.slice(1)} (${times.join(", ")})`)
                                .join("; ")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-center">
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("volunteers")}>
                    View All Volunteers
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Halal Certification</CardTitle>
                  <CardDescription>Latest certification requests</CardDescription>
                </CardHeader>
                <CardContent>
                  {halalRequests.length === 0 ? (
                    <p className="text-gray-500 text-center py-6">No certification requests yet</p>
                  ) : (
                    <div className="space-y-4">
                      {halalRequests.slice(0, 2).map(request => (
                        <div key={request._id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{request.businessName}</h3>
                              <p className="text-sm text-gray-500">{request.businessType}</p>
                            </div>
                            {getStatusBadge(request.status)}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Submitted: {new Date(request.requestDate).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-center">
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("halal-verification")}>
                    View All Requests
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="volunteers">
          <Card>
            <CardHeader>
              <CardTitle>Volunteer Applications</CardTitle>
              <CardDescription>Manage volunteers for your mosque</CardDescription>
            </CardHeader>
            <CardContent>
              {volunteers.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500">No volunteer applications yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {volunteers.map(volunteer => (
                    <div key={volunteer._id} className="border rounded-lg p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{volunteer.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-gray-500">{volunteer.email}</p>
                            {volunteer.phone && (
                              <p className="text-gray-500">| {volunteer.phone}</p>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(volunteer.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <h4 className="font-medium text-sm">Skills</h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {volunteer.skills.map(skill => (
                              <Badge key={skill} variant="secondary" className="mr-1 mt-1">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm">Availability</h4>
                          <div className="space-y-1 mt-1">
                            {Object.entries(volunteer.availability || {})
                              .filter(([_, times]) => times && times.length > 0)
                              .map(([day, times]) => (
                                <div key={day} className="flex items-center text-sm">
                                  <span className="font-medium w-24">{day.charAt(0).toUpperCase() + day.slice(1)}:</span>
                                  <span>{Array.isArray(times) ? times.join(", ") : times}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-medium text-sm">Preferred Mosque</h4>
                        <p className="text-gray-700">{volunteer.preferredMosque}</p>
                      </div>

                      <div className="mt-4">
                        <h4 className="font-medium text-sm">Application Date</h4>
                        <p className="text-gray-700">{new Date(volunteer.createdAt).toLocaleDateString()}</p>
                      </div>

                      {volunteer.status === "pending" && (
                        <div className="flex gap-2 mt-6">
                          <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleVolunteerStatusChange(volunteer._id, "approved")}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => handleVolunteerStatusChange(volunteer._id, "rejected")}
                          >
                            Reject
                          </Button>
                        </div>
                      )}

                      {volunteer.status === "approved" && (
                        <div className="flex gap-2 mt-6">
                          <Button variant="outline">
                            Contact Volunteer
                          </Button>
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => handleVolunteerStatusChange(volunteer._id, "rejected")}
                          >
                            Revoke Approval
                          </Button>
                        </div>
                      )}

                      {volunteer.status === "rejected" && (
                        <div className="flex gap-2 mt-6">
                          <Button
                            variant="outline"
                            onClick={() => handleVolunteerStatusChange(volunteer._id, "approved")}
                          >
                            Reconsider Application
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="halal-verification">
          <Card>
            <CardHeader>
              <CardTitle>Halal Certification Requests</CardTitle>
              <CardDescription>Verify and approve halal certification for businesses</CardDescription>
            </CardHeader>
            <CardContent>
              {halalRequests.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500">No certification requests yet.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {halalRequests.map(request => (
                    <div key={request._id} className="border rounded-lg p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{request.businessName}</h3>
                          <p className="text-gray-500">{request.businessType} | {request.address}, {request.city}</p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <h4 className="font-medium text-sm">Contact Information</h4>
                          <p className="text-gray-700">{request.contactName}</p>
                          <p className="text-gray-700">{request.contactEmail}</p>
                          {request.contactPhone && <p className="text-gray-700">{request.contactPhone}</p>}
                        </div>

                        <div>
                          <h4 className="font-medium text-sm">Request Date</h4>
                          <p className="text-gray-700">{new Date(request.requestDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {request.details && (
                        <div className="mt-4">
                          <h4 className="font-medium text-sm">Business Details</h4>
                          <p className="text-gray-700 text-sm mt-1 bg-gray-50 p-3 rounded-md">{request.details}</p>
                        </div>
                      )}

                      {request.supplierInfo && (
                        <div className="mt-4">
                          <h4 className="font-medium text-sm">Supplier Information</h4>
                          <p className="text-gray-700 text-sm mt-1 bg-gray-50 p-3 rounded-md">{request.supplierInfo}</p>
                        </div>
                      )}

                      <div className="mt-4">
                        <h4 className="font-medium text-sm">Submitted Documents</h4>
                        <ul className="list-disc list-inside text-gray-700 mt-1">
                          {request.submittedDocuments?.map((doc, index) => (
                            <li key={index} className="flex items-center">
                              <FileIcon className="h-4 w-4 mr-1 inline" />
                              {doc}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {request.status === "pending" && (
                        <div className="flex gap-2 mt-6">
                          <Button
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => handleHalalRequestStatusChange(request._id, "under_review")}
                          >
                            Start Review
                          </Button>
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => handleHalalRequestStatusChange(request._id, "rejected")}
                          >
                            Reject
                          </Button>
                        </div>
                      )}

                      {request.status === "under_review" && (
                        <div className="flex gap-2 mt-6">
                          <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleHalalRequestStatusChange(request._id, "approved")}
                          >
                            Approve Certification
                          </Button>
                          <Button variant="outline">
                            Request More Information
                          </Button>
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => handleHalalRequestStatusChange(request._id, "rejected")}
                          >
                            Reject
                          </Button>
                        </div>
                      )}

                      {request.status === "approved" && (
                        <div className="flex gap-2 mt-6">
                          <Button variant="outline">
                            View Certificate
                          </Button>
                          <Button variant="outline">
                            Contact Business
                          </Button>
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => handleHalalRequestStatusChange(request._id, "rejected")}
                          >
                            Revoke Certification
                          </Button>
                        </div>
                      )}

                      {request.status === "rejected" && (
                        <div className="flex gap-2 mt-6">
                          <Button
                            variant="outline"
                            onClick={() => handleHalalRequestStatusChange(request._id, "under_review")}
                          >
                            Reconsider Application
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
