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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Shield,
  ShieldCheck,
  User,
  UserPlus,
  Search,
  Crown,
  Settings,
  Activity,
  Calendar,
  Mail,
  Eye,
  EyeOff,
  Trash2,
  Edit,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";

export default function AdminUserManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
    permissions: {
      mosques: { read: true, write: false, delete: false },
      volunteers: { read: true, write: false, delete: false },
      businesses: { read: true, write: false, delete: false },
      halal_certifications: { read: true, write: false, delete: false },
      users: { read: false, write: false, delete: false },
      settings: { read: false, write: false, delete: false }
    }
  });
  const [stats, setStats] = useState({
    totalAdmins: 0,
    superAdmins: 0,
    activeAdmins: 0,
    recentActivity: 0
  });

  // Check if user is authenticated and is a super admin
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/admin/user-management");
      return;
    }

    if (status === "authenticated") {
      // Check if user has permission to manage admins
      if (session?.user?.role !== "admin" && session?.user?.role !== "super_admin") {
        router.push("/unauthorized");
        return;
      }

      fetchAdmins();
      fetchActivityLogs();
    }
  }, [status, session, router]);

  // Fetch admin users
  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/admin/user-management");
      if (response.data.admins) {
        setAdmins(response.data.admins);

        // Calculate stats
        const newStats = {
          totalAdmins: response.data.admins.length,
          superAdmins: response.data.admins.filter(admin => admin.role === "super_admin").length,
          activeAdmins: response.data.admins.filter(admin =>
            admin.lastLoginAt &&
            new Date(admin.lastLoginAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          ).length,
          recentActivity: 0
        };

        setStats(newStats);
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast({
        title: "Error",
        description: "Failed to load admin data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch activity logs
  const fetchActivityLogs = async () => {
    try {
      const response = await axios.get("/api/admin/activity-logs");
      if (response.data.logs) {
        setActivityLogs(response.data.logs);

        // Update recent activity count
        const recentLogs = response.data.logs.filter(log =>
          new Date(log.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        );

        setStats(prev => ({ ...prev, recentActivity: recentLogs.length }));
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error);
    }
  };

  // Filter admins based on search term
  const filteredAdmins = admins.filter(admin =>
    admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form input changes
  const handleFormChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child, subchild] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: subchild ? {
            ...prev[parent][child],
            [subchild]: value
          } : value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  // Clear form data
  const clearForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "admin",
      permissions: {
        mosques: { read: true, write: false, delete: false },
        volunteers: { read: true, write: false, delete: false },
        businesses: { read: true, write: false, delete: false },
        halal_certifications: { read: true, write: false, delete: false },
        users: { read: false, write: false, delete: false },
        settings: { read: false, write: false, delete: false }
      }
    });
  };

  // Handle admin actions
  const handleAdminAction = async () => {
    if (!actionType) return;

    try {
      setLoading(true);

      let response;

      if (actionType === "create") {
        if (!formData.name || !formData.email || !formData.password) {
          toast({
            title: "Missing Information",
            description: "Please provide name, email, and password.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        response = await axios.post("/api/admin/user-management", formData);

        if (response.data.admin) {
          setAdmins(prev => [...prev, response.data.admin]);
          setStats(prev => ({
            ...prev,
            totalAdmins: prev.totalAdmins + 1,
            superAdmins: formData.role === "super_admin" ? prev.superAdmins + 1 : prev.superAdmins
          }));

          toast({
            title: "Success",
            description: "Admin user created successfully.",
          });
        }
      } else if (actionType === "update" && selectedAdmin) {
        response = await axios.patch(
          `/api/admin/user-management/${selectedAdmin._id}`,
          formData
        );

        if (response.data.admin) {
          setAdmins(prev =>
            prev.map(admin =>
              admin._id === selectedAdmin._id ? response.data.admin : admin
            )
          );

          toast({
            title: "Success",
            description: "Admin user updated successfully.",
          });
        }
      } else if (actionType === "delete" && selectedAdmin) {
        response = await axios.delete(`/api/admin/user-management/${selectedAdmin._id}`);

        setAdmins(prev => prev.filter(admin => admin._id !== selectedAdmin._id));
        setStats(prev => ({
          ...prev,
          totalAdmins: prev.totalAdmins - 1,
          superAdmins: selectedAdmin.role === "super_admin" ? prev.superAdmins - 1 : prev.superAdmins
        }));

        toast({
          title: "Success",
          description: "Admin user deleted successfully.",
        });
      }

      // Clear form and close dialog
      clearForm();
      setDialogOpen(false);
      setSelectedAdmin(null);
      setActionType(null);

    } catch (error) {
      console.error("Error managing admin:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to manage admin user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Open action dialog
  const openActionDialog = (type, admin = null) => {
    setActionType(type);
    setSelectedAdmin(admin);

    if (type === "update" && admin) {
      setFormData({
        name: admin.name || "",
        email: admin.email || "",
        password: "",
        role: admin.role || "admin",
        permissions: admin.permissions || {
          mosques: { read: true, write: false, delete: false },
          volunteers: { read: true, write: false, delete: false },
          businesses: { read: true, write: false, delete: false },
          halal_certifications: { read: true, write: false, delete: false },
          users: { read: false, write: false, delete: false },
          settings: { read: false, write: false, delete: false }
        }
      });
    } else {
      clearForm();
    }

    setDialogOpen(true);
  };

  // Render role badge
  const renderRoleBadge = (role) => {
    switch (role) {
      case "super_admin":
        return <Badge className="bg-purple-100 text-purple-800"><Crown className="h-3 w-3 mr-1" />Super Admin</Badge>;
      case "admin":
        return <Badge className="bg-blue-100 text-blue-800"><Shield className="h-3 w-3 mr-1" />Admin</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{role}</Badge>;
    }
  };

  // Render permission badge
  const renderPermissionBadge = (permission, level) => {
    const colors = {
      read: "bg-green-100 text-green-800",
      write: "bg-yellow-100 text-yellow-800",
      delete: "bg-red-100 text-red-800"
    };

    return (
      <Badge className={`text-xs ${colors[level]}`}>
        {level}
      </Badge>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Loading state
  if (loading && admins.length === 0) {
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
        <h1 className="text-3xl font-bold">Admin User Management</h1>
        <Button
          onClick={() => openActionDialog("create")}
          className="flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Add Admin User
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Admins</p>
                <p className="text-3xl font-bold">{stats.totalAdmins}</p>
              </div>
              <User className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Super Admins</p>
                <p className="text-3xl font-bold">{stats.superAdmins}</p>
              </div>
              <Crown className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Active (30 days)</p>
                <p className="text-3xl font-bold">{stats.activeAdmins}</p>
              </div>
              <ShieldCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Recent Activity</p>
                <p className="text-3xl font-bold">{stats.recentActivity}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="admins" className="mb-6">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="admins" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Admin Users
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity Logs
          </TabsTrigger>
        </TabsList>

        {/* Admin Users Tab */}
        <TabsContent value="admins">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-10"
              placeholder="Search by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Admin List */}
          {filteredAdmins.length > 0 ? (
            <div className="space-y-4">
              {filteredAdmins.map((admin) => (
                <Card key={admin._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {admin.name}
                          {admin._id === session?.user?.id && (
                            <Badge variant="outline" className="text-xs">You</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {admin.email}
                        </CardDescription>
                      </div>
                      {renderRoleBadge(admin.role)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Basic Info */}
                      <div>
                        <h3 className="text-sm font-medium mb-2">Account Information</h3>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            Created: {formatDate(admin.createdAt)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-gray-500" />
                            Last Login: {formatDate(admin.lastLoginAt)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4 text-gray-500" />
                            Status: {admin.isActive ? "Active" : "Inactive"}
                          </div>
                        </div>
                      </div>

                      {/* Permissions */}
                      <div>
                        <h3 className="text-sm font-medium mb-2">Permissions</h3>
                        <div className="space-y-1">
                          {admin.permissions && Object.entries(admin.permissions).map(([module, perms]) => (
                            <div key={module} className="flex items-center gap-2 text-sm">
                              <span className="capitalize font-medium w-20">{module.replace('_', ' ')}:</span>
                              <div className="flex gap-1">
                                {Object.entries(perms).map(([level, hasPermission]) =>
                                  hasPermission && renderPermissionBadge(module, level)
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openActionDialog("update", admin)}
                      disabled={session?.user?.role !== "super_admin" && admin.role === "super_admin"}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>

                    {admin._id !== session?.user?.id && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={session?.user?.role !== "super_admin" && admin.role === "super_admin"}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Admin User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the admin user "{admin.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                setSelectedAdmin(admin);
                                setActionType("delete");
                                handleAdminAction();
                              }}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Admin Users Found</h3>
              <p className="text-gray-500">No admin users match your search criteria.</p>
            </div>
          )}
        </TabsContent>

        {/* Activity Logs Tab */}
        <TabsContent value="activity">
          {activityLogs.length > 0 ? (
            <div className="space-y-2">
              {activityLogs.slice(0, 50).map((log, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{log.action}</p>
                      <p className="text-sm text-gray-600">{log.details}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <User className="h-3 w-3" />
                        {log.adminName || log.adminId}
                        <Calendar className="h-3 w-3 ml-2" />
                        {formatDate(log.timestamp)}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {log.module}
                    </Badge>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Activity Logs</h3>
              <p className="text-gray-500">No admin activity has been recorded yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Admin Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {actionType === "create" ? "Create Admin User" : "Update Admin User"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "create"
                ? "Create a new admin user with specific permissions."
                : "Update the admin user's information and permissions."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleFormChange("name", e.target.value)}
                  placeholder="Admin's full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">
                  {actionType === "create" ? "Password" : "New Password (optional)"}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleFormChange("password", e.target.value)}
                  placeholder={actionType === "create" ? "Password" : "Leave empty to keep current"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleFormChange("role", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    {session?.user?.role === "super_admin" && (
                      <SelectItem value="super_admin">Super Admin</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Permissions</Label>

              {Object.entries(formData.permissions).map(([module, perms]) => (
                <div key={module} className="border rounded-md p-3">
                  <h3 className="font-medium mb-2 capitalize">{module.replace('_', ' ')}</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(perms).map(([level, hasPermission]) => (
                      <label key={level} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={hasPermission}
                          onChange={(e) =>
                            handleFormChange(`permissions.${module}.${level}`, e.target.checked)
                          }
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm capitalize">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdminAction}
              disabled={loading}
            >
              {loading ? "Processing..." : actionType === "create" ? "Create Admin" : "Update Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
