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
  FileIcon,
  EyeIcon,
  MailIcon,
  PhoneIcon
} from "lucide-react";

export default function ImamDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [mosques, setMosques] = useState([]);
  const [volunteerApplications, setVolunteerApplications] = useState([]);
  const [generalVolunteerOffers, setGeneralVolunteerOffers] = useState([]);
  const [halalRequests, setHalalRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMosqueId, setSelectedMosqueId] = useState(null);
  const [stats, setStats] = useState({
    totalMosques: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    generalOffers: 0,
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

        // Fetch mosques data first
        const mosquesResponse = await axios.get('/api/imam/mosques');
        const mosquesData = mosquesResponse.data.mosques || mosquesResponse.data.data || [];
        setMosques(mosquesData);
        
        // Set first mosque as selected if available
        if (mosquesData.length > 0 && !selectedMosqueId) {
          setSelectedMosqueId(mosquesData[0]._id);
        }

        // Fetch volunteer data for the mosque
        if (selectedMosqueId || mosquesData[0]?._id) {
          const currentMosqueId = selectedMosqueId || mosquesData[0]._id;
          
          try {
            // Fetch mosque-specific applications
            const applicationsResponse = await axios.get(`/api/volunteers/applications?mosqueId=${currentMosqueId}`);
            setVolunteerApplications(applicationsResponse.data.data || []);

            // Fetch general volunteer offers (available to all mosques)
            const offersResponse = await axios.get('/api/volunteers/offers?type=general');
            setGeneralVolunteerOffers(offersResponse.data.data || []);

          } catch (error) {
            console.error("Error fetching volunteer data:", error);
            
            // Use mock data for demo
            setVolunteerApplications([
              {
                _id: "app1",
                userId: {
                  _id: "user1",
                  name: "Ahmed Ali",
                  email: "ahmed@example.com",
                  phone: "07123456789",
                  city: "London"
                },
                mosqueId: currentMosqueId,
                title: "Volunteer Application for Teaching",
                description: "I would like to help with Quran classes for children",
                motivationMessage: "I have experience teaching and want to give back to the community",
                category: "education",
                skillsOffered: ["Teaching", "Quran recitation", "Arabic language"],
                availability: "Weekends and weekday evenings",
                timeCommitment: "4-6 hours per week",
                experience: "5 years teaching experience, Hafiz",
                languages: ["English", "Arabic", "Urdu"],
                contactInfo: {
                  email: "ahmed@example.com",
                  phone: "07123456789"
                },
                status: "pending",
                createdAt: new Date().toISOString()
              },
              {
                _id: "app2",
                userId: {
                  _id: "user2",
                  name: "Fatima Khan",
                  email: "fatima@example.com",
                  phone: "07987654321",
                  city: "London"
                },
                mosqueId: currentMosqueId,
                title: "Administrative Support Volunteer",
                description: "I can help with administrative tasks and event organization",
                motivationMessage: "I want to support my local mosque and use my organizational skills",
                category: "administration",
                skillsOffered: ["Administration", "Event Planning", "Social Media"],
                availability: "Tuesday and Thursday evenings",
                timeCommitment: "3-4 hours per week",
                experience: "Office administration experience, event coordination",
                languages: ["English", "Bengali"],
                contactInfo: {
                  email: "fatima@example.com",
                  phone: "07987654321"
                },
                status: "accepted",
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
              }
            ]);

            setGeneralVolunteerOffers([
              {
                _id: "offer1",
                userId: {
                  _id: "user3",
                  name: "Omar Yusuf",
                  email: "omar@example.com",
                  phone: "07111222333",
                  city: "Birmingham"
                },
                title: "IT Support & Website Management",
                description: "Experienced web developer offering technical support to mosques",
                category: "technical",
                skillsOffered: ["Web Development", "IT Support", "Graphic Design"],
                availability: "Flexible, can work remotely",
                timeCommitment: "5-10 hours per week",
                experience: "10+ years in web development, helping Islamic organizations",
                languages: ["English", "Turkish"],
                preferredLocations: ["Birmingham", "London", "Manchester"],
                contactInfo: {
                  email: "omar@example.com",
                  phone: "07111222333"
                },
                status: "active",
                isGeneralOffer: true,
                createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
              }
            ]);
          }
        }

        // Fetch halal certification requests (existing code)
        try {
          const halalResponse = await axios.get('/api/imam/halal-certification-requests');
          setHalalRequests(halalResponse.data.requests || []);
        } catch (error) {
          console.error("Error fetching halal requests:", error);
          // Use existing mock data
          setHalalRequests([]);
        }

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
  }, [session, status, router, toast, selectedMosqueId]);

  // Calculate stats whenever data changes
  useEffect(() => {
    const newStats = {
      totalMosques: mosques.length,
      pendingApplications: volunteerApplications.filter(a => a.status === "pending").length,
      acceptedApplications: volunteerApplications.filter(a => a.status === "accepted").length,
      rejectedApplications: volunteerApplications.filter(a => a.status === "rejected").length,
      generalOffers: generalVolunteerOffers.length,
      pendingHalalRequests: halalRequests.filter(r => r.status === "pending").length,
      approvedHalalRequests: halalRequests.filter(r => r.status === "approved").length,
      rejectedHalalRequests: halalRequests.filter(r => r.status === "rejected").length,
      underReviewHalalRequests: halalRequests.filter(r => r.status === "under_review").length
    };
    setStats(newStats);
  }, [mosques, volunteerApplications, generalVolunteerOffers, halalRequests]);

  const handleApplicationStatusChange = async (applicationId, newStatus) => {
    try {
      setLoading(true);

      try {
        await axios.put(`/api/volunteers/applications/${applicationId}`, { 
          status: newStatus,
          respondedBy: session.user.id
        });

        // Update local state
        setVolunteerApplications(volunteerApplications.map(app =>
          app._id === applicationId ? { 
            ...app, 
            status: newStatus,
            mosqueResponse: {
              respondedBy: { _id: session.user.id, name: session.user.name },
              respondedAt: new Date().toISOString()
            }
          } : app
        ));

        toast({
          title: "Status Updated",
          description: `Application status changed to ${newStatus}`,
        });
      } catch (error) {
        console.error("Error updating application status:", error);

        // For demo, update local state anyway
        setVolunteerApplications(volunteerApplications.map(app =>
          app._id === applicationId ? { ...app, status: newStatus } : app
        ));

        toast({
          title: "Status Updated (Demo)",
          description: `Application status changed to ${newStatus}`,
        });
      }
    } catch (error) {
      toast({
        title: "Action Failed",
        description: "Failed to update application status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusMap = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      reviewed: "bg-blue-100 text-blue-800",
      under_review: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      active: "bg-green-100 text-green-800"
    };
    return statusMap[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusBadge = (status) => {
    const statusLabels = {
      pending: "Pending",
      accepted: "Accepted",
      rejected: "Rejected",
      reviewed: "Reviewed",
      under_review: "Under Review",
      approved: "Approved",
      active: "Active"
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

      {/* Mosque Selector */}
      {mosques.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Select Mosque:</label>
          <select 
            value={selectedMosqueId || ''} 
            onChange={(e) => setSelectedMosqueId(e.target.value)}
            className="border rounded-md px-3 py-2 bg-white"
          >
            {mosques.map(mosque => (
              <option key={mosque._id} value={mosque._id}>
                {mosque.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
              Applications
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold">{stats.pendingApplications}</p>
            <p className="text-gray-500 mt-2">Pending applications</p>
            <div className="flex items-center mt-2 gap-2 flex-wrap">
              <Badge variant="outline" className="flex items-center">
                <CheckCircleIcon className="h-3 w-3 mr-1" />
                {stats.acceptedApplications} Accepted
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-purple-50">
            <CardTitle className="flex items-center">
              <EyeIcon className="mr-2 h-5 w-5" />
              General Offers
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold">{stats.generalOffers}</p>
            <p className="text-gray-500 mt-2">Available volunteers</p>
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
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="mb-8" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="general-volunteers">General Volunteers</TabsTrigger>
          <TabsTrigger value="halal-verification">Halal Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 gap-6">
            {/* Existing mosque overview section */}
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
                          <div className="flex items-center mt-2 gap-2">
                            {mosque.verified ? (
                              <Badge className="bg-green-100 text-green-800">Verified</Badge>
                            ) : (
                              <Badge className="bg-yellow-100 text-yellow-800">Pending Verification</Badge>
                            )}
                            <Badge variant="outline">
                              {volunteerApplications.filter(app => app.mosqueId === mosque._id).length} Applications
                            </Badge>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">Manage</Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent activity summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Applications</CardTitle>
                  <CardDescription>Latest volunteer applications for your mosque</CardDescription>
                </CardHeader>
                <CardContent>
                  {volunteerApplications.length === 0 ? (
                    <p className="text-gray-500 text-center py-6">No applications yet</p>
                  ) : (
                    <div className="space-y-4">
                      {volunteerApplications.slice(0, 3).map(application => (
                        <div key={application._id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{application.userId?.name}</h3>
                              <p className="text-sm text-gray-500">{application.title}</p>
                            </div>
                            {getStatusBadge(application.status)}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Applied: {new Date(application.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-center">
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("applications")}>
                    View All Applications
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Available General Volunteers</CardTitle>
                  <CardDescription>Community members offering their services</CardDescription>
                </CardHeader>
                <CardContent>
                  {generalVolunteerOffers.length === 0 ? (
                    <p className="text-gray-500 text-center py-6">No general offers yet</p>
                  ) : (
                    <div className="space-y-4">
                      {generalVolunteerOffers.slice(0, 3).map(offer => (
                        <div key={offer._id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{offer.userId?.name}</h3>
                              <p className="text-sm text-gray-500">{offer.title}</p>
                            </div>
                            {getStatusBadge(offer.status)}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Posted: {new Date(offer.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-center">
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("general-volunteers")}>
                    View All General Volunteers
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Mosque-Specific Volunteer Applications</CardTitle>
              <CardDescription>
                Applications submitted specifically for {mosques.find(m => m._id === selectedMosqueId)?.name || 'your mosque'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {volunteerApplications.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500">No applications yet for this mosque.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {volunteerApplications.map(application => (
                    <div key={application._id} className="border rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{application.userId?.name}</h3>
                          <p className="text-gray-600">{application.title}</p>
                        </div>
                        {getStatusBadge(application.status)}
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium text-sm mb-2">Motivation</h4>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{application.motivationMessage}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-sm">Contact Information</h4>
                          <div className="space-y-1 mt-1">
                            <div className="flex items-center text-sm">
                              <MailIcon className="h-4 w-4 mr-2" />
                              {application.contactInfo?.email || application.userId?.email}
                            </div>
                            {application.contactInfo?.phone && (
                              <div className="flex items-center text-sm">
                                <PhoneIcon className="h-4 w-4 mr-2" />
                                {application.contactInfo.phone}
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm">Availability</h4>
                          <p className="text-gray-700 mt-1">{application.availability}</p>
                          <p className="text-sm text-gray-500">Time commitment: {application.timeCommitment}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium text-sm">Skills Offered</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {application.skillsOffered?.map(skill => (
                            <Badge key={skill} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </div>

                      {application.experience && (
                        <div className="mb-4">
                          <h4 className="font-medium text-sm">Experience</h4>
                          <p className="text-gray-700 mt-1">{application.experience}</p>
                        </div>
                      )}

                      <div className="text-sm text-gray-500 mb-4">
                        Applied: {new Date(application.createdAt).toLocaleDateString()}
                        {application.mosqueResponse?.respondedAt && (
                          <span> • Responded: {new Date(application.mosqueResponse.respondedAt).toLocaleDateString()}</span>
                        )}
                      </div>

                      {application.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApplicationStatusChange(application._id, "accepted")}
                          >
                            Accept Application
                          </Button>
                          <Button
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => handleApplicationStatusChange(application._id, "rejected")}
                          >
                            Reject Application
                          </Button>
                        </div>
                      )}

                      {application.status === "accepted" && (
                        <div className="flex gap-2">
                          <Button variant="outline">
                            <MailIcon className="h-4 w-4 mr-2" />
                            Contact Volunteer
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

        <TabsContent value="general-volunteers">
          <Card>
            <CardHeader>
              <CardTitle>General Volunteer Offers</CardTitle>
              <CardDescription>Community members offering their services to all mosques</CardDescription>
            </CardHeader>
            <CardContent>
              {generalVolunteerOffers.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500">No general volunteer offers available.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {generalVolunteerOffers.map(offer => (
                    <div key={offer._id} className="border rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{offer.userId?.name}</h3>
                          <p className="text-gray-600">{offer.title}</p>
                          <p className="text-sm text-gray-500">{offer.userId?.city}</p>
                        </div>
                        {getStatusBadge(offer.status)}
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium text-sm mb-2">Description</h4>
                        <p className="text-gray-700">{offer.description}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-sm">Contact Information</h4>
                          <div className="space-y-1 mt-1">
                            <div className="flex items-center text-sm">
                              <MailIcon className="h-4 w-4 mr-2" />
                              {offer.contactInfo?.email}
                            </div>
                            {offer.contactInfo?.phone && (
                              <div className="flex items-center text-sm">
                                <PhoneIcon className="h-4 w-4 mr-2" />
                                {offer.contactInfo.phone}
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-sm">Availability</h4>
                          <p className="text-gray-700 mt-1">{offer.availability}</p>
                          <p className="text-sm text-gray-500">Time commitment: {offer.timeCommitment}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium text-sm">Skills Offered</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {offer.skillsOffered?.map(skill => (
                            <Badge key={skill} variant="secondary">{skill}</Badge>
                          ))}
                        </div>
                      </div>

                      {offer.preferredLocations?.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-sm">Preferred Locations</h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {offer.preferredLocations.map(location => (
                              <Badge key={location} variant="outline">{location}</Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-sm text-gray-500 mb-4">
                        Posted: {new Date(offer.createdAt).toLocaleDateString()}
                      </div>

                      <div className="flex gap-2">
                        <Button>
                          <MailIcon className="h-4 w-4 mr-2" />
                          Contact Volunteer
                        </Button>
                        <Button variant="outline">
                          Express Interest
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="halal-verification">
          {/* Existing halal verification content - keep as is */}
          <Card>
            <CardHeader>
              <CardTitle>Halal Certification Requests</CardTitle>
              <CardDescription>Verify and approve halal certification for businesses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <p className="text-gray-500">Halal certification system will be available soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}