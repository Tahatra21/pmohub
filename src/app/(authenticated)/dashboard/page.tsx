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
  PieChart,
  Shield,
  Package,
  FileImage,
  Target,
  AlertTriangle,
  Monitor,
  ShoppingCart,
  Key,
  Database,
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { formatCurrencyAbbreviated, formatCurrencyFull } from '@/lib/currency-utils';

interface DashboardStats {
  // Core Project Management Metrics
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  totalBudget: number;
  actualSpent: number;
  taskCompletionRate: number;
  projectCompletionRate: number;
  budgetUtilization: number;
  
  // Project Management Team Insights
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  totalResources: number;
  
  // Additional Project Management Insights
  averageTasksPerProject: number;
  averageBudgetPerProject: number;
  resourceUtilization: number;
  
  // Project Status Distribution
  projectStatusDistribution: {
    planning: number;
    inProgress: number;
    completed: number;
  };
  
  // Task Status Distribution
  taskStatusDistribution: {
    completed: number;
    pending: number;
    overdue: number;
  };
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
      const token = localStorage.getItem('auth_token');
      
      console.log('Dashboard: Checking token:', !!token);
      
      if (!token) {
        console.log('Dashboard: No token found, showing error');
        setError('No authentication token found. Please login again.');
        return;
      }

