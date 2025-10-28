'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, User, Mail, Phone, Shield, AlertCircle } from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: any;
  onSuccess: () => void;
}

interface Role {
  id: string;
  name: string;
  description: string;
}

export default function UserModal({ isOpen, onClose, user, onSuccess }: UserModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    roleId: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEdit = !!user;

  useEffect(() => {
    if (isOpen) {
      fetchRoles();
      if (user) {
        setFormData({
          name: user.name || '',
          email: user.email || '',
          password: '',
          phone: user.phone || '',
          roleId: user.roleId || '',
          isActive: user.isActive ?? true,
        });
      } else {
        setFormData({
          name: '',
          email: '',
          password: '',
          phone: '',
          roleId: '',
          isActive: true,
        });
      }
      setErrors({});
    }
  }, [isOpen, user]);

  const fetchRoles = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/roles', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRoles(data.data.roles || []);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast({
          title: 'Error',
          description: 'Authentication required',
          variant: 'destructive',
        });
        return;
      }

      const url = isEdit ? '/api/users' : '/api/users';
      const method = isEdit ? 'PUT' : 'POST';
      
      const payload = isEdit 
        ? { id: user.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Success',
          description: isEdit ? 'User updated successfully' : 'User created successfully',
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          password: '',
          phone: '',
          roleId: '',
          isActive: true,
        });
        
        onSuccess();
        onClose();
      } else {
        if (result.details && Array.isArray(result.details)) {
          // Handle validation errors
          const fieldErrors: Record<string, string> = {};
          result.details.forEach((detail: any) => {
            fieldErrors[detail.path?.[0] || detail.field] = detail.message;
          });
          setErrors(fieldErrors);
        } else {
          toast({
            title: 'Error',
            description: result.error || `Failed to ${isEdit ? 'update' : 'create'} user`,
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} user:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${isEdit ? 'update' : 'create'} user`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        roleId: '',
        isActive: true,
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            {isEdit ? 'Edit User' : 'Add New User'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update user information and permissions' : 'Create a new user account with role and permissions'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter full name"
              className={errors.name ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              className={errors.email ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">
              Password {isEdit ? '(leave empty to keep current)' : '*'}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder={isEdit ? 'Enter new password' : 'Enter password'}
                className={errors.password ? 'border-red-500' : ''}
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-600">{errors.password}</p>
            )}
            {!isEdit && (
              <p className="text-xs text-gray-500">
                Password must be at least 6 characters
              </p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter phone number"
              className={errors.phone ? 'border-red-500' : ''}
              disabled={loading}
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label htmlFor="roleId">Role *</Label>
            <Select
              value={formData.roleId}
              onValueChange={(value) => handleInputChange('roleId', value)}
              disabled={loading}
            >
              <SelectTrigger className={errors.roleId ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    <div className="flex flex-col">
                      <span>{role.name}</span>
                      <span className="text-xs text-gray-500">{role.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.roleId && (
              <p className="text-sm text-red-600">{errors.roleId}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Account Status</Label>
              <p className="text-sm text-gray-500">
                {formData.isActive ? 'User can login and access the system' : 'User account is disabled'}
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange('isActive', checked)}
              disabled={loading}
            />
          </div>

          {/* Security Notice */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              {isEdit 
                ? 'User information will be updated. Password changes are logged for security.'
                : 'New user will be created with encrypted password. User will receive login credentials.'
              }
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name || !formData.email || !formData.roleId || (!isEdit && !formData.password)}
              className="min-w-[120px]"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <User className="h-4 w-4 mr-2" />
                  {isEdit ? 'Update User' : 'Create User'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
