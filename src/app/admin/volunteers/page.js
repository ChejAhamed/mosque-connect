'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-states';
import {
  Eye,
  Edit,
  UserCheck,
  UserX,
  Search,
  Users,
  Calendar,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function AdminVolunteers() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [volunteers, setVolunteers] = useState([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Authentication check
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

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/volunteers');
      setVolunteers(response.data);
      setFilteredVolunteers(response.data);
    } catch (error) {
      console.error('Error fetching volunteers:', error);
      toast({
        title: "Error",
        description: "Failed to load volunteers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter volunteers based on search and status
  useEffect(() => {
    let filtered = volunteers;

    if (searchTerm) {
      filtered = filtered.filter(volunteer =>
        volunteer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        volunteer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        volunteer.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(volunteer => volunteer.status === filterStatus);
    }

    setFilteredVolunteers(filtered);
  }, [searchTerm, filterStatus, volunteers]);

  const handleVolunteerAction = async (volunteerId, action) => {
    try {
      await axios.patch(`/api/admin/volunteers/${volunteerId}`, { status: action });
      toast({
        title: "Success",
        description: `Volunteer ${action} successfully`
      });
      fetchVolunteers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update volunteer status",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Volunteer Management</h1>
          <p className="text-gray-600">Manage volunteer applications and assignments</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchVolunteers}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volunteers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{volunteers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Volunteers</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {volunteers.filter(v => v.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {volunteers.filter(v => v.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {volunteers.filter(v => {
                const created = new Date(v.createdAt);
                const now = new Date();
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Volunteers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search volunteers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Volunteers Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Volunteers ({filteredVolunteers.length})</CardTitle>
          <CardDescription>
            Complete list of volunteer applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Skills</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVolunteers.map((volunteer) => (
                <TableRow key={volunteer._id}>
                  <TableCell className="font-medium">{volunteer.name}</TableCell>
                  <TableCell>{volunteer.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {volunteer.skills?.slice(0, 2).map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {volunteer.skills?.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{volunteer.skills.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{volunteer.availability || 'N/A'}</TableCell>
                  <TableCell>{volunteer.experience || 'No experience listed'}</TableCell>
                  <TableCell>
                    <Badge variant={
                      volunteer.status === 'active' ? 'default' :
                      volunteer.status === 'pending' ? 'secondary' : 'destructive'
                    }>
                      {volunteer.status || 'pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(volunteer.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {volunteer.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleVolunteerAction(volunteer._id, 'active')}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleVolunteerAction(volunteer._id, 'rejected')}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredVolunteers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No volunteers found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
