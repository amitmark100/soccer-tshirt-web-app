// Get backend API URL from environment with HTTPS fallback
const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:5000/api';

// Helper to safely concatenate base URL with path, avoiding double slashes
const buildUrl = (basePath: string, endpoint: string): string => {
  // Remove trailing slash from base if present
  const base = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;
  // Ensure endpoint starts with /
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
};

// Helper to get token from localStorage
const getAuthToken = (): string | null => {
  try {
    return localStorage.getItem('authToken');
  } catch (e) {
    console.warn('Failed to read authToken from localStorage:', e);
    return null;
  }
};

interface RequestInit {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
}

interface ApiResponse<T> {
  data: T;
  status: number;
}

const apiClient = {
  async get<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
    const url = new URL(buildUrl(BACKEND_URL, path));
    
    if (init?.params) {
      Object.entries(init.params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error || errorData?.msg || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return { data, status: response.status };
  },

  async post<T>(path: string, body?: any, init?: RequestInit): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': init?.headers?.['Content-Type'] || 'application/json',
      ...init?.headers,
    };

    // Add authorization token if available
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(buildUrl(BACKEND_URL, path), {
      method: 'POST',
      credentials: 'include',
      headers,
      body: body instanceof FormData ? body : JSON.stringify(body),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: `HTTP ${response.status}` };
      }
      
      const errorMessage = errorData?.error || errorData?.msg || `HTTP ${response.status}`;
      const error = new Error(errorMessage) as any;
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    return { data, status: response.status };
  },

  async patch<T>(path: string, body?: any, init?: RequestInit): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...init?.headers,
    };

    // Add authorization token if available
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(buildUrl(BACKEND_URL, path), {
      method: 'PATCH',
      credentials: 'include',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error || errorData?.msg || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return { data, status: response.status };
  },

  async put<T>(path: string, body?: any, init?: RequestInit): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': init?.headers?.['Content-Type'] || 'application/json',
      ...init?.headers,
    };

    // Add authorization token if available
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(buildUrl(BACKEND_URL, path), {
      method: 'PUT',
      credentials: 'include',
      headers,
      body: body instanceof FormData ? body : JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error || errorData?.msg || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return { data, status: response.status };
  },

  async delete<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...init?.headers,
    };

    // Add authorization token if available
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(buildUrl(BACKEND_URL, path), {
      method: 'DELETE',
      credentials: 'include',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error || errorData?.msg || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return { data, status: response.status };
  },
};

export default apiClient;
