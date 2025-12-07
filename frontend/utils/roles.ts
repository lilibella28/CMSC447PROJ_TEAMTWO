/**
 * Role-Based Access Control (RBAC) Utility
 * Defines roles, permissions, and access control logic
 */

export type UserRole =
    'super_admin' |
    'admin' |
    'manager' |
    'viewer';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
    assignedEmployees?: string[]; // For assistants - array of employee IDs
    employeeProfileId?: string; // For employees - their own profile ID
    createdBy?: string;
    lastLogin?: string;
}

export interface Permission {
    canViewDashboard: boolean;
    canViewAllEmployees: boolean;
    canViewAssignedEmployees: boolean;
    canViewOwnProfile: boolean;
    canAddEmployee: boolean;
    canEditEmployee: boolean;
    canDeleteEmployee: boolean;
    canViewReports: boolean;
    canViewSettings: boolean;
    canManageUsers: boolean;
    canImportData: boolean;
    canExportData: boolean;
    canAddVisaHistory: boolean;
    canEditVisaHistory: boolean;
    canAddNotes: boolean;
    canUploadDocuments: boolean;
    canViewDepartments: boolean;
    canManageDepartments: boolean;
    canAssignAssistants: boolean;
    canGrantEmployeeAccess: boolean;
}

/**
 * Get permissions for a given role
 */
export function getPermissionsForRole(role: UserRole): Permission {
    switch (role) {
  
      // SUPER ADMIN — full access
      case 'super_admin':
        return {
          canViewDashboard: true,
          canViewAllEmployees: true,
          canViewAssignedEmployees: true,
          canViewOwnProfile: true,
          canAddEmployee: true,
          canEditEmployee: true,
          canDeleteEmployee: true,
          canViewReports: true,
          canViewSettings: true,
          canManageUsers: true,
          canImportData: true,
          canExportData: true,
          canAddVisaHistory: true,
          canEditVisaHistory: true,
          canAddNotes: true,
          canUploadDocuments: true,
          canViewDepartments: true,
          canManageDepartments: true,
          canAssignAssistants: true,
          canGrantEmployeeAccess: true,
        };
  
      // ADMIN — full but cannot delete employees
      case 'admin':
        return {
          canViewDashboard: true,
          canViewAllEmployees: true,
          canViewAssignedEmployees: true,
          canViewOwnProfile: true,
          canAddEmployee: true,
          canEditEmployee: true,
          canDeleteEmployee: false,
          canViewReports: true,
          canViewSettings: true,
          canManageUsers: true,
          canImportData: true,
          canExportData: true,
          canAddVisaHistory: true,
          canEditVisaHistory: true,
          canAddNotes: true,
          canUploadDocuments: true,
          canViewDepartments: true,
          canManageDepartments: true,
          canAssignAssistants: true,
          canGrantEmployeeAccess: true,
        };
  
      // MANAGER — can manage employees but not system settings
      case 'manager':
        return {
          canViewDashboard: true,
          canViewAllEmployees: false,
          canViewAssignedEmployees: true,
          canViewOwnProfile: true,
          canAddEmployee: false,
          canEditEmployee: true,
          canDeleteEmployee: false,
          canViewReports: false,
          canViewSettings: false,
          canManageUsers: false,
          canImportData: false,
          canExportData: false,
          canAddVisaHistory: true,
          canEditVisaHistory: true,
          canAddNotes: true,
          canUploadDocuments: true,
          canViewDepartments: false,
          canManageDepartments: false,
          canAssignAssistants: false,
          canGrantEmployeeAccess: false,
        };
  
      // VIEWER — read-only
      case 'viewer':
      default:
        return {
          canViewDashboard: false,
          canViewAllEmployees: false,
          canViewAssignedEmployees: false,
          canViewOwnProfile: true,
          canAddEmployee: false,
          canEditEmployee: false,
          canDeleteEmployee: false,
          canViewReports: false,
          canViewSettings: false,
          canManageUsers: false,
          canImportData: false,
          canExportData: false,
          canAddVisaHistory: false,
          canEditVisaHistory: false,
          canAddNotes: false,
          canUploadDocuments: false,
          canViewDepartments: false,
          canManageDepartments: false,
          canAssignAssistants: false,
          canGrantEmployeeAccess: false,
        };
    }
  }
  
