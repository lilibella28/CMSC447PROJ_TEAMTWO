/**
 * Authentication Context
 * Manages current user authentication state and permissions
 */

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole, getPermissionsForRole, canAccessEmployee } from '../../utils/roles';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  hasPermission: (permissionKey: string) => boolean;
  canAccessEmployeeProfile: (employeeId: string) => boolean;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize with mock user (in production, check session/token)
  useEffect(() => {
    // Mock: Load user from localStorage or session
    const mockUser: User = {
      id: '1',
      email: 'admin@umbc.edu',
      name: 'System Administrator',
      role: 'administrator',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    setCurrentUser(mockUser);
    setIsAuthenticated(true);
  }, []);

  const login = (user: User) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    // In production: Store token/session
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    // In production: Clear token/session
    localStorage.removeItem('currentUser');
  };

  const hasPermission = (permissionKey: string): boolean => {
    if (!currentUser) return false;
    const permissions = getPermissionsForRole(currentUser.role);
    return permissions[permissionKey as keyof typeof permissions] || false;
  };

  const canAccessEmployeeProfile = (employeeId: string): boolean => {
    return canAccessEmployee(currentUser, employeeId);
  };

  const updateUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        login,
        logout,
        hasPermission,
        canAccessEmployeeProfile,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}