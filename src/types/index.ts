export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  roleId: string;
  role?: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  type: ProjectType;
  client: string;
  location?: string;
  status: ProjectStatus;
  priority: Priority;
  progress: number;
  startDate?: Date;
  endDate?: Date;
  createdBy: string;
  creator?: User;
  members?: ProjectMember[];
  tasks?: Task[];
  milestones?: Milestone[];
  resources?: Resource[];
  budgets?: Budget[];
  documents?: Document[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  user?: User;
  role: string;
  joinedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  project?: Project;
  assigneeId?: string;
  assignee?: User;
  creatorId: string;
  creator?: User;
  status: TaskStatus;
  priority: Priority;
  progress: number;
  startDate?: Date;
  endDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  dependencies?: TaskDependency[];
  dependents?: TaskDependency[];
  documents?: Document[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskDependency {
  id: string;
  taskId: string;
  task?: Task;
  dependsOnTaskId: string;
  dependsOn?: Task;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  project?: Project;
  status: MilestoneStatus;
  dueDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  description?: string;
  quantity?: number;
  unit?: string;
  costPerUnit?: number;
  projectId: string;
  project?: Project;
  allocations?: ResourceAllocation[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ResourceAllocation {
  id: string;
  resourceId: string;
  resource?: Resource;
  projectId: string;
  project?: Project;
  userId?: string;
  user?: User;
  quantity: number;
  allocatedAt: Date;
}

export interface Budget {
  id: string;
  costCenter: string;
  manager: string;
  prkNumber: string;
  prkName: string;
  kategoriBeban: string;
  coaNumber: string;
  anggaranTersedia: number;
  nilaiPo: number;
  nilaiNonPo: number;
  totalSpr: number;
  totalPenyerapan: number;
  sisaAnggaran: number;
  tahun: number;
  projectId?: string;
  taskId?: string;
  budgetType: 'PROJECT' | 'TASK' | 'GENERAL';
  project?: Project;
  task?: {
    id: string;
    title: string;
    status: string;
  };
  createdAt: Date;
  updatedAt: Date;
}


export interface Document {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  projectId?: string;
  project?: Project;
  taskId?: string;
  task?: Task;
  uploadedBy: string;
  uploader?: User;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ActivityLog {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  description?: string;
  userId: string;
  user?: User;
  project?: Project;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export enum ProjectType {
  ELECTRICAL = 'ELECTRICAL',
  IT = 'IT',
  CONSTRUCTION = 'CONSTRUCTION',
  MAINTENANCE = 'MAINTENANCE',
  CONSULTING = 'CONSULTING'
}

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum MilestoneStatus {
  UPCOMING = 'UPCOMING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum ResourceType {
  MANPOWER = 'MANPOWER',
  EQUIPMENT = 'EQUIPMENT',
  MATERIAL = 'MATERIAL',
  TOOL = 'TOOL',
  SOFTWARE = 'SOFTWARE',
  OTHER = 'OTHER'
}


export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  totalBudget: number;
  actualSpent: number;
  overdueTasks: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  status?: string;
  priority?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  permissions: Record<string, any>;
}