/**
 * Check if user has a specific permission
 */
export function hasPermission(user: User | null, permissionKey: keyof Permission): boolean {
    if (!user) return false;
    const permissions = getPermissionsForRole(user.role);
    return permissions[permissionKey];
}

/**
 * Check if user can access a specific employee
 */
export function canAccessEmployee(user: User | null, employeeId: string): boolean {
    if (!user) return false;
  
    if (user.role === 'super_admin') return true;
    if (user.role === 'admin') return true;
  
    if (user.role === 'manager') {
      return user.assignedEmployees?.includes(employeeId) || false;
    }
  
    if (user.role === 'viewer') {
      return user.employeeProfileId === employeeId;
    }
  
    return false;
  }

/**
 * Get role display name
 */
export function getRoleDisplayName(role: UserRole): string {
    switch (role) {
        case 'admin':
            return 'UMBC Administrator';
        case 'manager':
            return 'Assistant';
        case 'viewer':
            return 'Employee (Self-View)';
    }
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole): string {
    switch (role) {
        case 'admin':
            return 'Full system access - can manage users, employees, and system settings';
        case 'manager':
            return 'Limited access - can view and manage only assigned employees';
        case 'viewer':
            return 'Self-view only - can view only their own profile information';
    }
}

/**
 * Get role badge color
 */
export function getRoleBadgeColor(role: UserRole): string {
    switch (role) {
        case 'administrator':
            return 'bg-[#5B8DEF] text-white';
        case 'assistant':
            return 'bg-[#EFB74A] text-white';
        case 'employee':
            return 'bg-[#9E9E9E] text-white';
    }
}

/**
 * Validate if role change is allowed
 */
export function canChangeRole(currentUser: User, targetUser: User, newRole: UserRole): {
    allowed: boolean;
    reason?: string;
} {
    // Only administrators can change roles
    if (currentUser.role !== 'administrator') {
        return { allowed: false, reason: 'Only administrators can change user roles' };
    }

    // Users cannot change their own role
    if (currentUser.id === targetUser.id) {
        return { allowed: false, reason: 'You cannot change your own role' };
    }

    return { allowed: true };
}

/**
 * Get navigation items based on role
 */
export function getNavigationItems(user: User | null) {
    if (!user) return [];

    const permissions = getPermissionsForRole(user.role);
    const items = [];

    if (permissions.canViewDashboard) {
        items.push({
            id: 'dashboard',
            label: user.role === 'assistant' ? 'My Assigned Employees' : 'Dashboard',
            icon: 'LayoutDashboard',
        });
    }

    if (permissions.canViewAllEmployees) {
        items.push({
            id: 'employees',
            label: 'Employees',
            icon: 'Users',
        });
    }

    if (permissions.canViewOwnProfile && user.role === 'employee') {
        items.push({
            id: 'my-profile',
            label: 'My Profile',
            icon: 'User',
        });
    }

    if (permissions.canViewReports) {
        items.push({
            id: 'reports',
            label: 'Reports',
            icon: 'BarChart',
        });
    }

    if (permissions.canViewDepartments) {
        items.push({
            id: 'departments',
            label: 'Departments',
            icon: 'Building',
        });
    }

    if (permissions.canImportData) {
        items.push({
            id: 'import',
            label: 'Import Data',
            icon: 'Upload',
        });
    }

    if (permissions.canManageUsers) {
        items.push({
            id: 'users',
            label: 'User Management',
            icon: 'UserCog',
        });
    }

    if (permissions.canViewSettings) {
        items.push({
            id: 'settings',
            label: 'Settings',
            icon: 'Settings',
        });
    }

    return items;
}
