'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  FileText, 
  FolderOpen, 
  TrendingUp,
  Users,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalBudget: number;
  actualSpent: number;
  overdueTasks: number;
  taskCompletionRate: number;
  projectCompletionRate: number;
  budgetUtilization: number;
}

interface Project {
  id: string;
  name: string;
  status: string;
  progress: number;
  priority: string;
  startDate: string;
  endDate: string;
  creator: {
    name: string;
  };
  _count: {
    tasks: number;
  };
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  endDate: string;
  project: {
    name: string;
  };
  assignee: {
    name: string;
  } | null;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No authentication token found. Please login again.');
        return;
      }

      const response = await fetch('/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setStats(data.data.stats);
          setRecentProjects(data.data.recentProjects || []);
          setRecentTasks(data.data.recentTasks || []);
        } else {
          setError('Invalid response format from server.');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || `Server error: ${response.status}`);
      }
    } catch (error) {
      setError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'PLANNING': return 'bg-yellow-100 text-yellow-800';
      case 'ON_HOLD': return 'bg-orange-100 text-orange-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'REVIEW': return 'bg-purple-100 text-purple-800';
      case 'TODO': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-red-600 font-medium">Unable to load dashboard data</p>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
          <Button onClick={fetchDashboardData} variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <div className="space-y-4">
          <p className="text-gray-500">Loading dashboard data...</p>
          <Button onClick={fetchDashboardData} variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  // Sample data for charts (in real app, this would come from API)
  const projectProgressData = recentProjects.map(project => ({
    name: project.name.substring(0, 15) + '...',
    progress: project.progress,
    tasks: project._count.tasks,
  }));

  const budgetData = [
    { name: 'Materials', estimated: stats.totalBudget * 0.4, actual: stats.actualSpent * 0.4 },
    { name: 'Labor', estimated: stats.totalBudget * 0.5, actual: stats.actualSpent * 0.5 },
    { name: 'Equipment', estimated: stats.totalBudget * 0.1, actual: stats.actualSpent * 0.1 },
  ];

  const projectStatusData = [
    { name: 'Active', value: stats.activeProjects, color: '#0088FE' },
    { name: 'Completed', value: stats.completedProjects, color: '#00C49F' },
    { name: 'Planning', value: stats.totalProjects - stats.activeProjects - stats.completedProjects, color: '#FFBB28' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-gray-500">Welcome back! Here's what's happening with your projects.</p>
        </div>
        <Button onClick={fetchDashboardData}>
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Highlight Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Projects Card */}
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Projects</CardTitle>
            <div className="p-2 bg-blue-100 rounded-full">
              <FolderOpen className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.totalProjects}</div>
            <div className="flex items-center mt-2">
              <Progress value={stats.projectCompletionRate} className="flex-1 mr-2 h-2" />
              <span className="text-sm font-medium text-green-600">+{stats.projectCompletionRate.toFixed(1)}%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.activeProjects} active, {stats.completedProjects} completed
            </p>
          </CardContent>
        </Card>

        {/* Active Tasks Card */}
        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Tasks</CardTitle>
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.totalTasks}</div>
            <div className="flex items-center mt-2">
              <Progress value={stats.taskCompletionRate} className="flex-1 mr-2 h-2" />
              <span className="text-sm font-medium text-green-600">+{stats.taskCompletionRate.toFixed(1)}%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.completedTasks} completed, {stats.overdueTasks} overdue
            </p>
          </CardContent>
        </Card>

        {/* Total Budget Card */}
        <Card className="border-l-2 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Budget</CardTitle>
            <div className="p-2 bg-purple-100 rounded-full">
              <DollarSign className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-2xl font-bold text-purple-600 break-words">
              Rp {stats?.totalBudget?.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}
            </div>
            <div className="flex items-center gap-2">
              <Progress value={stats?.budgetUtilization || 0} className="flex-1 h-2" />
              <span className="text-sm font-medium text-orange-600 whitespace-nowrap">{(stats?.budgetUtilization || 0).toFixed(1)}%</span>
            </div>
            <p className="text-xs text-gray-500 break-words">
              Rp {stats?.actualSpent?.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'} spent
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Team Performance Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Performance</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {((stats.taskCompletionRate + stats.projectCompletionRate) / 2).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Average completion rate</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overdue Items Card */}
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue Items</p>
                <p className="text-2xl font-bold text-orange-600">{stats.overdueTasks}</p>
                <p className="text-xs text-gray-500 mt-1">Tasks past due date</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Efficiency Card */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Budget Efficiency</p>
                <p className="text-2xl font-bold text-green-600">
                  {((stats.totalBudget - stats.actualSpent) / stats.totalBudget * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Under budget</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Project Success Rate */}
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-0">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-emerald-100 rounded-full w-fit mx-auto mb-3">
              <PieChart className="h-6 w-6 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-emerald-600 mb-1">
              {((stats.completedProjects / stats.totalProjects) * 100).toFixed(0)}%
            </h3>
            <p className="text-sm font-medium text-gray-600 mb-1">Success Rate</p>
            <p className="text-xs text-gray-500">Projects completed on time</p>
          </CardContent>
        </Card>

        {/* Average Project Duration */}
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-0">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-blue-600 mb-1">45</h3>
            <p className="text-sm font-medium text-gray-600 mb-1">Avg Duration</p>
            <p className="text-xs text-gray-500">Days per project</p>
          </CardContent>
        </Card>

        {/* Resource Utilization */}
        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-0">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-3">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-purple-600 mb-1">87%</h3>
            <p className="text-sm font-medium text-gray-600 mb-1">Resources Used</p>
            <p className="text-xs text-gray-500">Team capacity utilization</p>
          </CardContent>
        </Card>

        {/* Client Satisfaction */}
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-0">
          <CardContent className="p-6 text-center">
            <div className="p-3 bg-orange-100 rounded-full w-fit mx-auto mb-3">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-2xl font-bold text-orange-600 mb-1">4.8</h3>
            <p className="text-sm font-medium text-gray-600 mb-1">Satisfaction</p>
            <p className="text-xs text-gray-500">Average client rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Project Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Project Progress</CardTitle>
                <CardDescription>Progress overview of recent projects</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={projectProgressData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="progress" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Project Status Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Project Status Distribution</CardTitle>
                <CardDescription>Breakdown by project status</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {projectStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>Latest project updates and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{project.name}</h3>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(project.priority)}>
                          {project.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Created by {project.creator.name}</span>
                        <span>•</span>
                        <span>{project._count.tasks} tasks</span>
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <Progress value={project.progress} className="flex-1" />
                          <span className="text-sm font-medium">{project.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Tasks</CardTitle>
              <CardDescription>Latest task assignments and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{task.title}</h3>
                        <Badge className={getTaskStatusColor(task.status)}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Project: {task.project.name}</span>
                        {task.assignee && (
                          <>
                            <span>•</span>
                            <span>Assigned to {task.assignee.name}</span>
                          </>
                        )}
                        {task.endDate && (
                          <>
                            <span>•</span>
                            <span>Due: {new Date(task.endDate).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget Overview</CardTitle>
              <CardDescription>Estimated vs actual costs by category</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="estimated" stackId="a" fill="#8884d8" name="Estimated" />
                  <Bar dataKey="actual" stackId="a" fill="#82ca9d" name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
