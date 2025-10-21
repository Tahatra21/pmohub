/**
 * Utility function for making authenticated API calls
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('auth_token');
  
  console.log('API: Checking token for URL:', url, 'Token exists:', !!token);
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Don't throw error for validation errors (422) - let the calling code handle it
  if (!response.ok && response.status !== 422) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response;
}

/**
 * Utility function for making authenticated API calls with form data
 */
export async function authenticatedFetchFormData(url: string, formData: FormData) {
  const token = localStorage.getItem('auth_token');
  
  console.log('API FormData: Checking token for URL:', url, 'Token exists:', !!token);
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response;
}
