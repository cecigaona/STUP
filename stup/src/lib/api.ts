const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ApiOptions extends RequestInit {
  token?: string;
}

export async function apiCall(endpoint: string, options: ApiOptions = {}) {
  const token = options.token || (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });
  
  return response;
}

export const api = {
  login: async (email: string, password: string) => {
    const response = await apiCall('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({
        user: { email, password }
      }),
    });
    return { response, data: await response.json() };
  },
  
  register: async (userData: {
    username: string;
    name: string;
    email: string;
    password: string;
  }) => {
    const response = await apiCall('/api/users/register', {
      method: 'POST',
      body: JSON.stringify({ user: userData }),
    });
    return { response, data: await response.json() };
  },
  
  getCurrentUser: async () => {
    const response = await apiCall('/api/users/me', {
      method: 'GET',
    });
    return { response, data: await response.json() };
  }
};
