'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, Shield, Calendar, Save, Edit3, Briefcase, MapPin, DollarSign, Users, Clock, Key } from 'lucide-react';
import ChangePasswordModal from '@/components/auth/ChangePasswordModal';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: {
    id: string;
    name: string;
    description: string;
  };
  resource?: {
    id: string;
    name: string;
    description?: string;
    skills?: string;
    department?: string;
    phone?: string;
    email?: string;
    maxProjects: number;
    hourlyRate?: number;
    status: string;
    type: string;
    createdAt: string;
    updatedAt: string;
  } | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData.data);
        setFormData({
          name: userData.data.name,
          email: userData.data.email,
          phone: userData.data.phone || '',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch user profile',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch user profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser.data);
        setIsEditing(false);
        toast({
          title: 'Success',
          description: 'Profile updated successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to update profile',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
              <p className="text-gray-600 mb-4">Unable to load user profile</p>
              <Button onClick={() => router.push('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-2xl">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle className="text-xl">{user.name}</CardTitle>
                <Badge variant={user.isActive ? 'default' : 'secondary'} className="mt-2">
                  {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {user.email}
                  </div>
                  {user.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {user.phone}
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Shield className="h-4 w-4 mr-2" />
                    {user.role.name}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Joined {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Profile Information</CardTitle>
                  {!isEditing && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowChangePassword(true)}
                      >
                        <Key className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <Separator />
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Full Name</Label>
                        <p className="mt-1 text-sm text-gray-900">{user.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                        <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Phone Number</Label>
                      <p className="mt-1 text-sm text-gray-900">{user.phone || 'Not provided'}</p>
                    </div>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Role</Label>
                      <p className="mt-1 text-sm text-gray-900">{user.role.name}</p>
                      <p className="mt-1 text-xs text-gray-500">{user.role.description}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Account Status</Label>
                      <div className="mt-1">
                        <Badge variant={user.isActive ? 'default' : 'secondary'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Member Since</Label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Last Updated</Label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(user.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resource Information */}
            {user.resource && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Briefcase className="h-5 w-5 mr-2" />
                    Resource Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Resource Name</Label>
                        <p className="mt-1 text-sm text-gray-900">{user.resource.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Resource Type</Label>
                        <div className="mt-1">
                          <Badge variant="outline">
                            {user.resource.type.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    {user.resource.description && (
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Description</Label>
                        <p className="mt-1 text-sm text-gray-900">{user.resource.description}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {user.resource.skills && (
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Skills</Label>
                          <p className="mt-1 text-sm text-gray-900">{user.resource.skills}</p>
                        </div>
                      )}
                      {user.resource.department && (
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Department</Label>
                          <p className="mt-1 text-sm text-gray-900">{user.resource.department}</p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Max Projects</Label>
                        <div className="mt-1 flex items-center">
                          <Users className="h-4 w-4 mr-1 text-gray-400" />
                          <span className="text-sm text-gray-900">{user.resource.maxProjects}</span>
                        </div>
                      </div>
                      {user.resource.hourlyRate && (
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Hourly Rate</Label>
                          <div className="mt-1 flex items-center">
                            <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                            <span className="text-sm text-gray-900">${user.resource.hourlyRate}</span>
                          </div>
                        </div>
                      )}
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Status</Label>
                        <div className="mt-1">
                          <Badge 
                            variant={user.resource.status === 'AVAILABLE' ? 'default' : 'secondary'}
                          >
                            {user.resource.status}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Resource Created</Label>
                        <div className="mt-1 flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {new Date(user.resource.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Last Updated</Label>
                        <div className="mt-1 flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {new Date(user.resource.updatedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Change Password Modal */}
        <ChangePasswordModal
          isOpen={showChangePassword}
          onClose={() => setShowChangePassword(false)}
        />
      </div>
    </div>
  );
}
