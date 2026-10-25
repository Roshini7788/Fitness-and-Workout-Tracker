/**
 * FitTrack - Centralized API Service
 * Handles HTTP requests, JWT token attachment, and unified error handling
 */

const API_BASE = '/api';

const api = {
  // Token management in localStorage
  getToken() {
    return localStorage.getItem('fittrack_token');
  },

  setToken(token) {
    if (token) {
      localStorage.setItem('fittrack_token', token);
    }
  },

  clearToken() {
    localStorage.removeItem('fittrack_token');
    localStorage.removeItem('fittrack_user');
  },

  getUser() {
    try {
      const userStr = localStorage.getItem('fittrack_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  setUser(user) {
    if (user) {
      localStorage.setItem('fittrack_user', JSON.stringify(user));
    }
  },

  // Base request method
  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({}));

      // Handle unauthenticated state
      if (response.status === 401) {
        this.clearToken();
        if (typeof window.onAuthExpired === 'function') {
          window.onAuthExpired();
        }
        throw new Error(data.message || 'Session expired. Please log in again.');
      }

      if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  },

  // Helper methods
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },
};

window.api = api;
