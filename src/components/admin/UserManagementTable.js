'use client';

import { useState, useEffect } from 'react';
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
  Crown,
  Shield,
  Building,
  UserCheck,
  User,
  Search,
  ArrowUp
} from 'lucide-react';

export default function UserManagementTable({ onUserUpdated }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [promotingUser, setPromotingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, filterRole, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    setFilteredUsers(filtered);
  };

  const promoteToSuperAdmin = async (userId, userName) => {
    if (!confirm(`Are you sure you want to promote ${userName} to Super Admin? This will give them full system access.`)) {
      return;
    }

    try {
      setPromotingUser(userId);
      await axios.patch(`/api/admin/users/${userId}/role`, { 
        role: 'superadmin' 
      });
      
      toast({
        title: "Success",
        description: `${userName} has been promoted to Super Admin`,
      });
      
      fetchUsers();
      if (onUserUpdated) onUserUpdated();
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to promote user",
        variant: "destructive"
      });
    } finally {
      setPromotingUser(null);
    }
  };

  const changeUserRole = async (userId, newRole, userName) => {
    try {
      await axios.patch(`/api/admin/users/${userId}/role`, { 
        role: newRole 
      });
      
      toast({
        title: "Success",
        description: `${userName}'s role changed to ${newRole}`,
      });
      
      fetchUsers();
      if (onUserUpdated) onUserUpdated();
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change user role",
        variant: "destructive"
      });
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'superadmin':
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case 'admin':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'imam':
        return <Shield className="h-4 w-4 text-green-500" />;
      case 'business':
        return <Building className="h-4 w-4 text-blue-500" />;
      case 'volunteer':
        return <UserCheck className="h-4 w-4 text-purple-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'superadmin':
        return 'default';
      case 'admin':
        return 'secondary';
      case 'imam':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  const roles = [...new Set(users.map(u => u.role).filter(Boolean))];

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          Manage user accounts and promote to Super Admin
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex space-x-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        {/* Users Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {getRoleIcon(user.role)}
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user._id}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role || 'user'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                    {user.status || 'active'}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {new Date(user.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    {/* Promote to Super Admin Button */}
                    {user.role !== 'superadmin' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => promoteToSuperAdmin(user._id, user.name)}
                        disabled={promotingUser === user._id}
                        className="text-yellow-600 border-yellow-600 hover:bg-yellow-50"
                      >
                        {promotingUser === user._id ? (
                          <LoadingSpinner className="h-3 w-3" />
                        ) : (
                          <ArrowUp className="h-4 w-4" />
                        )}
                        Super Admin
                      </Button>
                    )}
                    
                    {/* Role Change Dropdown */}
                    <select
                      value={user.role || 'user'}
                      onChange={(e) => changeUserRole(user._id, e.target.value, user.name)}
                      className="px-2 py-1 text-xs border border-gray-300 rounded"
                      disabled={user.role === 'superadmin'}
                    >
                      <option value="user">User</option>
                      <option value="volunteer">Volunteer</option>
                      <option value="business">Business</option>
                      <option value="imam">Imam</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super Admin</option>
                    </select>

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

        {filteredUsers.length === 0 && (
          <div className="text-center py-8">
            <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}