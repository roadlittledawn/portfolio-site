import { createContext, useState, useEffect, useCallback, useContext, type ReactNode } from 'react';
import type { AuthUser } from '../../lib/auth';
import * as auth from '../../lib/auth';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  onAuthChange?: (isAuthenticated: boolean) => void;
}

export default function AuthProvider({ children, onAuthChange }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const result = await auth.verifyToken();
        if (result.valid && result.user) {
          setUser(result.user);
          onAuthChange?.(true);
        } else {
          setUser(null);
          onAuthChange?.(false);
          // Redirect to login if not on login page
          if (window.location.pathname !== '/admin/login') {
            window.location.href = '/admin/login';
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setUser(null);
        onAuthChange?.(false);
        if (window.location.pathname !== '/admin/login') {
          window.location.href = '/admin/login';
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [onAuthChange]);

  const handleLogin = useCallback(
    async (username: string, password: string) => {
      try {
        const response = await auth.login(username, password);
        setUser(response.user);
        onAuthChange?.(true);
        window.location.href = '/admin';
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },
    [onAuthChange]
  );

  const handleLogout = useCallback(async () => {
    try {
      await auth.logout();
      setUser(null);
      onAuthChange?.(false);
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear state anyway
      setUser(null);
      onAuthChange?.(false);
      window.location.href = '/admin/login';
    }
  }, [onAuthChange]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login: handleLogin,
    logout: handleLogout,
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
