import { createContext, useState, useEffect, useCallback, useContext, type ReactNode } from 'react';
import { fetchMe, logout as signOut, redirectToLogin, type AuthUser } from '../../lib/auth-client';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  /** Ends the clang-auth session: signs out of every app on the domain. */
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  onAuthChange?: (isAuthenticated: boolean) => void;
}

/**
 * Client-side view of the signed-in admin, from `auth-me`.
 *
 * The middleware already guarantees a signed-in admin when an /admin page
 * renders, so a 401 here means the 15-minute access token expired: fetchMe()
 * tries a session refresh, and if that fails we send the user to clang-auth
 * sign-in (never /admin/login).
 */
export default function AuthProvider({ children, onAuthChange }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchMe()
      .then((me) => {
        if (cancelled) return;
        setUser(me);
        onAuthChange?.(me !== null);
        if (!me) redirectToLogin();
      })
      .catch((error) => {
        console.error('Auth check failed:', error);
        if (!cancelled) {
          setUser(null);
          onAuthChange?.(false);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [onAuthChange]);

  const handleLogout = useCallback(async () => {
    setUser(null);
    onAuthChange?.(false);
    await signOut();
  }, [onAuthChange]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    logout: handleLogout,
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
