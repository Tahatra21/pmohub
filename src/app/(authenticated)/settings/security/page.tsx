'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  Key, 
  Lock, 
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  Clock,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface SecuritySettings {
  id?: string;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    passwordExpiryDays: number;
  };
  sessionSettings: {
    sessionTimeout: number;
    maxConcurrentSessions: number;
    requireReauthForSensitive: boolean;
  };
  accessControl: {
    enableTwoFactor: boolean;
    enableIpWhitelist: boolean;
    allowedIps: string[];
    enableAuditLog: boolean;
  };
  encryption: {
    enableDataEncryption: boolean;
    encryptionAlgorithm: string;
    keyRotationDays: number;
  };
  updatedAt?: string;
  updatedBy?: string;
}

interface UserSession {
  id: string;
  userId: string;
  sessionId: string;
  userName: string;
  userEmail: string;
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
  lastActivity: string;
  expiresAt: string;
  createdAt: string;
}

export default function SecurityPage() {
  const router = useRouter();
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [showSessions, setShowSessions] = useState(false);

  const [settings, setSettings] = useState<SecuritySettings>({
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      passwordExpiryDays: 90,
    },
    sessionSettings: {
      sessionTimeout: 30,
      maxConcurrentSessions: 3,
      requireReauthForSensitive: true,
    },
    accessControl: {
      enableTwoFactor: false,
      enableIpWhitelist: false,
      allowedIps: ['192.168.1.0/24', '10.0.0.0/8'],
      enableAuditLog: true,
    },
    encryption: {
      enableDataEncryption: true,
      encryptionAlgorithm: 'AES-256',
      keyRotationDays: 30,
    },
  });

  const [newIp, setNewIp] = useState('');

  const fetchSecuritySettings = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch('/api/security-settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch security settings');
      }

      const result = await response.json();
      if (result.success) {
        setSettings(result.data);
        setLastSaved(result.data.updatedAt ? new Date(result.data.updatedAt).toLocaleTimeString() : null);
      }
    } catch (error) {
      console.error('Error fetching security settings:', error);
      toast.error('Failed to fetch security settings');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch('/api/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sessions');
      }

      const result = await response.json();
      if (result.success) {
        setSessions(result.data.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to fetch sessions');
    }
  }, []);

  useEffect(() => {
    fetchSecuritySettings();
  }, [fetchSecuritySettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch('/api/security-settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passwordMinLength: settings.passwordPolicy.minLength,
          passwordRequireUpper: settings.passwordPolicy.requireUppercase,
          passwordRequireLower: settings.passwordPolicy.requireLowercase,
          passwordRequireNumber: settings.passwordPolicy.requireNumbers,
          passwordRequireSpecial: settings.passwordPolicy.requireSpecialChars,
          passwordExpiryDays: settings.passwordPolicy.passwordExpiryDays,
          sessionTimeoutMinutes: settings.sessionSettings.sessionTimeout,
          maxConcurrentSessions: settings.sessionSettings.maxConcurrentSessions,
          requireReauthSensitive: settings.sessionSettings.requireReauthForSensitive,
          enableTwoFactor: settings.accessControl.enableTwoFactor,
          enableIpWhitelist: settings.accessControl.enableIpWhitelist,
          allowedIps: settings.accessControl.allowedIps,
          enableAuditLog: settings.accessControl.enableAuditLog,
          enableDataEncryption: settings.encryption.enableDataEncryption,
          encryptionAlgorithm: settings.encryption.encryptionAlgorithm,
          keyRotationDays: settings.encryption.keyRotationDays,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save security settings');
      }

      const result = await response.json();
      if (result.success) {
        setLastSaved(new Date().toLocaleTimeString());
        toast.success('Security settings saved successfully');
        fetchSecuritySettings(); // Refresh data
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save security settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(`/api/sessions?action=single&sessionId=${sessionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to terminate session');
      }

      const result = await response.json();
      if (result.success) {
        toast.success('Session terminated successfully');
        fetchSessions(); // Refresh sessions
      }
    } catch (error) {
      console.error('Error terminating session:', error);
      toast.error('Failed to terminate session');
    }
  };

  const handleTerminateAllSessions = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch('/api/sessions?action=all', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to terminate all sessions');
      }

      const result = await response.json();
      if (result.success) {
        toast.success('All sessions terminated successfully');
        fetchSessions(); // Refresh sessions
      }
    } catch (error) {
      console.error('Error terminating all sessions:', error);
      toast.error('Failed to terminate all sessions');
    }
  };

  const addIpAddress = () => {
    if (newIp.trim() && !settings.accessControl.allowedIps.includes(newIp.trim())) {
      setSettings(prev => ({
        ...prev,
        accessControl: {
          ...prev.accessControl,
          allowedIps: [...prev.accessControl.allowedIps, newIp.trim()]
        }
      }));
      setNewIp('');
    }
  };

  const removeIpAddress = (ip: string) => {
    setSettings(prev => ({
      ...prev,
      accessControl: {
        ...prev.accessControl,
        allowedIps: prev.accessControl.allowedIps.filter(ipAddr => ipAddr !== ip)
      }
    }));
  };

  const getPasswordStrength = () => {
    const policy = settings.passwordPolicy;
    let score = 0;
    if (policy.minLength >= 8) score++;
    if (policy.requireUppercase) score++;
    if (policy.requireLowercase) score++;
    if (policy.requireNumbers) score++;
    if (policy.requireSpecialChars) score++;
    
    if (score <= 2) return { level: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { level: 'Medium', color: 'bg-yellow-500' };
    return { level: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => router.push('/settings')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Settings
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              Security Settings
            </h1>
            <p className="text-gray-500">Configure security policies and access controls</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && (
            <Badge variant="outline" className="text-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Saved at {lastSaved}
            </Badge>
          )}
          <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Security Status */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Security Status: <Badge className={`ml-2 ${passwordStrength.color} text-white`}>
            {passwordStrength.level}
          </Badge>
          {settings.accessControl.enableTwoFactor && (
            <Badge className="ml-2 bg-blue-500 text-white">2FA Enabled</Badge>
          )}
          {settings.encryption.enableDataEncryption && (
            <Badge className="ml-2 bg-green-500 text-white">Encrypted</Badge>
          )}
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Password Policy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Password Policy
            </CardTitle>
            <CardDescription>
              Configure password requirements and expiration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="minLength">Minimum Password Length</Label>
              <Input
                id="minLength"
                type="number"
                value={settings.passwordPolicy.minLength}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  passwordPolicy: { ...prev.passwordPolicy, minLength: parseInt(e.target.value) || 8 }
                }))}
                min="6"
                max="32"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Require Uppercase Letters</Label>
                <Switch
                  checked={settings.passwordPolicy.requireUppercase}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    passwordPolicy: { ...prev.passwordPolicy, requireUppercase: checked }
                  }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Require Lowercase Letters</Label>
                <Switch
                  checked={settings.passwordPolicy.requireLowercase}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    passwordPolicy: { ...prev.passwordPolicy, requireLowercase: checked }
                  }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Require Numbers</Label>
                <Switch
                  checked={settings.passwordPolicy.requireNumbers}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    passwordPolicy: { ...prev.passwordPolicy, requireNumbers: checked }
                  }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Require Special Characters</Label>
                <Switch
                  checked={settings.passwordPolicy.requireSpecialChars}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    passwordPolicy: { ...prev.passwordPolicy, requireSpecialChars: checked }
                  }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="expiryDays">Password Expiry (Days)</Label>
              <Input
                id="expiryDays"
                type="number"
                value={settings.passwordPolicy.passwordExpiryDays}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  passwordPolicy: { ...prev.passwordPolicy, passwordExpiryDays: parseInt(e.target.value) || 90 }
                }))}
                min="30"
                max="365"
              />
            </div>
          </CardContent>
        </Card>

        {/* Session Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Session Settings
            </CardTitle>
            <CardDescription>
              Configure session timeout and concurrent session limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="sessionTimeout">Session Timeout (Minutes)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionSettings.sessionTimeout}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  sessionSettings: { ...prev.sessionSettings, sessionTimeout: parseInt(e.target.value) || 30 }
                }))}
                min="5"
                max="480"
              />
            </div>
            
            <div>
              <Label htmlFor="maxSessions">Maximum Concurrent Sessions</Label>
              <Input
                id="maxSessions"
                type="number"
                value={settings.sessionSettings.maxConcurrentSessions}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  sessionSettings: { ...prev.sessionSettings, maxConcurrentSessions: parseInt(e.target.value) || 3 }
                }))}
                min="1"
                max="10"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Require Re-authentication for Sensitive Operations</Label>
              <Switch
                checked={settings.sessionSettings.requireReauthForSensitive}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  sessionSettings: { ...prev.sessionSettings, requireReauthForSensitive: checked }
                }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Access Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Access Control
            </CardTitle>
            <CardDescription>
              Configure two-factor authentication and IP restrictions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Two-Factor Authentication</Label>
              <Switch
                checked={settings.accessControl.enableTwoFactor}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  accessControl: { ...prev.accessControl, enableTwoFactor: checked }
                }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Enable IP Whitelist</Label>
              <Switch
                checked={settings.accessControl.enableIpWhitelist}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  accessControl: { ...prev.accessControl, enableIpWhitelist: checked }
                }))}
              />
            </div>
            
            {settings.accessControl.enableIpWhitelist && (
              <div>
                <Label>Allowed IP Addresses</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="192.168.1.0/24"
                    value={newIp}
                    onChange={(e) => setNewIp(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addIpAddress()}
                  />
                  <Button onClick={addIpAddress} size="sm">Add</Button>
                </div>
                <div className="mt-2 space-y-1">
                  {settings.accessControl.allowedIps.map((ip, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm font-mono">{ip}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeIpAddress(ip)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <Label>Enable Audit Logging</Label>
              <Switch
                checked={settings.accessControl.enableAuditLog}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  accessControl: { ...prev.accessControl, enableAuditLog: checked }
                }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data Encryption */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Data Encryption
            </CardTitle>
            <CardDescription>
              Configure data encryption settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Data Encryption</Label>
              <Switch
                checked={settings.encryption.enableDataEncryption}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  encryption: { ...prev.encryption, enableDataEncryption: checked }
                }))}
              />
            </div>
            
            <div>
              <Label htmlFor="algorithm">Encryption Algorithm</Label>
              <Input
                id="algorithm"
                value={settings.encryption.encryptionAlgorithm}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  encryption: { ...prev.encryption, encryptionAlgorithm: e.target.value }
                }))}
                disabled={!settings.encryption.enableDataEncryption}
              />
            </div>
            
            <div>
              <Label htmlFor="keyRotation">Key Rotation (Days)</Label>
              <Input
                id="keyRotation"
                type="number"
                value={settings.encryption.keyRotationDays}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  encryption: { ...prev.encryption, keyRotationDays: parseInt(e.target.value) || 30 }
                }))}
                disabled={!settings.encryption.enableDataEncryption}
                min="1"
                max="365"
              />
            </div>
          </CardContent>
        </Card>

        {/* Session Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Sessions
            </CardTitle>
            <CardDescription>
              Manage active user sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowSessions(!showSessions);
                    if (!showSessions) {
                      fetchSessions();
                    }
                  }}
                >
                  {showSessions ? 'Hide' : 'Show'} Active Sessions
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleTerminateAllSessions}
                  disabled={sessions.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Terminate All
                </Button>
              </div>
              <Badge variant="outline">
                {sessions.length} Active Sessions
              </Badge>
            </div>

            {showSessions && (
              <div className="space-y-2">
                {sessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No active sessions found</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {sessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{session.userName}</span>
                            <Badge variant="outline" className="text-xs">
                              {session.userEmail}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Last activity: {new Date(session.lastActivity).toLocaleString()}
                              </span>
                              {session.ipAddress && (
                                <span>IP: {session.ipAddress}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTerminateSession(session.sessionId)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
