/**
 * Authentication Utilities
 * Auth now uses HTTP-only cookies set by server
 */

export interface AuthUser {
  username: string;
}

export interface LoginResponse {
  success: boolean;
  user: AuthUser;
  expiresIn: number;
}

/**
 * Login user with username and password
 */
export async function login(username: string, password: string): Promise<LoginResponse> {
  const response = await fetch('/.netlify/functions/auth-login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  return await response.json();
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    await fetch('/.netlify/functions/auth-logout', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Logout request failed:', error);
  }
}

/**
 * Verify if token is still valid
 */
export async function verifyToken(): Promise<{ valid: boolean; user?: AuthUser }> {
  try {
    const response = await fetch('/.netlify/functions/auth-verify', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      return { valid: false };
    }

    return await response.json();
  } catch (error) {
    console.error('Token verification failed:', error);
    return { valid: false };
  }
}
