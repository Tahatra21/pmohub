import React from 'react';
import { TimelineStatus, RiskLevel } from '@/types';
import { 
  CheckCircle, 
  AlertTriangle, 
  AlertCircle, 
  TrendingUp, 
  HelpCircle 
} from 'lucide-react';
import { getTimelineStatusColor, getTimelineStatusIcon, getTimelineStatusLabel } from '@/lib/timeline-utils';

interface TimelineStatusProps {
  status: TimelineStatus;
  riskLevel: RiskLevel;
  delayDays?: number;
  daysRemaining?: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showLabel?: boolean;
  className?: string;
}

export function TimelineStatusComponent({ 
  status, 
  riskLevel, 
  delayDays = 0, 
  daysRemaining = 0,
  size = 'md',
  showIcon = true,
  showLabel = true,
  className = ''
}: TimelineStatusProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'md':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1.5 text-sm';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-3 w-3';
      case 'md':
        return 'h-4 w-4';
      case 'lg':
        return 'h-5 w-5';
      default:
        return 'h-4 w-4';
    }
  };

  const colorClasses = getTimelineStatusColor(status, riskLevel);
  const iconName = getTimelineStatusIcon(status);
  const label = getTimelineStatusLabel(status, daysRemaining, delayDays);

  const IconComponent = () => {
    switch (iconName) {
      case 'CheckCircle':
        return <CheckCircle className={getIconSize()} />;
      case 'AlertTriangle':
        return <AlertTriangle className={getIconSize()} />;
      case 'AlertCircle':
        return <AlertCircle className={getIconSize()} />;
      case 'TrendingUp':
        return <TrendingUp className={getIconSize()} />;
      default:
        return <HelpCircle className={getIconSize()} />;
    }
  };

  return (
    <div className={`inline-flex items-center gap-1 rounded-full border font-medium ${getSizeClasses()} ${colorClasses} ${className}`}>
      {showIcon && IconComponent()}
      {showLabel && <span>{label}</span>}
    </div>
  );
}

// Timeline warning component for detailed messages
interface TimelineWarningProps {
  status: TimelineStatus;
  daysRemaining: number;
  delayDays: number;
  projectName: string;
  className?: string;
}

export function TimelineWarning({ 
  status, 
  daysRemaining, 
  delayDays, 
  projectName,
  className = ''
}: TimelineWarningProps) {
  if (status === TimelineStatus.ON_TIME || status === TimelineStatus.AHEAD) {
    return null;
  }

  const getWarningConfig = () => {
    switch (status) {
      case TimelineStatus.AT_RISK:
        return {
          icon: AlertTriangle,
          message: `${projectName} is at risk of delay (${daysRemaining} days remaining)`,
          className: 'text-yellow-600 bg-yellow-50 border-yellow-200'
        };
      default:
        return null;
    }
  };

  const config = getWarningConfig();
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg border ${config.className} ${className}`}>
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span className="text-sm font-medium">{config.message}</span>
    </div>
  );
}

// Timeline progress bar component
interface TimelineProgressProps {
  progress: number;
  daysRemaining: number;
  totalDays: number;
  status: TimelineStatus;
  className?: string;
}

export function TimelineProgress({ 
  progress, 
  daysRemaining, 
  totalDays, 
  status,
  className = ''
}: TimelineProgressProps) {
  const getProgressColor = () => {
    switch (status) {
      case TimelineStatus.ON_TIME:
        return 'bg-green-500';
      case TimelineStatus.AT_RISK:
        return 'bg-yellow-500';
      case TimelineStatus.DELAYED:
        return 'bg-red-500';
      case TimelineStatus.AHEAD:
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const timeProgress = Math.min(100, Math.max(0, ((totalDays - daysRemaining) / totalDays) * 100));

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm">
        <span>Progress</span>
        <span className="font-medium">{Math.round(progress)}%</span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      
      {/* Timeline info */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Time Progress: {Math.round(timeProgress)}%</span>
        <span>{daysRemaining > 0 ? `${daysRemaining} days left` : `${Math.abs(daysRemaining)} days overdue`}</span>
      </div>
    </div>
  );
}

export default TimelineStatusComponent;
