'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  Clock,
  MessageSquare,
  Pin,
  Shield,
  Building2
} from 'lucide-react';
import axios from 'axios';

export default function BusinessAnnouncementsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general',
    isActive: true,
    expiresAt: ''
  });

  // Check if user is admin or business
  const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'superadmin';
  const isBusiness = session?.user?.role === 'business';
  const hasAccess = isAdmin || isBusiness;

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user) {
      router.push('/login');
      return;
    }

    if (!hasAccess) {
      router.push('/dashboard');
      return;
    }

    fetchAnnouncements();
  }, [session, status, router, hasAccess]);

 // Update the fetchAnnouncements function:
const fetchAnnouncements = async () => {
  setLoading(true);
  setError(null);
  try {
    console.log('Fetching announcements for user:', { 
      role: session?.user?.role, 
      id: session?.user?.id 
    });
    
    // Use admin endpoint for admin users
    const endpoint = isAdmin ? '/api/admin/announcements' : '/api/business/announcements';
    const response = await axios.get(endpoint);
    console.log('Fetch response:', response.data);
    setAnnouncements(response.data.announcements || []);
  } catch (err) {
    // ... rest of error handling
  } finally {
    setLoading(false);
  }
};

// Update the handleCreateAnnouncement function:
const handleCreateAnnouncement = async (e) => {
  e.preventDefault();
  setCreateLoading(true);
  
  try {
    console.log('Creating announcement:', {
      formData,
      isAdmin,
      userRole: session?.user?.role,
      userId: session?.user?.id
    });

    const payload = {
      ...formData,
      isAdminAnnouncement: isAdmin
    };

    console.log('Sending payload:', payload);

    // Use admin endpoint for admin users
    const endpoint = isAdmin ? '/api/admin/announcements' : '/api/business/announcements';
    const response = await axios.post(endpoint, payload);
    
    console.log('Create response:', response.data);
    
    setAnnouncements(prev => [response.data.announcement, ...prev]);
    setIsCreateDialogOpen(false);
    resetForm();
    toast.success('Announcement created successfully');
  } catch (error) {
    // ... rest of error handling
  } finally {
    setCreateLoading(false);
  }
};

  const handleEditAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`/api/business/announcements/${editingAnnouncement._id}`, formData);
      setAnnouncements(prev => 
        prev.map(ann => 
          ann._id === editingAnnouncement._id ? response.data.announcement : ann
        )
      );
      setIsEditDialogOpen(false);
      setEditingAnnouncement(null);
      resetForm();
      toast.success('Announcement updated successfully');
    } catch (error) {
      console.error('Error updating announcement:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.error || 'Failed to update announcement');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      await axios.delete(`/api/business/announcements/${id}`);
      setAnnouncements(prev => prev.filter(ann => ann._id !== id));
      toast.success('Announcement deleted successfully');
    } catch (error) {
      console.error('Error deleting announcement:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.error || 'Failed to delete announcement');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: isAdmin ? 'platform' : 'general',
      isActive: true,
      expiresAt: ''
    });
  };

  const openEditDialog = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type,
      isActive: announcement.isActive,
      expiresAt: announcement.expiresAt ? new Date(announcement.expiresAt).toISOString().split('T')[0] : ''
    });
    setIsEditDialogOpen(true);
  };

  const getTypeColor = (type) => {
    const colors = {
      // Business categories
      general: 'bg-gray-100 text-gray-800',
      promotion: 'bg-green-100 text-green-800',
      event: 'bg-blue-100 text-blue-800',
      news: 'bg-purple-100 text-purple-800',
      urgent: 'bg-red-100 text-red-800',
      // Admin categories
      platform: 'bg-indigo-100 text-indigo-800',
      system: 'bg-yellow-100 text-yellow-800',
      maintenance: 'bg-orange-100 text-orange-800',
      policy: 'bg-pink-100 text-pink-800',
      security: 'bg-red-100 text-red-800'
    };
    return colors[type] || colors.general;
  };

  const getAnnouncementTypeOptions = () => {
    if (isAdmin) {
      return [
        { value: 'platform', label: 'Platform Announcement' },
        { value: 'system', label: 'System Update' },
        { value: 'maintenance', label: 'Maintenance Notice' },
        { value: 'policy', label: 'Policy Update' },
        { value: 'security', label: 'Security Alert' },
        { value: 'news', label: 'Platform News' }
      ];
    } else {
      return [
        { value: 'general', label: 'General' },
        { value: 'promotion', label: 'Promotion' },
        { value: 'event', label: 'Event' },
        { value: 'news', label: 'News' },
        { value: 'urgent', label: 'Urgent' }
      ];
    }
  };

  const getPageTitle = () => {
    return isAdmin ? 'Platform Announcements' : 'Business Announcements';
  };

  const getPageDescription = () => {
    return isAdmin ? 
      'Manage platform-wide announcements and system updates' : 
      'Manage your business announcements and updates';
  };

  // Show loading state
  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  // Show unauthorized message
  if (!session?.user || !hasAccess) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">Access denied. Admin or Business account required.</p>
            <Button onClick={() => router.push('/login')}>Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="text-center">Loading announcements...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 pt-24">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <div className="space-y-2">
              <Button onClick={fetchAnnouncements}>Try Again</Button>
              {isAdmin && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Debug Info:</strong><br />
                    User Role: {session?.user?.role}<br />
                    User ID: {session?.user?.id}<br />
                    Check browser console and server logs for more details.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-24">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">{getPageTitle()}</h1>
            {isAdmin && <Shield className="h-6 w-6 text-blue-600" />}
            {isBusiness && <Building2 className="h-6 w-6 text-green-600" />}
          </div>
          <p className="text-gray-600">{getPageDescription()}</p>
          {isAdmin && (
            <p className="text-sm text-amber-600 mt-1">
              Note: Admin creating announcements through business system.
            </p>
          )}
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Create Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Announcement</DialogTitle>
              <DialogDescription>
                {isAdmin ? 'Create a platform-wide announcement' : 'Create a new announcement for your business'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Announcement title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Announcement content"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAnnouncementTypeOptions().map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                  <Input
                    id="expiresAt"
                    type="date"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createLoading}>
                  {createLoading ? 'Creating...' : 'Create Announcement'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Announcements List */}
      <div className="space-y-6">
        {announcements.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No announcements yet</h3>
              <p className="text-gray-600 mb-4">
                {isAdmin ? 
                  'Create your first platform announcement to communicate with all users' :
                  'Create your first announcement to engage with your audience'
                }
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Announcement
              </Button>
            </CardContent>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{announcement.title}</CardTitle>
                      <Badge className={getTypeColor(announcement.type)}>
                        {announcement.type}
                      </Badge>
                      {!announcement.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                      {announcement.isPinned && (
                        <Pin className="h-4 w-4 text-blue-600" />
                      )}
                      {announcement.businessId ? (
                        <Badge variant="outline" className="text-xs">
                          <Building2 className="h-3 w-3 mr-1" />
                          Business
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          Platform
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-4 text-sm flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(announcement.createdAt).toLocaleDateString()}
                      </span>
                      {announcement.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {announcement.views || 0} views
                      </span>
                    </CardDescription>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(announcement)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteAnnouncement(announcement._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
            <DialogDescription>
              Update your announcement details
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditAnnouncement} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Announcement title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Announcement content"
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getAnnouncementTypeOptions().map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-expiresAt">Expires At (Optional)</Label>
                <Input
                  id="edit-expiresAt"
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="edit-isActive">Active</Label>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Update Announcement</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}