      console.log('Dashboard: Token found, fetching data...');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="space-y-8 p-6">
        {/* Executive Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
              Executive Dashboard
            </h1>
            <p className="text-slate-600 mt-2 font-medium">Helicopter View - Strategic Project Management Overview</p>
            <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span>Live Data</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Real-time Updates</span>
              </div>
            </div>
          </div>
          <Button onClick={fetchDashboardData} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Activity className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        {/* Executive KPI Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Project Overview */}
          <Card className="border shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Project Overview</CardTitle>
                <div className="p-3 bg-gray-100 rounded-xl">
                  <FolderOpen className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-4xl font-bold text-gray-800">{stats.totalProjects}</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Active</span>
                    <span className="font-semibold text-gray-800">{stats.activeProjects}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-semibold text-gray-800">{stats.completedProjects}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Planning</span>
                    <span className="font-semibold text-gray-800">{stats.projectStatusDistribution.planning}</span>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Completion Rate</span>
                    <span className="text-xs font-semibold text-gray-700">{stats.projectCompletionRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={stats.projectCompletionRate} className="h-2 bg-gray-200" />
                </div>
                <div className="text-xs text-gray-500 pt-1">
                  <span className="font-medium">Status:</span> {stats.projectCompletionRate > 80 ? 'Excellent' : stats.projectCompletionRate > 60 ? 'Good' : 'Needs Attention'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Health Score */}
          <Card className="border shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Project Health Score</CardTitle>
                <div className="p-3 bg-gray-100 rounded-xl">
                  <Activity className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-4xl font-bold text-gray-800">
                  {Math.round((stats.projectCompletionRate + stats.taskCompletionRate + stats.resourceUtilization) / 3)}%
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Project Completion</span>
                    <span className="font-semibold text-gray-800">{stats.projectCompletionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Task Completion</span>
                    <span className="font-semibold text-gray-800">{stats.taskCompletionRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Resource Utilization</span>
                    <span className="font-semibold text-gray-800">{stats.resourceUtilization.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Overall Health</span>
                    <span className="text-xs font-semibold text-gray-700">
                      {Math.round((stats.projectCompletionRate + stats.taskCompletionRate + stats.resourceUtilization) / 3).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={(stats.projectCompletionRate + stats.taskCompletionRate + stats.resourceUtilization) / 3} className="h-2 bg-gray-200" />
                </div>
                <div className="text-xs text-gray-500 pt-1">
                  <span className="font-medium">Portfolio Status:</span> {
                    (stats.projectCompletionRate + stats.taskCompletionRate + stats.resourceUtilization) / 3 > 80 ? 'Excellent' : 
                    (stats.projectCompletionRate + stats.taskCompletionRate + stats.resourceUtilization) / 3 > 60 ? 'Good' : 'Needs Attention'
                  }
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Performance */}
          <Card className="border shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Financial Performance</CardTitle>
                <div className="p-3 bg-gray-100 rounded-xl">
                  <DollarSign className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-3xl font-bold text-gray-800">
                  {formatCurrencyAbbreviated(stats.totalBudget)}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Allocated</span>
                    <span className="font-semibold text-gray-800">{formatCurrencyAbbreviated(stats.totalBudget)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Spent</span>
                    <span className="font-semibold text-gray-800">{formatCurrencyAbbreviated(stats.actualSpent)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Remaining</span>
                    <span className="font-semibold text-gray-800">{formatCurrencyAbbreviated(stats.totalBudget - stats.actualSpent)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg per Project</span>
                    <span className="font-semibold text-gray-800">{formatCurrencyAbbreviated(stats.averageBudgetPerProject)}</span>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Budget Utilization</span>
                    <span className="text-xs font-semibold text-gray-700">{stats.budgetUtilization.toFixed(1)}%</span>
                  </div>
                  <Progress value={stats.budgetUtilization} className="h-2 bg-gray-200" />
                </div>
                <div className="text-xs text-gray-500 pt-1">
                  <span className="font-medium">Efficiency:</span> {stats.budgetUtilization < 80 ? 'Excellent' : stats.budgetUtilization < 95 ? 'Good' : 'Monitor'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Human Capital Excellence */}
          <Card className="border shadow-sm hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Human Capital Excellence</CardTitle>
                <div className="p-3 bg-gray-100 rounded-xl">
                  <Users className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-4xl font-bold text-gray-800">{stats.totalResources}</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Active Team</span>
                    <span className="font-semibold text-gray-800">{stats.activeUsers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Roles</span>
                    <span className="font-semibold text-gray-800">{stats.totalRoles}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Tasks/Project</span>
                    <span className="font-semibold text-gray-800">{stats.averageTasksPerProject.toFixed(1)}</span>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Resource Utilization</span>
                    <span className="text-xs font-semibold text-gray-700">{stats.resourceUtilization.toFixed(1)}%</span>
                  </div>
                  <Progress value={stats.resourceUtilization} className="h-2 bg-gray-200" />
                </div>
                <div className="text-xs text-gray-500 pt-1">
                  <span className="font-medium">Capacity:</span> {stats.resourceUtilization > 80 ? 'Optimal' : stats.resourceUtilization > 60 ? 'Good' : 'Underutilized'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Strategic Executive Insights */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Strategic Success Metrics */}
          <Card className="border shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="p-4 bg-gray-100 rounded-2xl w-fit mx-auto mb-4">
                <Target className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">
                {stats.totalProjects > 0 ? ((stats.completedProjects / stats.totalProjects) * 100).toFixed(0) : 0}%
              </h3>
              <p className="text-sm font-semibold text-gray-700 mb-1">Strategic Success Rate</p>
              <p className="text-xs text-gray-500">Portfolio delivery excellence</p>
            </CardContent>
          </Card>

          {/* Project Velocity */}
          <Card className="border shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="p-4 bg-gray-100 rounded-2xl w-fit mx-auto mb-4">
                <Calendar className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">
                {stats.averageTasksPerProject > 0 ? Math.round(45 * stats.averageTasksPerProject) : 45}
              </h3>
              <p className="text-sm font-semibold text-gray-700 mb-1">Project Velocity</p>
              <p className="text-xs text-gray-500">Days per strategic initiative</p>
            </CardContent>
          </Card>

          {/* Resource Optimization */}
          <Card className="border shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="p-4 bg-gray-100 rounded-2xl w-fit mx-auto mb-4">
                <Zap className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">
                {stats.resourceUtilization.toFixed(0)}%
              </h3>
              <p className="text-sm font-semibold text-gray-700 mb-1">Resource Optimization</p>
              <p className="text-xs text-gray-500">Team capacity utilization</p>
            </CardContent>
          </Card>

          {/* Financial Excellence */}
          <Card className="border shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="p-4 bg-gray-100 rounded-2xl w-fit mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">
                {stats.totalBudget > 0 ? ((stats.totalBudget - stats.actualSpent) / stats.totalBudget * 100).toFixed(0) : 0}%
              </h3>
              <p className="text-sm font-semibold text-gray-700 mb-1">Financial Excellence</p>
              <p className="text-xs text-gray-500">Under budget performance</p>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">Savings: {formatCurrencyAbbreviated(stats.totalBudget - stats.actualSpent)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Executive Analytics */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slate-50/90 backdrop-blur-sm border-slate-200/50 shadow-sm">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-slate-700 data-[state=active]:text-white">
              📊 Strategic Overview
            </TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-slate-700 data-[state=active]:text-white">
              📁 Portfolio Analysis
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-slate-700 data-[state=active]:text-white">
              ✅ Operational Excellence
            </TabsTrigger>
            <TabsTrigger value="budget" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-slate-700 data-[state=active]:text-white">
              💰 Financial Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Project Progress Chart */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-800">Project Progress Overview</CardTitle>
                  <CardDescription className="text-gray-600">Real-time progress tracking of active projects</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={projectProgressData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 12 }}
                        stroke="#6b7280"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        stroke="#6b7280"
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Bar 
                        dataKey="progress" 
                        fill="url(#progressGradient)"
                        radius={[4, 4, 0, 0]}
                      />
                      <defs>
                        <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#1d4ed8" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Project Status Distribution */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-800">Project Status Distribution</CardTitle>
                  <CardDescription className="text-gray-600">Breakdown of projects by current status</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <RechartsPieChart>
                      <Pie
                        data={projectStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        innerRadius={40}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {projectStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800">Project Portfolio</CardTitle>
                <CardDescription className="text-gray-600">Detailed view of all projects and their current status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div key={project.id} className="group p-6 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                              {project.name}
                            </h3>
                            <Badge className={`${getStatusColor(project.status)} px-3 py-1 rounded-full text-xs font-medium`}>
                              {project.status.replace('_', ' ')}
                            </Badge>
                            <Badge className={`${getPriorityColor(project.priority)} px-3 py-1 rounded-full text-xs font-medium`}>
                              {project.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <span>Created by {project.creator.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              <span>{project._count.tasks} tasks</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">Progress</span>
                              <span className="font-semibold text-blue-600">{project.progress}%</span>
                            </div>
                            <Progress value={project.progress} className="h-3" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800">Task Management</CardTitle>
                <CardDescription className="text-gray-600">Current task assignments and progress tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTasks.map((task) => (
                    <div key={task.id} className="group p-6 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-green-600 transition-colors">
                              {task.title}
                            </h3>
                            <Badge className={`${getTaskStatusColor(task.status)} px-3 py-1 rounded-full text-xs font-medium`}>
                              {task.status.replace('_', ' ')}
                            </Badge>
                            <Badge className={`${getPriorityColor(task.priority)} px-3 py-1 rounded-full text-xs font-medium`}>
                              {task.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-2">
                              <FolderOpen className="h-4 w-4" />
                              <span>Project: {task.project.name}</span>
                            </div>
                            {task.assignee && (
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                <span>Assigned to {task.assignee.name}</span>
                              </div>
                            )}
                            {task.endDate && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>Due: {new Date(task.endDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budget" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-800">Budget Analytics</CardTitle>
                <CardDescription className="text-gray-600">Financial overview and cost analysis by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={budgetData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      stroke="#6b7280"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value, name) => [formatCurrencyAbbreviated(Number(value)), name]}
                    />
                    <Bar 
                      dataKey="estimated" 
                      stackId="a" 
                      fill="url(#estimatedGradient)" 
                      name="Estimated"
                      radius={[0, 0, 4, 4]}
                    />
                    <Bar 
                      dataKey="actual" 
                      stackId="a" 
                      fill="url(#actualGradient)" 
                      name="Actual"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="estimatedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#7c3aed" />
                      </linearGradient>
                      <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
