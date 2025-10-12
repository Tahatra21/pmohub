// Notification system for real-time updates

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  userId?: string;
  entityType?: string;
  entityId?: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  browserNotifications: boolean;
  projectUpdates: boolean;
  taskAssignments: boolean;
  riskAlerts: boolean;
  budgetApprovals: boolean;
  documentUploads: boolean;
}

// In-memory notification storage (in production, use Redis or database)
class NotificationStore {
  private notifications: Map<string, Notification[]> = new Map();

  addNotification(userId: string, notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const userNotifications = this.notifications.get(userId) || [];
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };
    
    userNotifications.unshift(newNotification);
    // Keep only last 100 notifications per user
    if (userNotifications.length > 100) {
      userNotifications.splice(100);
    }
    
    this.notifications.set(userId, userNotifications);
    return newNotification;
  }

  getNotifications(userId: string, limit = 50): Notification[] {
    const userNotifications = this.notifications.get(userId) || [];
    return userNotifications.slice(0, limit);
  }

  markAsRead(userId: string, notificationId: string) {
    const userNotifications = this.notifications.get(userId) || [];
    const notification = userNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  markAllAsRead(userId: string) {
    const userNotifications = this.notifications.get(userId) || [];
    userNotifications.forEach(n => n.read = true);
  }

  getUnreadCount(userId: string): number {
    const userNotifications = this.notifications.get(userId) || [];
    return userNotifications.filter(n => !n.read).length;
  }

  deleteNotification(userId: string, notificationId: string) {
    const userNotifications = this.notifications.get(userId) || [];
    const index = userNotifications.findIndex(n => n.id === notificationId);
    if (index > -1) {
      userNotifications.splice(index, 1);
    }
  }

  clearAllNotifications(userId: string) {
    this.notifications.set(userId, []);
  }
}

const notificationStore = new NotificationStore();

// Notification creation helpers
export const createNotification = {
  projectCreated: (userId: string, projectName: string, projectId: string) => {
    return notificationStore.addNotification(userId, {
      type: 'info',
      title: 'New Project Created',
      message: `Project "${projectName}" has been created`,
      actionUrl: `/projects/${projectId}`,
      actionText: 'View Project',
      entityType: 'Project',
      entityId: projectId,
    });
  },

  projectUpdated: (userId: string, projectName: string, projectId: string) => {
    return notificationStore.addNotification(userId, {
      type: 'info',
      title: 'Project Updated',
      message: `Project "${projectName}" has been updated`,
      actionUrl: `/projects/${projectId}`,
      actionText: 'View Project',
      entityType: 'Project',
      entityId: projectId,
    });
  },

  taskAssigned: (userId: string, taskTitle: string, taskId: string) => {
    return notificationStore.addNotification(userId, {
      type: 'success',
      title: 'New Task Assignment',
      message: `You have been assigned to task: "${taskTitle}"`,
      actionUrl: `/tasks/${taskId}`,
      actionText: 'View Task',
      entityType: 'Task',
      entityId: taskId,
    });
  },

  taskCompleted: (userId: string, taskTitle: string, taskId: string) => {
    return notificationStore.addNotification(userId, {
      type: 'success',
      title: 'Task Completed',
      message: `Task "${taskTitle}" has been completed`,
      actionUrl: `/tasks/${taskId}`,
      actionText: 'View Task',
      entityType: 'Task',
      entityId: taskId,
    });
  },

  riskIdentified: (userId: string, riskTitle: string, riskId: string, severity: string) => {
    const type = severity === 'CRITICAL' || severity === 'HIGH' ? 'error' : 'warning';
    return notificationStore.addNotification(userId, {
      type,
      title: 'New Risk Identified',
      message: `${severity} risk identified: "${riskTitle}"`,
      actionUrl: `/risks/${riskId}`,
      actionText: 'View Risk',
      entityType: 'Risk',
      entityId: riskId,
    });
  },

  budgetApprovalNeeded: (userId: string, projectName: string, budgetId: string) => {
    return notificationStore.addNotification(userId, {
      type: 'warning',
      title: 'Budget Approval Required',
      message: `Budget approval needed for project "${projectName}"`,
      actionUrl: `/budget/${budgetId}`,
      actionText: 'Review Budget',
      entityType: 'Budget',
      entityId: budgetId,
    });
  },

  budgetApproved: (userId: string, projectName: string, budgetId: string) => {
    return notificationStore.addNotification(userId, {
      type: 'success',
      title: 'Budget Approved',
      message: `Budget for project "${projectName}" has been approved`,
      actionUrl: `/budget/${budgetId}`,
      actionText: 'View Budget',
      entityType: 'Budget',
      entityId: budgetId,
    });
  },

  documentUploaded: (userId: string, documentTitle: string, documentId: string) => {
    return notificationStore.addNotification(userId, {
      type: 'info',
      title: 'New Document Uploaded',
      message: `Document "${documentTitle}" has been uploaded`,
      actionUrl: `/documents/${documentId}`,
      actionText: 'View Document',
      entityType: 'Document',
      entityId: documentId,
    });
  },

  userAdded: (userId: string, userName: string, projectName: string) => {
    return notificationStore.addNotification(userId, {
      type: 'info',
      title: 'Added to Project',
      message: `You have been added to project "${projectName}" by ${userName}`,
      actionUrl: '/projects',
      actionText: 'View Projects',
    });
  },

  deadlineApproaching: (userId: string, itemTitle: string, itemType: string, itemId: string) => {
    return notificationStore.addNotification(userId, {
      type: 'warning',
      title: 'Deadline Approaching',
      message: `${itemType} "${itemTitle}" deadline is approaching`,
      actionUrl: `/${itemType.toLowerCase()}s/${itemId}`,
      actionText: `View ${itemType}`,
      entityType: itemType,
      entityId: itemId,
    });
  },

  deadlineOverdue: (userId: string, itemTitle: string, itemType: string, itemId: string) => {
    return notificationStore.addNotification(userId, {
      type: 'error',
      title: 'Deadline Overdue',
      message: `${itemType} "${itemTitle}" is overdue`,
      actionUrl: `/${itemType.toLowerCase()}s/${itemId}`,
      actionText: `View ${itemType}`,
      entityType: itemType,
      entityId: itemId,
    });
  },
};

// Public API
export const notificationService = {
  add: notificationStore.addNotification.bind(notificationStore),
  get: notificationStore.getNotifications.bind(notificationStore),
  markAsRead: notificationStore.markAsRead.bind(notificationStore),
  markAllAsRead: notificationStore.markAllAsRead.bind(notificationStore),
  getUnreadCount: notificationStore.getUnreadCount.bind(notificationStore),
  delete: notificationStore.deleteNotification.bind(notificationStore),
  clearAll: notificationStore.clearAllNotifications.bind(notificationStore),
  create: createNotification,
};

// Helper function to send notifications to project members
export const notifyProjectMembers = async (
  projectId: string, 
  notification: Omit<Notification, 'id' | 'timestamp' | 'read'>,
  excludeUserId?: string
) => {
  // In a real implementation, you would fetch project members from the database
  // For now, this is a placeholder
  console.log(`Notifying project members for project ${projectId}:`, notification);
};

// Helper function to send notifications to task assignees
export const notifyTaskAssignees = async (
  taskId: string,
  notification: Omit<Notification, 'id' | 'timestamp' | 'read'>,
  excludeUserId?: string
) => {
  // In a real implementation, you would fetch task assignees from the database
  console.log(`Notifying task assignees for task ${taskId}:`, notification);
};
