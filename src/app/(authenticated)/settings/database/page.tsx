'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
}

interface BackupJob {
  id: string;
  name: string;
  schedule: string;
  lastRun: string;
  status: 'success' | 'failed' | 'running' | 'scheduled';
  size: string;
  nextRun: string;
}

// Real data based on actual PMO database
const mockConnections: DatabaseConnection[] = [
  {
    id: '1',
    name: 'PMO Database (pmo_db)',
    host: 'localhost',
    port: 5432,
    database: 'pmo_db',
    status: 'connected',
    lastChecked: new Date().toLocaleString()
  }
];

const mockBackups: BackupJob[] = [
  {
    id: '1',
    name: 'Daily Full Backup - pmo_db',
    schedule: 'Daily at 02:00',
    lastRun: '2024-01-15 02:00:00',
    status: 'success',
    size: '8.4 MB', // Actual database size: 8627 kB ≈ 8.4 MB
    nextRun: '2024-01-16 02:00:00'
  },
  {
    id: '2',
    name: 'Weekly Archive - pmo_db',
    schedule: 'Weekly on Sunday',
    lastRun: '2024-01-14 03:00:00',
    status: 'success',
    size: '8.4 MB', // Same as daily since it's the same database
    nextRun: '2024-01-21 03:00:00'
  },
  {
    id: '3',
    name: 'Incremental Backup - pmo_db',
    schedule: 'Every 6 hours',
    lastRun: '2024-01-15 12:00:00',
    status: 'running',
    size: '2.1 MB', // Estimated incremental size
    nextRun: '2024-01-15 18:00:00'
  }
];

export default function DatabasePage() {
  const router = useRouter();
  const [connections, setConnections] = useState<DatabaseConnection[]>(mockConnections);
  const [backups, setBackups] = useState<BackupJob[]>(mockBackups);
  const [autoBackup, setAutoBackup] = useState(true);
  const [compression, setCompression] = useState(true);
  const [retentionDays, setRetentionDays] = useState(30);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);

  const handleTestConnection = async (connectionId: string) => {
    // Simulate connection test
    setConnections(prev => prev.map(conn => 
      conn.id === connectionId 
        ? { ...conn, status: 'connected', lastChecked: new Date().toLocaleString() }
        : conn
    ));
  };

  const handleStartBackup = async () => {
    setIsBackingUp(true);
    setBackupProgress(0);
    
    // Simulate backup process
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBackingUp(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDeleteBackup = (backupId: string) => {
    setBackups(prev => prev.filter(backup => backup.id !== backupId));
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
                  <TableHead>Schedule</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Next Run</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backups.map((backup) => (
                  <TableRow key={backup.id}>
                    <TableCell className="font-medium">{backup.name}</TableCell>
                    <TableCell className="text-sm text-gray-500">{backup.schedule}</TableCell>
                    <TableCell className="text-sm text-gray-500">{backup.lastRun}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(backup.status)}
                        {getStatusBadge(backup.status)}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{backup.size}</TableCell>
                    <TableCell className="text-sm text-gray-500">{backup.nextRun}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteBackup(backup.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
