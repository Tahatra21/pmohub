import { useState, useEffect, useCallback, useRef } from 'react';

interface UseOptimizedFetchOptions {
  initialData?: any;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  dependencies?: any[];
  enabled?: boolean;
}

interface UseOptimizedFetchReturn {
  data: any;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useOptimizedFetch(
  url: string,
  options: UseOptimizedFetchOptions = {}
): UseOptimizedFetchReturn {
  const {
    initialData = null,
    onSuccess,
    onError,
    dependencies = [],
    enabled = true,
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled || !url) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url, {
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err);
        if (onError) {
          onError(err);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [url, enabled, onSuccess, onError]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}
