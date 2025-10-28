import { TimelineStatus, RiskLevel, ProjectStatus, TaskStatus } from '@/types';

export interface TimelineCalculationResult {
  timelineStatus: TimelineStatus;
  riskLevel: RiskLevel;
  delayDays: number;
  daysRemaining: number;
  progressPercentage: number;
  isOverdue: boolean;
  isAtRisk: boolean;
  isAhead: boolean;
}

/**
 * Calculate timeline status for projects and tasks
 * @param startDate - Project/Task start date
 * @param endDate - Project/Task end date
 * @param currentStatus - Current status (PLANNING, IN_PROGRESS, etc.)
 * @param warningThreshold - Days before end date to show warning (default: 7 for projects, 3 for tasks)
 * @param currentProgress - Current progress percentage (optional, for more accurate calculation)
 * @returns Timeline calculation result
 */
export function calculateTimelineStatus(
  startDate: Date | null,
  endDate: Date | null,
  currentStatus: ProjectStatus | TaskStatus,
  warningThreshold: number = 7,
  currentProgress?: number
): TimelineCalculationResult {
  const now = new Date();
  
  // Handle missing dates
  if (!startDate || !endDate) {
    return {
      timelineStatus: TimelineStatus.ON_TIME,
      riskLevel: RiskLevel.LOW,
      delayDays: 0,
      daysRemaining: 0,
      progressPercentage: 0,
      isOverdue: false,
      isAtRisk: false,
      isAhead: false
    };
  }
  
  // Calculate timeline metrics
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate progress percentage
  let progressPercentage = 0;
  if (currentProgress !== undefined) {
    progressPercentage = Math.min(100, Math.max(0, currentProgress));
  } else {
    // Estimate progress based on time elapsed
    progressPercentage = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100));
  }
  
  // Determine timeline status
  let timelineStatus: TimelineStatus;
  let riskLevel: RiskLevel;
  let delayDays = 0;
  let isOverdue = false;
  let isAtRisk = false;
  let isAhead = false;
  
  // Handle completed status
  if (currentStatus === 'COMPLETED') {
    timelineStatus = TimelineStatus.ON_TIME;
    riskLevel = RiskLevel.LOW;
  }
  // Handle cancelled status
  else if (currentStatus === 'CANCELLED') {
    timelineStatus = TimelineStatus.ON_TIME;
    riskLevel = RiskLevel.LOW;
  }
  // Handle overdue projects/tasks
  else if (daysRemaining < 0) {
    timelineStatus = TimelineStatus.DELAYED;
    delayDays = Math.abs(daysRemaining);
    isOverdue = true;
    
    // Determine risk level based on delay severity
    if (delayDays > 30) {
      riskLevel = RiskLevel.CRITICAL;
    } else if (delayDays > 14) {
      riskLevel = RiskLevel.HIGH;
    } else {
      riskLevel = RiskLevel.MEDIUM;
    }
  }
  // Handle at-risk projects/tasks
  else if (daysRemaining <= warningThreshold) {
    timelineStatus = TimelineStatus.AT_RISK;
    isAtRisk = true;
    
    // Determine risk level based on remaining days
    if (daysRemaining <= 1) {
      riskLevel = RiskLevel.CRITICAL;
    } else if (daysRemaining <= 3) {
      riskLevel = RiskLevel.HIGH;
    } else {
      riskLevel = RiskLevel.MEDIUM;
    }
  }
  // Handle ahead of schedule
  else if (progressPercentage > 80 && daysRemaining > totalDays * 0.2) {
    timelineStatus = TimelineStatus.AHEAD;
    riskLevel = RiskLevel.LOW;
    isAhead = true;
  }
  // Default: on time
  else {
    timelineStatus = TimelineStatus.ON_TIME;
    riskLevel = RiskLevel.LOW;
  }
  
  return {
    timelineStatus,
    riskLevel,
    delayDays,
    daysRemaining,
    progressPercentage,
    isOverdue,
    isAtRisk,
    isAhead
  };
}

