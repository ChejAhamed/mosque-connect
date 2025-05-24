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
  FileText,
  Building,
  Calendar,
  User,
  Phone,
  Mail,
  File,
  Download,
  PlusCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function HalalCertificationManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [certifications, setCertifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCertification, setSelectedCertification] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [certificateNumber, setCertificateNumber] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [stats, setStats] = useState({
    pending: 0,
    under_review: 0,
    approved: 0,
    rejected: 0
  });

  // Check if user is authenticated and is an admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/halal-certification");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/unauthorized");
      return;
    }

    if (status === "authenticated") {
      fetchCertifications();
    }
  }, [status, session, router]);

  // Fetch halal certifications
  const fetchCertifications = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/admin/halal-certifications");
      if (response.data.certifications) {
        setCertifications(response.data.certifications);

        // Calculate stats
        const newStats = {
          pending: 0,
          under_review: 0,
          approved: 0,
          rejected: 0
        };

        response.data.certifications.forEach(cert => {
          if (newStats[cert.status] !== undefined) {
            newStats[cert.status]++;
          }
        });

        setStats(newStats);
      }
    } catch (error) {
      console.error("Error fetching certifications:", error);
      toast({
        title: "Error",
        description: "Failed to load certification data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter certifications based on search term
  const filteredCertifications = certifications.filter(cert =>
    cert.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.businessType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.contactName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get certifications by status
  const getCertificationsByStatus = (status) => {
    return filteredCertifications.filter(cert => cert.status === status);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Handle certification action (review, approve, reject)
  const handleCertificationAction = async () => {
    if (!selectedCertification || !actionType) return;

    try {
      setLoading(true);

      const payload = {
        status: actionType,
        reviewNotes
      };

      // Add certificate details if approving
      if (actionType === "approved") {
        if (!expiryDate) {
          toast({
            title: "Missing Information",
            description: "Please provide an expiry date for the certificate.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        payload.certificateNumber = certificateNumber;
        payload.expiryDate = new Date(expiryDate).toISOString();
      }

      const response = await axios.patch(
        `/api/admin/halal-certifications/${selectedCertification._id}`,
        payload
      );

      if (response.data.certification) {
        // Update the certification in the local state
        setCertifications(prevCerts =>
          prevCerts.map(cert =>
            cert._id === selectedCertification._id ? response.data.certification : cert
          )
        );

        // Recalculate stats
        setStats(prevStats => {
          const newStats = { ...prevStats };
          newStats[selectedCertification.status]--;
          newStats[actionType]++;
          return newStats;
        });

        toast({
          title: "Success",
          description: `Certification ${actionType === "approved" ? "approved" : actionType === "rejected" ? "rejected" : "updated"} successfully.`,
        });

        // Clear selection and form
        setDialogOpen(false);
        setSelectedCertification(null);
        setReviewNotes("");
        setExpiryDate("");
        setCertificateNumber("");
        setActionType(null);
      }
    } catch (error) {
      console.error("Error updating certification:", error);
      toast({
        title: "Error",
        description: "Failed to update certification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Open action dialog
  const openActionDialog = (certification, type) => {
    setSelectedCertification(certification);
    setActionType(type);
    setReviewNotes("");

    // Set default expiry date to 1 year from now if approving
    if (type === "approved") {
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      setExpiryDate(oneYearFromNow.toISOString().split('T')[0]);

      // Generate a default certificate number
      const timestamp = Date.now().toString().slice(-6);
      setCertificateNumber(`HC-${timestamp}`);
    }

    setDialogOpen(true);
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "under_review":
        return <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  // Loading state
  if (loading && certifications.length === 0) {
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
        <h1 className="text-3xl font-bold">Halal Certification Management</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                <p className="text-sm font-medium text-gray-500">Under Review</p>
                <p className="text-3xl font-bold">{stats.under_review}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
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
                <p className="text-sm font-medium text-gray-500">Rejected</p>
                <p className="text-3xl font-bold">{stats.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          className="pl-10"
          placeholder="Search by business name, type, or contact person..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Certifications Tabs */}
      <Tabs defaultValue="pending" className="mb-6">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="under_review" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Under Review ({stats.under_review})
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

        {/* Pending Certifications */}
        <TabsContent value="pending">
          {getCertificationsByStatus("pending").length > 0 ? (
            <div className="space-y-4">
              {getCertificationsByStatus("pending").map((cert) => (
                <Card key={cert._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{cert.businessName}</CardTitle>
                        <CardDescription>{cert.businessType}</CardDescription>
                      </div>
                      {renderStatusBadge(cert.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium mb-1">Contact Information</h3>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-gray-500" />
                          {cert.contactName}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-500" />
                          {cert.contactEmail}
                        </div>
                        {cert.contactPhone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-gray-500" />
                            {cert.contactPhone}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-1">Business Information</h3>
                        <div className="flex items-center gap-2 text-sm">
                          <Building className="h-4 w-4 text-gray-500" />
                          {cert.address}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          Application Date: {formatDate(cert.requestDate)}
                        </div>
                      </div>
                    </div>

                    {cert.details && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium mb-1">Business Details</h3>
                        <p className="text-sm text-gray-600">{cert.details}</p>
                      </div>
                    )}

                    {cert.submittedDocuments && cert.submittedDocuments.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium mb-1">Submitted Documents</h3>
                        <div className="flex flex-wrap gap-2">
                          {cert.submittedDocuments.map((doc, index) => (
                            <Badge key={index} variant="outline" className="flex items-center">
                              <File className="h-3 w-3 mr-1" />
                              {doc}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={() => openActionDialog(cert, "under_review")}
                    >
                      <FileText className="h-4 w-4" />
                      Start Review
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex items-center gap-1"
                      onClick={() => openActionDialog(cert, "rejected")}
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Pending Applications</h3>
              <p className="text-gray-500">There are no pending halal certification applications.</p>
            </div>
          )}
        </TabsContent>

        {/* Under Review Certifications */}
        <TabsContent value="under_review">
          {getCertificationsByStatus("under_review").length > 0 ? (
            <div className="space-y-4">
              {getCertificationsByStatus("under_review").map((cert) => (
                <Card key={cert._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{cert.businessName}</CardTitle>
                        <CardDescription>{cert.businessType}</CardDescription>
                      </div>
                      {renderStatusBadge(cert.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium mb-1">Contact Information</h3>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-gray-500" />
                          {cert.contactName}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-500" />
                          {cert.contactEmail}
                        </div>
                        {cert.contactPhone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-gray-500" />
                            {cert.contactPhone}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-1">Business Information</h3>
                        <div className="flex items-center gap-2 text-sm">
                          <Building className="h-4 w-4 text-gray-500" />
                          {cert.address}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          Application Date: {formatDate(cert.requestDate)}
                        </div>
                      </div>
                    </div>

                    {cert.details && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium mb-1">Business Details</h3>
                        <p className="text-sm text-gray-600">{cert.details}</p>
                      </div>
                    )}

                    {cert.submittedDocuments && cert.submittedDocuments.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium mb-1">Submitted Documents</h3>
                        <div className="flex flex-wrap gap-2">
                          {cert.submittedDocuments.map((doc, index) => (
                            <Badge key={index} variant="outline" className="flex items-center">
                              <File className="h-3 w-3 mr-1" />
                              {doc}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {cert.reviewNotes && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-md">
                        <h3 className="text-sm font-medium mb-1">Review Notes</h3>
                        <p className="text-sm">{cert.reviewNotes}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={() => openActionDialog(cert, "pending")}
                    >
                      <Clock className="h-4 w-4" />
                      Return to Pending
                    </Button>
                    <Button
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                      onClick={() => openActionDialog(cert, "approved")}
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex items-center gap-1"
                      onClick={() => openActionDialog(cert, "rejected")}
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Applications Under Review</h3>
              <p className="text-gray-500">There are no halal certification applications under review.</p>
            </div>
          )}
        </TabsContent>

        {/* Approved Certifications */}
        <TabsContent value="approved">
          {getCertificationsByStatus("approved").length > 0 ? (
            <div className="space-y-4">
              {getCertificationsByStatus("approved").map((cert) => (
                <Card key={cert._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{cert.businessName}</CardTitle>
                        <CardDescription>{cert.businessType}</CardDescription>
                      </div>
                      {renderStatusBadge(cert.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium mb-1">Contact Information</h3>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-gray-500" />
                          {cert.contactName}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-500" />
                          {cert.contactEmail}
                        </div>
                        {cert.contactPhone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-gray-500" />
                            {cert.contactPhone}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-1">Business Information</h3>
                        <div className="flex items-center gap-2 text-sm">
                          <Building className="h-4 w-4 text-gray-500" />
                          {cert.address}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          Application Date: {formatDate(cert.requestDate)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-green-50 rounded-md">
                        <h3 className="text-sm font-medium mb-1">Certificate Information</h3>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-green-600" />
                            Issued: {formatDate(cert.verifiedAt)}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-red-600" />
                            Expires: {formatDate(cert.expiryDate)}
                          </div>
                          {cert.certificateNumber && (
                            <div className="flex items-center gap-2 text-sm">
                              <FileText className="h-4 w-4 text-blue-600" />
                              Certificate #: {cert.certificateNumber}
                            </div>
                          )}
                        </div>
                      </div>

                      {cert.reviewNotes && (
                        <div className="p-3 bg-gray-50 rounded-md">
                          <h3 className="text-sm font-medium mb-1">Review Notes</h3>
                          <p className="text-sm">{cert.reviewNotes}</p>
                        </div>
                      )}
                    </div>

                    {cert.details && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium mb-1">Business Details</h3>
                        <p className="text-sm text-gray-600">{cert.details}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" />
                      Download Certificate
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-1 border-yellow-300 bg-yellow-50 hover:bg-yellow-100 text-yellow-800"
                      onClick={() => openActionDialog(cert, "under_review")}
                    >
                      <FileText className="h-4 w-4" />
                      Review Again
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Approved Certifications</h3>
              <p className="text-gray-500">There are no approved halal certifications yet.</p>
            </div>
          )}
        </TabsContent>

        {/* Rejected Certifications */}
        <TabsContent value="rejected">
          {getCertificationsByStatus("rejected").length > 0 ? (
            <div className="space-y-4">
              {getCertificationsByStatus("rejected").map((cert) => (
                <Card key={cert._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{cert.businessName}</CardTitle>
                        <CardDescription>{cert.businessType}</CardDescription>
                      </div>
                      {renderStatusBadge(cert.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium mb-1">Contact Information</h3>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-gray-500" />
                          {cert.contactName}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-500" />
                          {cert.contactEmail}
                        </div>
                        {cert.contactPhone && (
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-gray-500" />
                            {cert.contactPhone}
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium mb-1">Business Information</h3>
                        <div className="flex items-center gap-2 text-sm">
                          <Building className="h-4 w-4 text-gray-500" />
                          {cert.address}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          Application Date: {formatDate(cert.requestDate)}
                        </div>
                      </div>
                    </div>

                    {cert.reviewNotes && (
                      <div className="mt-4 p-3 bg-red-50 rounded-md">
                        <h3 className="text-sm font-medium mb-1">Rejection Reason</h3>
                        <p className="text-sm">{cert.reviewNotes}</p>
                      </div>
                    )}

                    {cert.details && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium mb-1">Business Details</h3>
                        <p className="text-sm text-gray-600">{cert.details}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={() => openActionDialog(cert, "under_review")}
                    >
                      <FileText className="h-4 w-4" />
                      Reconsider
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <XCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Rejected Applications</h3>
              <p className="text-gray-500">There are no rejected halal certification applications.</p>
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
                ? "Approve Certification"
                : actionType === "rejected"
                ? "Reject Certification"
                : actionType === "under_review"
                ? "Move to Review"
                : "Update Certification"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approved"
                ? "Issue a halal certificate for this business."
                : actionType === "rejected"
                ? "Provide a reason for rejecting this application."
                : actionType === "under_review"
                ? "Start the review process for this application."
                : "Update the status of this application."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Business Info Summary */}
            {selectedCertification && (
              <div className="border rounded-md p-3 bg-gray-50">
                <p className="font-medium">{selectedCertification.businessName}</p>
                <p className="text-sm text-gray-500">{selectedCertification.businessType}</p>
              </div>
            )}

            {/* Notes Field */}
            <div className="space-y-2">
              <Label htmlFor="notes">
                {actionType === "rejected" ? "Rejection Reason" : "Review Notes"}
              </Label>
              <Textarea
                id="notes"
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={
                  actionType === "rejected"
                    ? "Explain why this application is being rejected..."
                    : "Add any notes about this certification..."
                }
                rows={4}
              />
            </div>

            {/* Certificate Fields (for approval) */}
            {actionType === "approved" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="certificateNumber">Certificate Number</Label>
                  <Input
                    id="certificateNumber"
                    value={certificateNumber}
                    onChange={(e) => setCertificateNumber(e.target.value)}
                    placeholder="HC-123456"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiration Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    The certificate will be valid until this date.
                  </p>
                </div>
              </>
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
                  : "outline"
              }
              className={
                actionType === "approved"
                  ? "bg-green-600 hover:bg-green-700"
                  : ""
              }
              onClick={handleCertificationAction}
              disabled={loading}
            >
              {loading ? "Processing..." : actionType === "approved"
                ? "Issue Certificate"
                : actionType === "rejected"
                ? "Reject Application"
                : actionType === "under_review"
                ? "Start Review"
                : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
