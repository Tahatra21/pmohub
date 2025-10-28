import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

interface FrontendAuditData {
  action: string;
  page: string;
  component?: string;
  userId: string;
  metadata?: Record<string, any>;
}

/**
 * Hook untuk logging aktivitas frontend
 */
export function useFrontendAudit() {
  const router = useRouter();

  // Log page view
  const logPageView = useCallback(async (page: string, userId: string) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          action: 'Page View',
          entity: 'Frontend',
          description: `Viewed page: ${page}`,
          metadata: {
            page,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
          },
        }),
      });
    } catch (error) {
      console.error('Failed to log page view:', error);
    }
  }, []);

  // Log button click
  const logButtonClick = useCallback(async (
    page: string, 
    button: string, 
    userId: string, 
    metadata?: Record<string, any>
  ) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          action: 'Button Click',
          entity: 'Frontend',
          description: `Clicked button: ${button} on ${page}`,
          metadata: {
            page,
            component: button,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            ...metadata,
          },
        }),
      });
    } catch (error) {
      console.error('Failed to log button click:', error);
    }
  }, []);

  // Log form submit
  const logFormSubmit = useCallback(async (
    page: string, 
    form: string, 
    userId: string, 
    metadata?: Record<string, any>
  ) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          action: 'Form Submit',
          entity: 'Frontend',
          description: `Submitted form: ${form} on ${page}`,
          metadata: {
            page,
            component: form,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            ...metadata,
          },
        }),
      });
    } catch (error) {
      console.error('Failed to log form submit:', error);
    }
  }, []);

  // Log file upload
  const logFileUpload = useCallback(async (
    page: string, 
    fileName: string, 
    userId: string, 
    metadata?: Record<string, any>
  ) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          action: 'File Upload',
          entity: 'Frontend',
          description: `Uploaded file: ${fileName} on ${page}`,
          metadata: {
            page,
            component: fileName,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            ...metadata,
          },
        }),
      });
    } catch (error) {
      console.error('Failed to log file upload:', error);
    }
  }, []);

  // Log file download
  const logFileDownload = useCallback(async (
    page: string, 
    fileName: string, 
    userId: string, 
    metadata?: Record<string, any>
  ) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          action: 'File Download',
          entity: 'Frontend',
          description: `Downloaded file: ${fileName} on ${page}`,
          metadata: {
            page,
            component: fileName,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            ...metadata,
          },
        }),
      });
    } catch (error) {
      console.error('Failed to log file download:', error);
    }
  }, []);

  // Log search
  const logSearch = useCallback(async (
    page: string, 
    searchTerm: string, 
    userId: string, 
    metadata?: Record<string, any>
  ) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          action: 'Search',
          entity: 'Frontend',
          description: `Searched for: "${searchTerm}" on ${page}`,
          metadata: {
            page,
            searchTerm,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            ...metadata,
          },
        }),
      });
    } catch (error) {
      console.error('Failed to log search:', error);
    }
  }, []);

  // Log filter
  const logFilter = useCallback(async (
    page: string, 
    filterType: string, 
    filterValue: string, 
    userId: string, 
    metadata?: Record<string, any>
  ) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          action: 'Filter',
          entity: 'Frontend',
          description: `Applied filter: ${filterType} = ${filterValue} on ${page}`,
          metadata: {
            page,
            filterType,
            filterValue,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            ...metadata,
          },
        }),
      });
    } catch (error) {
      console.error('Failed to log filter:', error);
    }
  }, []);

  // Log navigation
  const logNavigation = useCallback(async (
    fromPage: string, 
    toPage: string, 
    userId: string, 
    metadata?: Record<string, any>
  ) => {
    try {
      await fetch('/api/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          action: 'Navigation',
          entity: 'Frontend',
          description: `Navigated from ${fromPage} to ${toPage}`,
          metadata: {
            fromPage,
            toPage,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            ...metadata,
          },
        }),
      });
    } catch (error) {
      console.error('Failed to log navigation:', error);
    }
  }, []);

  return {
    logPageView,
    logButtonClick,
    logFormSubmit,
    logFileUpload,
    logFileDownload,
    logSearch,
    logFilter,
    logNavigation,
  };
}

/**
 * Higher-order component untuk automatic page view logging
 */
export function withPageAudit<T extends object>(
  Component: React.ComponentType<T>,
  pageName: string
) {
  return function AuditedComponent(props: T) {
    const { logPageView } = useFrontendAudit();

    useEffect(() => {
      const userId = localStorage.getItem('userId');
      if (userId) {
        logPageView(pageName, userId);
      }
    }, [logPageView, pageName]);

    return (Component as any)(props);
  };
}

/**
 * Hook untuk automatic button click logging
 */
export function useButtonAudit(pageName: string, userId: string) {
  const { logButtonClick } = useFrontendAudit();

  const createAuditedClickHandler = useCallback((
    buttonName: string,
    originalHandler?: () => void,
    metadata?: Record<string, any>
  ) => {
    return () => {
      logButtonClick(pageName, buttonName, userId, metadata);
      if (originalHandler) {
        originalHandler();
      }
    };
  }, [logButtonClick, pageName, userId]);

  return { createAuditedClickHandler };
}

/**
 * Hook untuk automatic form submit logging
 */
export function useFormAudit(pageName: string, userId: string) {
  const { logFormSubmit } = useFrontendAudit();

  const createAuditedSubmitHandler = useCallback((
    formName: string,
    originalHandler?: (e: React.FormEvent) => void,
    metadata?: Record<string, any>
  ) => {
    return (e: React.FormEvent) => {
      logFormSubmit(pageName, formName, userId, metadata);
      if (originalHandler) {
        originalHandler(e);
      }
    };
  }, [logFormSubmit, pageName, userId]);

  return { createAuditedSubmitHandler };
}
