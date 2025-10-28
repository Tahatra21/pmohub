'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  Database, 
  Download, 
  Upload,
  Play,
  Pause,
  RefreshCw,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Clock,
  HardDrive,
  Settings,
  Trash2,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';

interface DatabaseConnection {
  id: string;
  name: string;
  host: string;
  port: number;
  database: string;
  status: 'connected' | 'disconnected' | 'error';
  lastChecked: string;
  version?: string;
  size?: string;
}

interface BackupJob {
  id: string;
  name: string;
  size: string;
  createdAt: string;
  modifiedAt: string;
}

interface SchedulerJob {
  id: string;
  name: string;
  schedule: string;
  isActive: boolean;
  lastRun?: string;
  nextRun?: string;
  status: 'active' | 'paused' | 'error';
}

interface SchedulerStatus {
  isActive: boolean;
  activeJobs: number;
  totalJobs: number;
  lastBackup?: string;
  nextBackup?: string;
}


export default function DatabasePage() {
  const router = useRouter();
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [backups, setBackups] = useState<BackupJob[]>([]);
  const [schedulerJobs, setSchedulerJobs] = useState<SchedulerJob[]>([]);
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null);
  const [autoBackup, setAutoBackup] = useState(true);
  const [compression, setCompression] = useState(true);
  const [retentionDays, setRetentionDays] = useState(30);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load data from API
  useEffect(() => {
    loadDatabaseStatus();
    loadBackups();
    loadScheduler();
  }, []);

  const loadScheduler = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/database/scheduler', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSchedulerStatus(data.data.status);
          setSchedulerJobs(data.data.jobs);
        }
      }
    } catch (error) {
      console.error('Error loading scheduler:', error);
    }
  };

  const loadDatabaseStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/database/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setConnections([data.data.connection]);
        }
      }
    } catch (error) {
      console.error('Error loading database status:', error);
    }
  };

  const loadBackups = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/database/backup', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBackups(data.data.backups);
        }
      }
    } catch (error) {
      console.error('Error loading backups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async (connectionId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/database/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setConnections([data.data.connection]);
          toast.success('Connection test successful');
        }
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast.error('Connection test failed');
    }
  };

  const handleStartBackup = async () => {
    try {
      setIsBackingUp(true);
      setBackupProgress(0);
      
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      // Simulate progress
      const progressInterval = setInterval(() => {
        setBackupProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/database/backup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `pmo_db_backup_${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}`,
          type: 'full'
        }),
      });

      clearInterval(progressInterval);
      setBackupProgress(100);

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Backup created successfully');
          // Reload backups
          await loadBackups();
        } else {
          toast.error(data.error || 'Backup failed');
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Backup failed');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Failed to create backup');
    } finally {
      setIsBackingUp(false);
      setBackupProgress(0);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (!confirm(`Are you sure you want to delete backup "${backupId}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`/api/database/backup/delete?id=${backupId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Backup deleted successfully');
          // Reload backups
          await loadBackups();
        } else {
          toast.error(data.error || 'Delete failed');
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error deleting backup:', error);
      toast.error('Failed to delete backup');
    }
  };

  const handleDownloadBackup = async (backupId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch(`/api/database/backup/download?id=${backupId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = backupId;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Backup downloaded successfully');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Download failed');
      }
    } catch (error) {
      console.error('Error downloading backup:', error);
      toast.error('Failed to download backup');
    }
  };

  const handleToggleSchedulerJob = async (jobId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      const response = await fetch('/api/database/scheduler', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'toggle',
          jobId: jobId
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success(data.data.isActive ? 'Scheduler job enabled' : 'Scheduler job disabled');
          // Reload scheduler
          await loadScheduler();
        } else {
          toast.error(data.error || 'Failed to toggle scheduler job');
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to toggle scheduler job');
      }
    } catch (error) {
      console.error('Error toggling scheduler job:', error);
      toast.error('Failed to toggle scheduler job');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
      case 'disconnected':
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      case 'scheduled':
        return <Badge className="bg-yellow-100 text-yellow-800">Scheduled</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'disconnected':
      case 'failed':
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case 'scheduled':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const totalConnections = connections.length;
  const connectedConnections = connections.filter(c => c.status === 'connected').length;
  const totalBackupSize = backups.reduce((acc, backup) => {
    const size = parseFloat(backup.size.replace(/[^\d.]/g, ''));
    return acc + size;
  }, 0);

  if (loading) {
    return (
      <div className="space-y-6">
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
                <Database className="h-8 w-8 text-blue-600" />
                Database Management
              </h1>
              <p className="text-gray-500">Manage database connections and backups</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading database information...</span>
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
              <Database className="h-8 w-8 text-blue-600" />
              Database Management
            </h1>
            <p className="text-gray-500">Manage database connections and backups</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleStartBackup} 
            disabled={isBackingUp}
            className="flex items-center gap-2"
          >
            {isBackingUp ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isBackingUp ? 'Backing Up...' : 'Start Backup'}
          </Button>
        </div>
      </div>

      {/* Database Status */}
      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          Database Status: <Badge className="ml-2 bg-green-100 text-green-800">
            {connectedConnections}/{totalConnections} Connected
          </Badge>
          {autoBackup && (
            <Badge className="ml-2 bg-blue-100 text-blue-800">Auto Backup Enabled</Badge>
          )}
          <Badge className="ml-2 bg-gray-100 text-gray-800">
            Total Backup Size: {totalBackupSize.toFixed(1)} MB
          </Badge>
        </AlertDescription>
      </Alert>

      {/* Backup Progress */}
      {isBackingUp && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Creating backup...</span>
                <span className="text-sm text-gray-500">{backupProgress}%</span>
              </div>
              <Progress value={backupProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Database Connections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Connections
            </CardTitle>
            <CardDescription>
              Manage database connections and monitor status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Connection</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Checked</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {connections.map((connection) => (
                  <TableRow key={connection.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{connection.name}</div>
                        <div className="text-sm text-gray-500">
                          {connection.host}:{connection.port}/{connection.database}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(connection.status)}
                        {getStatusBadge(connection.status)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {connection.lastChecked}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTestConnection(connection.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Backup Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Backup Settings
            </CardTitle>
            <CardDescription>
              Configure automatic backup preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Automatic Backups</Label>
              <Switch
                checked={autoBackup}
                onCheckedChange={setAutoBackup}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label>Enable Compression</Label>
              <Switch
                checked={compression}
                onCheckedChange={setCompression}
              />
            </div>
            
            <div>
              <Label htmlFor="retention">Retention Period (Days)</Label>
              <Input
                id="retention"
                type="number"
                value={retentionDays}
                onChange={(e) => setRetentionDays(parseInt(e.target.value) || 30)}
                min="1"
                max="365"
              />
            </div>
            
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span>Storage Used:</span>
                <span className="font-medium">{totalBackupSize.toFixed(1)} MB</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span>Backups Count:</span>
                <span className="font-medium">{backups.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Backup Scheduler */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Backup Scheduler
            </CardTitle>
            <CardDescription>
              Manage automatic backup schedules
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {schedulerStatus && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {schedulerStatus.activeJobs}/{schedulerStatus.totalJobs}
                  </div>
                  <div className="text-sm text-gray-500">Active Jobs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {schedulerStatus.isActive ? 'ON' : 'OFF'}
                  </div>
                  <div className="text-sm text-gray-500">Scheduler Status</div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="font-medium">Scheduled Jobs</h4>
              {schedulerJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{job.name}</div>
                    <div className="text-sm text-gray-500">
                      Schedule: {job.schedule} 
                      {job.lastRun && (
                        <span className="ml-2">
                          • Last run: {new Date(job.lastRun).toLocaleString()}
                        </span>
                      )}
                      {job.nextRun && (
                        <span className="ml-2">
                          • Next run: {new Date(job.nextRun).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={job.status === 'active' ? 'default' : 'secondary'}>
                      {job.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleSchedulerJob(job.id)}
                    >
                      {job.isActive ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Backup History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Backup History
            </CardTitle>
            <CardDescription>
              View and manage backup jobs and history
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Backup Name</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Modified</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Database className="h-8 w-8 text-gray-400" />
                        <p className="text-gray-500">No backups found</p>
                        <p className="text-sm text-gray-400">Create your first backup to get started</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  backups.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell className="font-medium">{backup.name}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(backup.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {new Date(backup.modifiedAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm">{backup.size}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDownloadBackup(backup.id)}
                            title="Download backup"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteBackup(backup.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete backup"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
