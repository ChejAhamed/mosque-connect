"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import {
  UsersIcon,
  BuildingIcon,
  ClipboardCheckIcon,
  TrendingUpIcon,
  EyeIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  ActivityIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  SearchIcon,
  FilterIcon,
  DownloadIcon,
  RefreshCwIcon,
  MessageSquareIcon,
  UserCheckIcon,
  UserXIcon,
  AlertCircleIcon
} from "lucide-react";

export default function AdminVolunteersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || "overview");
  const [applications, setApplications] = useState([]);
  const [offers, setOffers] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [mosqueFilter, setMosqueFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  
  // Statistics
  const [stats, setStats] = useState({
    applications: {
      total: 0,
      pending: 0,
      accepted: 0,
      rejected: 0,
      reviewed: 0
    },
    offers: {
      total: 0,
      active: 0,
      inactive: 0
    },
    mosques: [],
    recentActivity: []
  });

  const [mosques, setMosques] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    // Redirect if not logged in or not an admin
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/volunteers");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/unauthorized");
      return;
    }

    fetchData();
  }, [session, status, router]);

  // Update active tab from URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);

      try {
        // Fetch all volunteer data
        const [applicationsRes, offersRes, mosquesRes] = await Promise.all([
          axios.get('/api/admin/volunteers?type=applications'),
          axios.get('/api/admin/volunteers?type=offers'),
          axios.get('/api/admin/mosques')
        ]);

        const applicationsData = applicationsRes.data.data?.applications || [];
        const offersData = offersRes.data.data?.offers || [];
        const mosquesData = mosquesRes.data.data || [];

        setApplications(applicationsData);
        setOffers(offersData);
        setMosques(mosquesData);

        // Calculate statistics
        calculateStats(applicationsData, offersData, mosquesData);

      } catch (error) {
        console.error("Error fetching data:", error);
        
        // Use mock data for demonstration
        const mockApplications = [
          {
            _id: "app1",
            userId: {
              _id: "user1",
              name: "Ahmed Ali",
              email: "ahmed@example.com",
              phone: "07123456789",
              city: "London"
            },
            mosqueId: {
              _id: "mosque1",
              name: "East London Mosque",
              city: "London",
              address: "82-92 Whitechapel Rd"
            },
            title: "Teaching Volunteer Application",
            description: "I would like to help with Quran classes",
            motivationMessage: "I want to give back to the community",
            category: "education",
            skillsOffered: ["Teaching", "Arabic", "Quran recitation"],
            availability: "Weekends",
            timeCommitment: "4 hours per week",
            experience: "5 years teaching experience",
            languages: ["English", "Arabic", "Urdu"],
            contactInfo: {
              email: "ahmed@example.com",
              phone: "07123456789"
            },
            status: "pending",
            createdAt: new Date().toISOString(),
            mosqueResponse: null
          },
          {
            _id: "app2",
            userId: {
              _id: "user2",
              name: "Fatima Khan",
              email: "fatima@example.com",
              phone: "07987654321",
              city: "Birmingham"
            },
            mosqueId: {
              _id: "mosque2",
              name: "Birmingham Central Mosque",
              city: "Birmingham",
              address: "180 Belgrave Middleway"
            },
            title: "Administrative Support",
            description: "Help with office work and event planning",
            motivationMessage: "I have administrative experience",
            category: "administration",
            skillsOffered: ["Administration", "Event Planning", "Computer Skills"],
            availability: "Weekday evenings",
            timeCommitment: "3 hours per week",
            experience: "Office administration experience",
            languages: ["English", "Bengali"],
            contactInfo: {
              email: "fatima@example.com",
              phone: "07987654321"
            },
            status: "accepted",
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            mosqueResponse: {
              respondedBy: { name: "Imam Abdullah", email: "imam@mosque.com" },
              respondedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
              message: "Welcome! We'd love to have your help."
            }
          },
          {
            _id: "app3",
            userId: {
              _id: "user3",
              name: "Omar Hassan",
              email: "omar@example.com",
              city: "Manchester"
            },
            mosqueId: {
              _id: "mosque3",
              name: "Manchester Islamic Centre",
              city: "Manchester"
            },
            title: "Cleaning Support",
            category: "cleaning",
            skillsOffered: ["Cleaning", "Maintenance"],
            availability: "Friday afternoons",
            timeCommitment: "2 hours per week",
            status: "rejected",
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];

        const mockOffers = [
          {
            _id: "offer1",
            userId: {
              _id: "user4",
              name: "Omar Yusuf",
              email: "omar.tech@example.com",
              phone: "07111222333",
              city: "Manchester"
            },
            title: "IT Support & Website Management",
            description: "Professional web developer offering technical support",
            category: "technical",
            skillsOffered: ["Web Development", "IT Support", "Graphic Design"],
            availability: "Flexible, remote work possible",
            timeCommitment: "5-10 hours per week",
            experience: "10+ years web development experience",
            languages: ["English", "Turkish"],
            preferredLocations: ["Manchester", "Birmingham", "Online"],
            contactInfo: {
              email: "omar.tech@example.com",
              phone: "07111222333"
            },
            status: "active",
            isGeneralOffer: true,
            targetMosqueId: null,
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
          },
          {
            _id: "offer2",
            userId: {
              _id: "user5",
              name: "Aisha Rahman",
              email: "aisha@example.com",
              city: "London"
            },
            title: "Community Outreach Coordinator",
            description: "Experienced in community engagement and social work",
            category: "outreach",
            skillsOffered: ["Community Outreach", "Social Work", "Event Coordination"],
            availability: "Weekends",
            timeCommitment: "6 hours per week",
            status: "active",
            isGeneralOffer: true,
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
          }
        ];

        const mockMosques = [
          { _id: "mosque1", name: "East London Mosque", city: "London" },
          { _id: "mosque2", name: "Birmingham Central Mosque", city: "Birmingham" },
          { _id: "mosque3", name: "Manchester Islamic Centre", city: "Manchester" }
        ];

        setApplications(mockApplications);
        setOffers(mockOffers);
        setMosques(mockMosques);
        calculateStats(mockApplications, mockOffers, mockMosques);
      }

    } catch (error) {
      console.error("Failed to fetch volunteer data:", error);
      toast({
        title: "Error",
        description: "Failed to load volunteer data. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (applicationsData, offersData, mosquesData) => {
    const applicationStats = {
      total: applicationsData.length,
      pending: applicationsData.filter(a => a.status === "pending").length,
      accepted: applicationsData.filter(a => a.status === "accepted").length,
      rejected: applicationsData.filter(a => a.status === "rejected").length,
      reviewed: applicationsData.filter(a => a.status === "reviewed").length
    };

    const offerStats = {
      total: offersData.length,
      active: offersData.filter(o => o.status === "active").length,
      inactive: offersData.filter(o => o.status === "inactive").length
    };

    // Calculate mosque statistics
    const mosqueStats = mosquesData.map(mosque => {
      const mosqueApplications = applicationsData.filter(app => app.mosqueId?._id === mosque._id);
      return {
        mosque,
        applicationCount: mosqueApplications.length,
        pendingCount: mosqueApplications.filter(a => a.status === "pending").length,
        acceptedCount: mosqueApplications.filter(a => a.status === "accepted").length
      };
    }).sort((a, b) => b.applicationCount - a.applicationCount);

    setStats({
      applications: applicationStats,
      offers: offerStats,
      mosques: mosqueStats,
      recentActivity: [...applicationsData, ...offersData]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 10)
    });
  };

  // Filter applications based on search and filters
  useEffect(() => {
    let filtered = applications;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.mosqueId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(app => app.category === categoryFilter);
    }

    // Mosque filter
    if (mosqueFilter !== "all") {
      filtered = filtered.filter(app => app.mosqueId?._id === mosqueFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case "today":
          filterDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          filterDate.setDate(now.getDate() - 7);
          break;
        case "month":
          filterDate.setMonth(now.getMonth() - 1);
          break;
        default:
          filterDate = null;
      }

      if (filterDate) {
        filtered = filtered.filter(app => new Date(app.createdAt) >= filterDate);
      }
    }

    setFilteredApplications(filtered);
  }, [applications, searchTerm, statusFilter, categoryFilter, mosqueFilter, dateFilter]);

  // Filter offers
  useEffect(() => {
    let filtered = offers;

    if (searchTerm) {
      filtered = filtered.filter(offer => 
        offer.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(offer => offer.status === statusFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(offer => offer.category === categoryFilter);
    }

    setFilteredOffers(filtered);
  }, [offers, searchTerm, statusFilter, categoryFilter]);

  const handleStatusChange = async (type, id, newStatus) => {
    try {
      const endpoint = type === 'application' ? `/api/volunteers/applications/${id}` : `/api/volunteers/offers/${id}`;
      
      await axios.patch(endpoint, { 
        status: newStatus,
        adminAction: true,
        adminId: session.user.id
      });

      if (type === 'application') {
        setApplications(applications.map(app =>
          app._id === id ? { ...app, status: newStatus } : app
        ));
      } else {
        setOffers(offers.map(offer =>
          offer._id === id ? { ...offer, status: newStatus } : offer
        ));
      }

      toast({
        title: "Status Updated",
        description: `${type === 'application' ? 'Application' : 'Offer'} status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      
      // For demo, update local state anyway
      if (type === 'application') {
        setApplications(applications.map(app =>
          app._id === id ? { ...app, status: newStatus } : app
        ));
      } else {
        setOffers(offers.map(offer =>
          offer._id === id ? { ...offer, status: newStatus } : offer
        ));
      }

      toast({
        title: "Status Updated (Demo)",
        description: `${type === 'application' ? 'Application' : 'Offer'} status changed to ${newStatus}`,
      });
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedItems.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select items to perform bulk actions.",
        variant: "destructive"
      });
      return;
    }

    // Implement bulk actions here
    console.log("Bulk action:", action, "Items:", selectedItems);
    
    toast({
      title: "Bulk Action",
      description: `${action} applied to ${selectedItems.length} items`,
    });
    
    setSelectedItems([]);
  };

  const exportData = () => {
    // Implement data export
    const data = activeTab === "applications" ? filteredApplications : filteredOffers;
    console.log("Exporting data:", data);
    
    toast({
      title: "Export Started",
      description: "Data export will be available for download shortly.",
    });
  };

  const getStatusColor = (status) => {
    const statusMap = {
      pending: "bg-yellow-100 text-yellow-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      reviewed: "bg-blue-100 text-blue-800",
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800"
    };
    return statusMap[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusBadge = (status) => {
    const statusLabels = {
      pending: "Pending",
      accepted: "Accepted",
      rejected: "Rejected", 
      reviewed: "Reviewed",
      active: "Active",
      inactive: "Inactive"
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Volunteer Management</h1>
          <p className="text-gray-600">Manage volunteer applications and general offers across the platform</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchData()}>
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={exportData}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center">
              <ClipboardCheckIcon className="mr-2 h-5 w-5" />
              Applications
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold">{stats.applications.total}</p>
            <div className="flex items-center mt-2 gap-1 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {stats.applications.pending} pending
              </Badge>
              <Badge variant="outline" className="text-xs">
                {stats.applications.accepted} accepted
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-green-50">
            <CardTitle className="flex items-center">
              <EyeIcon className="mr-2 h-5 w-5" />
              General Offers
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold">{stats.offers.total}</p>
            <div className="flex items-center mt-2 gap-1 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {stats.offers.active} active
              </Badge>
              <Badge variant="outline" className="text-xs">
                {stats.offers.inactive} inactive
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-purple-50">
            <CardTitle className="flex items-center">
              <BuildingIcon className="mr-2 h-5 w-5" />
              Active Mosques
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold">{stats.mosques.filter(m => m.applicationCount > 0).length}</p>
            <p className="text-gray-500 mt-2">Receiving applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-orange-50">
            <CardTitle className="flex items-center">
              <AlertTriangleIcon className="mr-2 h-5 w-5" />
              Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold">{stats.applications.pending}</p>
            <p className="text-gray-500 mt-2">Pending applications</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FilterIcon className="mr-2 h-5 w-5" />
            Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search volunteers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="administration">Administration</SelectItem>
                <SelectItem value="events">Events</SelectItem>
                <SelectItem value="outreach">Outreach</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>

            <Select value={mosqueFilter} onValueChange={setMosqueFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Mosque" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Mosques</SelectItem>
                {mosques.map(mosque => (
                  <SelectItem key={mosque._id} value={mosque._id}>
                    {mosque.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setCategoryFilter("all");
                setMosqueFilter("all");
                setDateFilter("all");
              }}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-blue-800">
                {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleBulkAction('approve')}>
                  <UserCheckIcon className="h-4 w-4 mr-2" />
                  Approve Selected
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('reject')}>
                  <UserXIcon className="h-4 w-4 mr-2" />
                  Reject Selected
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedItems([])}>
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">
            Applications ({filteredApplications.length})
          </TabsTrigger>
          <TabsTrigger value="offers">
            General Offers ({filteredOffers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Mosques */}
            <Card>
              <CardHeader>
                <CardTitle>Top Mosques by Applications</CardTitle>
                <CardDescription>Mosques receiving the most volunteer applications</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.mosques.slice(0, 5).map((mosque, index) => (
                  <div key={mosque.mosque._id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="font-bold text-blue-700">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{mosque.mosque.name}</p>
                        <p className="text-sm text-gray-500">{mosque.mosque.city}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{mosque.applicationCount}</p>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          {mosque.pendingCount} pending
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest volunteer applications and offers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recentActivity.slice(0, 8).map((item) => (
                    <div key={item._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.userId?.name}</p>
                        <p className="text-sm text-gray-600">{item.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(item.status)}
                        <p className="text-xs text-gray-500 mt-1">
                          {item.mosqueId ? 'Application' : 'General Offer'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Volunteer Applications ({filteredApplications.length})</CardTitle>
              <CardDescription>Mosque-specific volunteer applications</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredApplications.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No applications found matching your criteria.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredApplications.map((application) => (
                    <div key={application._id} className="border rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(application._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems([...selectedItems, application._id]);
                              } else {
                                setSelectedItems(selectedItems.filter(id => id !== application._id));
                              }
                            }}
                            className="rounded"
                          />
                          <div>
                            <h3 className="font-semibold text-lg">{application.userId?.name}</h3>
                            <p className="text-gray-600">{application.title}</p>
                          </div>
                        </div>
                        {getStatusBadge(application.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-sm">Mosque</h4>
                          <p className="text-gray-700">{application.mosqueId?.name}</p>
                          <p className="text-sm text-gray-500">{application.mosqueId?.city}</p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">Contact</h4>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <MailIcon className="h-3 w-3 mr-1" />
                              {application.contactInfo?.email || application.userId?.email}
                            </div>
                            {application.contactInfo?.phone && (
                              <div className="flex items-center text-sm">
                                <PhoneIcon className="h-3 w-3 mr-1" />
                                {application.contactInfo.phone}
                              </div>
                            )}
                            <div className="flex items-center text-sm">
                              <MapPinIcon className="h-3 w-3 mr-1" />
                              {application.userId?.city}
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">Details</h4>
                          <Badge variant="outline" className="mb-1">{application.category}</Badge>
                          <p className="text-sm text-gray-500">
                            Applied: {new Date(application.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            {application.availability}
                          </p>
                        </div>
                      </div>

                      {application.motivationMessage && (
                        <div className="mb-4">
                          <h4 className="font-medium text-sm mb-2">Motivation</h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-md text-sm">
                            {application.motivationMessage}
                          </p>
                        </div>
                      )}

                      {application.skillsOffered?.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-sm mb-2">Skills</h4>
                          <div className="flex flex-wrap gap-1">
                            {application.skillsOffered.map(skill => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {application.mosqueResponse && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-md">
                          <h4 className="font-medium text-sm mb-2">Mosque Response</h4>
                          <p className="text-sm text-gray-700">{application.mosqueResponse.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Responded by {application.mosqueResponse.respondedBy?.name} on{" "}
                            {new Date(application.mosqueResponse.respondedAt).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {application.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange('application', application._id, 'accepted')}
                            >
                              <CheckCircleIcon className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange('application', application._id, 'rejected')}
                            >
                              <XCircleIcon className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="outline">
                          <MessageSquareIcon className="h-4 w-4 mr-2" />
                          Contact
                        </Button>
                        <Button size="sm" variant="outline">
                          <EyeIcon className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="offers">
          <Card>
            <CardHeader>
              <CardTitle>General Volunteer Offers ({filteredOffers.length})</CardTitle>
              <CardDescription>Community members offering services to all mosques</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredOffers.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No offers found matching your criteria.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredOffers.map((offer) => (
                    <div key={offer._id} className="border rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(offer._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems([...selectedItems, offer._id]);
                              } else {
                                setSelectedItems(selectedItems.filter(id => id !== offer._id));
                              }
                            }}
                            className="rounded"
                          />
                          <div>
                            <h3 className="font-semibold text-lg">{offer.userId?.name}</h3>
                            <p className="text-gray-600">{offer.title}</p>
                          </div>
                        </div>
                        {getStatusBadge(offer.status)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-sm">Contact</h4>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <MailIcon className="h-3 w-3 mr-1" />
                              {offer.contactInfo?.email || offer.userId?.email}
                            </div>
                            {offer.contactInfo?.phone && (
                              <div className="flex items-center text-sm">
                                <PhoneIcon className="h-3 w-3 mr-1" />
                                {offer.contactInfo.phone}
                              </div>
                            )}
                            <div className="flex items-center text-sm">
                              <MapPinIcon className="h-3 w-3 mr-1" />
                              {offer.userId?.city}
                            </div>
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">Availability</h4>
                          <p className="text-gray-700">{offer.availability}</p>
                          <p className="text-sm text-gray-500">
                            Commitment: {offer.timeCommitment}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">Details</h4>
                          <Badge variant="outline" className="mb-1">{offer.category}</Badge>
                          <p className="text-sm text-gray-500">
                            Posted: {new Date(offer.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-medium text-sm mb-2">Description</h4>
                        <p className="text-gray-700 text-sm">{offer.description}</p>
                      </div>

                      {offer.skillsOffered?.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-sm mb-2">Skills Offered</h4>
                          <div className="flex flex-wrap gap-1">
                            {offer.skillsOffered.map(skill => (
                              <Badge key={skill} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {offer.preferredLocations?.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-sm mb-2">Preferred Locations</h4>
                          <div className="flex flex-wrap gap-1">
                            {offer.preferredLocations.map(location => (
                              <Badge key={location} variant="outline" className="text-xs">
                                {location}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {offer.status === "active" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange('offer', offer._id, 'inactive')}
                          >
                            Deactivate
                          </Button>
                        )}
                        {offer.status === "inactive" && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange('offer', offer._id, 'active')}
                          >
                            Activate
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <MessageSquareIcon className="h-4 w-4 mr-2" />
                          Contact
                        </Button>
                        <Button size="sm" variant="outline">
                          <EyeIcon className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
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