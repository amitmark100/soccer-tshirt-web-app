import apiClient from './apiClient';
import { User, AuthResponse } from '../types/user';

/**
 * Auth Service - Handles authentication operations
 */
export const authService = {
  /**
   * Handle regular email/password signup
   * @param email - User email
   * @param password - User password
   * @param username - User username
   * @returns AuthResponse with token and user data
   */
  async regularSignup(email: string, password: string, username: string): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/register', {
      email,
      password,
      username,
    });
    return data;
  },

  /**
   * Handle regular email/password login
   * @param email - User email
   * @param password - User password
   * @returns AuthResponse with token and user data
   */
  async regularLogin(email: string, password: string): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return data;
  },

  /**
   * Handle Google OAuth login
   * @param credential - Google ID token from GoogleLogin component
   * @returns AuthResponse with token and user data
   */
  async googleLogin(credential: string): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>('/auth/google', {
      credential,
    });
    return data;
  },

  /**
   * Store authorization tokens and user data in localStorage
   * @param response - AuthResponse from backend
   */
  storeAuthData(response: AuthResponse): void {
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: response.user.id,
        username: response.user.username,
        email: response.user.email,
        profilePicture: response.user.profilePicture,
      })
    );
  },

  /**
   * Retrieve stored user data from localStorage
   * @returns User data or null if not found
   */
  getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error('Failed to parse stored user data:', e);
      return null;
    }
  },

  /**
   * Check if user is authenticated
   * @returns true if token exists in localStorage
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  },

  /**
   * Clear all authentication data from localStorage
   */
  clearAuthData(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  /**
   * Get stored auth token
   * @returns Auth token or null
   */
  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  },
};

export default authService;

