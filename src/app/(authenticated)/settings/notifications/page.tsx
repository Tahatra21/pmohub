'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  Mail, 
  MessageSquare,
  Smartphone,
  Settings,
  ArrowLeft,
  Save,
  TestTube,
  Volume2,
  VolumeX,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface NotificationSettings {
  email: {
    enabled: boolean;
    projectUpdates: boolean;
    taskAssignments: boolean;
    deadlineReminders: boolean;
    systemAlerts: boolean;
    weeklyReports: boolean;
  };
  inApp: {
    enabled: boolean;
    projectUpdates: boolean;
    taskAssignments: boolean;
    deadlineReminders: boolean;
    systemAlerts: boolean;
    soundEnabled: boolean;
  };
  push: {
    enabled: boolean;
    projectUpdates: boolean;
    taskAssignments: boolean;
    deadlineReminders: boolean;
    systemAlerts: boolean;
  };
  sms: {
    enabled: boolean;
    urgentOnly: boolean;
    systemAlerts: boolean;
  };
  schedule: {
    quietHoursEnabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
}

export default function NotificationsPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      enabled: true,
      projectUpdates: true,
      taskAssignments: true,
      deadlineReminders: true,
      systemAlerts: true,
      weeklyReports: false,
    },
    inApp: {
      enabled: true,
      projectUpdates: true,
      taskAssignments: true,
      deadlineReminders: true,
      systemAlerts: true,
      soundEnabled: true,
    },
    push: {
      enabled: false,
      projectUpdates: true,
      taskAssignments: true,
      deadlineReminders: true,
      systemAlerts: true,
    },
    sms: {
      enabled: false,
      urgentOnly: true,
      systemAlerts: true,
    },
    schedule: {
      quietHoursEnabled: true,
      startTime: '22:00',
      endTime: '08:00',
      timezone: 'Asia/Jakarta',
    },
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastSaved(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleTestNotification = async (type: string) => {
    setTestResult(null);
    try {
      // Simulate sending test notification
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTestResult(`Test ${type} notification sent successfully!`);
    } catch (error) {
      setTestResult(`Failed to send test ${type} notification`);
    }
  };

  const getActiveNotificationsCount = () => {
    let count = 0;
    if (settings.email.enabled) count += 5; // email notifications
    if (settings.inApp.enabled) count += 5; // in-app notifications
    if (settings.push.enabled) count += 4; // push notifications
    if (settings.sms.enabled) count += 2; // SMS notifications
    return count;
  };

  const activeCount = getActiveNotificationsCount();

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
              <Bell className="h-8 w-8 text-blue-600" />
              Notifications
            </h1>
            <p className="text-gray-500">Configure notification preferences and alerts</p>
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
            {saving ? <Settings className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Notification Status */}
      <Alert>
        <Bell className="h-4 w-4" />
        <AlertDescription>
          Notification Status: <Badge className="ml-2 bg-blue-100 text-blue-800">
            {activeCount} Active Channels
          </Badge>
          {settings.schedule.quietHoursEnabled && (
            <Badge className="ml-2 bg-gray-100 text-gray-800">
              Quiet Hours: {settings.schedule.startTime} - {settings.schedule.endTime}
            </Badge>
          )}
          {settings.inApp.soundEnabled && (
            <Badge className="ml-2 bg-green-100 text-green-800">Sound Enabled</Badge>
          )}
        </AlertDescription>
      </Alert>

      {/* Test Result */}
      {testResult && (
        <Alert className={testResult.includes('successfully') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {testResult.includes('successfully') ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={testResult.includes('successfully') ? 'text-green-700' : 'text-red-700'}>
            {testResult}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Notifications
            </CardTitle>
            <CardDescription>
              Configure email notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Email Notifications</Label>
              <Switch
                checked={settings.email.enabled}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  email: { ...prev.email, enabled: checked }
                }))}
              />
            </div>
            
            {settings.email.enabled && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Project Updates</Label>
                    <Switch
                      checked={settings.email.projectUpdates}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        email: { ...prev.email, projectUpdates: checked }
                      }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Task Assignments</Label>
                    <Switch
                      checked={settings.email.taskAssignments}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        email: { ...prev.email, taskAssignments: checked }
                      }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Deadline Reminders</Label>
                    <Switch
                      checked={settings.email.deadlineReminders}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        email: { ...prev.email, deadlineReminders: checked }
                      }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>System Alerts</Label>
                    <Switch
                      checked={settings.email.systemAlerts}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        email: { ...prev.email, systemAlerts: checked }
                      }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Weekly Reports</Label>
                    <Switch
                      checked={settings.email.weeklyReports}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        email: { ...prev.email, weeklyReports: checked }
                      }))}
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleTestNotification('email')}
                    className="flex items-center gap-2"
                  >
                    <TestTube className="h-4 w-4" />
                    Send Test Email
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* In-App Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              In-App Notifications
            </CardTitle>
            <CardDescription>
              Configure in-app notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable In-App Notifications</Label>
              <Switch
                checked={settings.inApp.enabled}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  inApp: { ...prev.inApp, enabled: checked }
                }))}
              />
            </div>
            
            {settings.inApp.enabled && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Project Updates</Label>
                    <Switch
                      checked={settings.inApp.projectUpdates}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        inApp: { ...prev.inApp, projectUpdates: checked }
                      }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Task Assignments</Label>
                    <Switch
                      checked={settings.inApp.taskAssignments}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        inApp: { ...prev.inApp, taskAssignments: checked }
                      }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Deadline Reminders</Label>
                    <Switch
                      checked={settings.inApp.deadlineReminders}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        inApp: { ...prev.inApp, deadlineReminders: checked }
                      }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>System Alerts</Label>
                    <Switch
                      checked={settings.inApp.systemAlerts}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        inApp: { ...prev.inApp, systemAlerts: checked }
                      }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Sound Notifications</Label>
                    <Switch
                      checked={settings.inApp.soundEnabled}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        inApp: { ...prev.inApp, soundEnabled: checked }
                      }))}
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleTestNotification('in-app')}
                    className="flex items-center gap-2"
                  >
                    <TestTube className="h-4 w-4" />
                    Send Test Notification
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Push Notifications
            </CardTitle>
            <CardDescription>
              Configure mobile push notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Push Notifications</Label>
              <Switch
                checked={settings.push.enabled}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  push: { ...prev.push, enabled: checked }
                }))}
              />
            </div>
            
            {settings.push.enabled && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Project Updates</Label>
                    <Switch
                      checked={settings.push.projectUpdates}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        push: { ...prev.push, projectUpdates: checked }
                      }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Task Assignments</Label>
                    <Switch
                      checked={settings.push.taskAssignments}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        push: { ...prev.push, taskAssignments: checked }
                      }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>Deadline Reminders</Label>
                    <Switch
                      checked={settings.push.deadlineReminders}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        push: { ...prev.push, deadlineReminders: checked }
                      }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>System Alerts</Label>
                    <Switch
                      checked={settings.push.systemAlerts}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        push: { ...prev.push, systemAlerts: checked }
                      }))}
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleTestNotification('push')}
                    className="flex items-center gap-2"
                  >
                    <TestTube className="h-4 w-4" />
                    Send Test Push
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* SMS Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              SMS Notifications
            </CardTitle>
            <CardDescription>
              Configure SMS notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable SMS Notifications</Label>
              <Switch
                checked={settings.sms.enabled}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  sms: { ...prev.sms, enabled: checked }
                }))}
              />
            </div>
            
            {settings.sms.enabled && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Urgent Notifications Only</Label>
                    <Switch
                      checked={settings.sms.urgentOnly}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        sms: { ...prev.sms, urgentOnly: checked }
                      }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label>System Alerts</Label>
                    <Switch
                      checked={settings.sms.systemAlerts}
                      onCheckedChange={(checked) => setSettings(prev => ({
                        ...prev,
                        sms: { ...prev.sms, systemAlerts: checked }
                      }))}
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleTestNotification('SMS')}
                    className="flex items-center gap-2"
                  >
                    <TestTube className="h-4 w-4" />
                    Send Test SMS
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Quiet Hours
            </CardTitle>
            <CardDescription>
              Configure quiet hours to limit notifications during specific times
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Quiet Hours</Label>
              <Switch
                checked={settings.schedule.quietHoursEnabled}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  schedule: { ...prev.schedule, quietHoursEnabled: checked }
                }))}
              />
            </div>
            
            {settings.schedule.quietHoursEnabled && (
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <input
                    id="startTime"
                    type="time"
                    value={settings.schedule.startTime}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      schedule: { ...prev.schedule, startTime: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <input
                    id="endTime"
                    type="time"
                    value={settings.schedule.endTime}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      schedule: { ...prev.schedule, endTime: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <Label>Timezone</Label>
                  <Select 
                    value={settings.schedule.timezone} 
                    onValueChange={(value) => setSettings(prev => ({
                      ...prev,
                      schedule: { ...prev.schedule, timezone: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Jakarta">Asia/Jakarta</SelectItem>
                      <SelectItem value="Asia/Makassar">Asia/Makassar</SelectItem>
                      <SelectItem value="Asia/Jayapura">Asia/Jayapura</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
