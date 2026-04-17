import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CredentialResponse, googleLogout } from '@react-oauth/google';
import authService from '../services/authService';
import { User } from '../types/user';

interface UseGoogleAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  handleGoogleSuccess: (credentialResponse: CredentialResponse) => Promise<void>;
  handleGoogleError: () => void;
  logout: () => void;
}

/**
 * Hook for managing Google OAuth authentication
 * Handles login, logout, and state management
 */
export const useGoogleAuth = (): UseGoogleAuthReturn => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(authService.getStoredUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle successful Google login
   */
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }

      // Send credential to backend
      const response = await authService.googleLogin(credentialResponse.credential);

      // Store auth data in localStorage
      authService.storeAuthData(response);

      // Update state
      setUser(response.user);

      // Redirect to feed
      navigate('/feed');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Google login failed';
      console.error('Google login error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Google login error
   */
  const handleGoogleError = (): void => {
    const errorMessage = 'Failed to initialize Google login. Please try again.';
    console.error(errorMessage);
    setError(errorMessage);
  };

  /**
   * Handle logout
   */
  const logout = (): void => {
    // Clear local auth data
    authService.clearAuthData();
    setUser(null);
    
    // Log out from Google
    googleLogout();
    
    // Redirect to login
    navigate('/auth');
  };

  return {
    user,
    loading,
    error,
    handleGoogleSuccess,
    handleGoogleError,
    logout,
  };
};

export default useGoogleAuth;