/**
 * Get timeline status color for UI
 * @param timelineStatus - Timeline status
 * @param riskLevel - Risk level
 * @returns CSS classes for styling
 */
export function getTimelineStatusColor(timelineStatus: TimelineStatus, riskLevel: RiskLevel): string {
  switch (timelineStatus) {
    case TimelineStatus.ON_TIME:
      return 'text-green-600 bg-green-100 border-green-200';
    case TimelineStatus.AT_RISK:
      switch (riskLevel) {
        case RiskLevel.CRITICAL:
          return 'text-red-600 bg-red-100 border-red-200';
        case RiskLevel.HIGH:
          return 'text-orange-600 bg-orange-100 border-orange-200';
        case RiskLevel.MEDIUM:
          return 'text-yellow-600 bg-yellow-100 border-yellow-200';
        default:
          return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      }
    case TimelineStatus.DELAYED:
      switch (riskLevel) {
        case RiskLevel.CRITICAL:
          return 'text-red-800 bg-red-200 border-red-300';
        case RiskLevel.HIGH:
          return 'text-red-700 bg-red-100 border-red-200';
        case RiskLevel.MEDIUM:
          return 'text-red-600 bg-red-50 border-red-100';
        default:
          return 'text-red-600 bg-red-50 border-red-100';
      }
    case TimelineStatus.AHEAD:
      return 'text-blue-600 bg-blue-100 border-blue-200';
    default:
      return 'text-gray-600 bg-gray-100 border-gray-200';
  }
}

/**
 * Get timeline status icon
 * @param timelineStatus - Timeline status
 * @returns Icon name for UI
 */
export function getTimelineStatusIcon(timelineStatus: TimelineStatus): string {
  switch (timelineStatus) {
    case TimelineStatus.ON_TIME:
      return 'CheckCircle';
    case TimelineStatus.AT_RISK:
      return 'AlertTriangle';
    case TimelineStatus.DELAYED:
      return 'AlertCircle';
    case TimelineStatus.AHEAD:
      return 'TrendingUp';
    default:
      return 'HelpCircle';
  }
}

/**
 * Get timeline status label
 * @param timelineStatus - Timeline status
 * @param daysRemaining - Days remaining
 * @param delayDays - Days delayed
 * @returns Human-readable label
 */
export function getTimelineStatusLabel(
  timelineStatus: TimelineStatus,
  daysRemaining: number,
  delayDays: number
): string {
  switch (timelineStatus) {
    case TimelineStatus.ON_TIME:
      return 'On Time';
    case TimelineStatus.AT_RISK:
      return `${daysRemaining} days left`;
    case TimelineStatus.DELAYED:
      return `${delayDays} days delayed`;
    case TimelineStatus.AHEAD:
      return 'Ahead of Schedule';
    default:
      return 'Unknown';
  }
}

/**
 * Check if timeline status requires immediate attention
 * @param timelineStatus - Timeline status
 * @param riskLevel - Risk level
 * @returns True if requires immediate attention
 */
export function requiresImmediateAttention(timelineStatus: TimelineStatus, riskLevel: RiskLevel): boolean {
  return (
    timelineStatus === TimelineStatus.DELAYED ||
    (timelineStatus === TimelineStatus.AT_RISK && riskLevel === RiskLevel.CRITICAL)
  );
}

/**
 * Get timeline warning message
 * @param timelineStatus - Timeline status
 * @param daysRemaining - Days remaining
 * @param delayDays - Days delayed
 * @param projectName - Project/Task name
 * @returns Warning message
 */
export function getTimelineWarningMessage(
  timelineStatus: TimelineStatus,
  daysRemaining: number,
  delayDays: number,
  projectName: string
): string {
  switch (timelineStatus) {
    case TimelineStatus.AT_RISK:
      return `${projectName} is at risk of delay (${daysRemaining} days remaining)`;
    case TimelineStatus.DELAYED:
      return `${projectName} is delayed by ${delayDays} days`;
    case TimelineStatus.AHEAD:
      return `${projectName} is ahead of schedule`;
    default:
      return '';
  }
}
