/**
 * User Management Component
 * Allows administrators to create, edit, and manage user accounts and roles
 */

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { fetchUsers } from "../../utils/dataService";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import {
  UserCog,
  Plus,
  Edit,
  Trash2,
  Shield,
  Mail,
  Calendar,
  CheckCircle,
  XCircle,
  Search,
  UserPlus,
  Users,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  User,
  UserRole,
  getRoleDisplayName,
  getRoleDescription,
  getRoleBadgeColor,
  canChangeRole,
  getPermissionsForRole,
} from '../../utils/roles';
import { fetchEmployees, Employee } from '../../utils/dataService';
import { Checkbox } from './ui/checkbox';

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form state for add/edit user
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'assistant' as UserRole,
    assignedEmployees: [] as string[],
    employeeProfileId: '',
  });

  // Mock current user (in production, this comes from auth context)
  const currentUser: User = {
    id: '1',
    email: 'admin@umbc.edu',
    name: 'System Administrator',
    role: 'super_admin',
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
  
      // Load employees
      const employeeData = await fetchEmployees();
      setEmployees(employeeData);
  
      // 🔥 Load users from backend
      const backendUsers = await fetchUsers();
  
      // 🔥 Transform backend user → frontend user shape
      const normalizedUsers: User[] = backendUsers.map((u: any) => ({
        id: String(u.id),
        email: u.email,
        name: u.first_name && u.last_name 
          ? `${u.first_name} ${u.last_name}`
          : u.username ?? u.email,
  
        role:
          u.role === "super_admin" || u.role === "admin"
            ? "administrator"
            : u.role === "manager"
            ? "assistant"
            : "employee",
  
        isActive: u.is_active,
        createdAt: u.created_at,
        lastLogin: u.last_login,
      }));
  
      setUsers(normalizedUsers);
  
    } catch (error) {
      console.error("❌ Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };
  

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = () => {
    setFormData({
      name: '',
      email: '',
      role: 'assistant',
      assignedEmployees: [],
      employeeProfileId: '',
    });
    setShowAddUserDialog(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      assignedEmployees: user.assignedEmployees || [],
      employeeProfileId: user.employeeProfileId || '',
    });
    setShowEditUserDialog(true);
  };

  const handleSaveUser = async () => {
    try {
      // Validate form
      if (!formData.name || !formData.email) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Validate role-specific requirements
      if (formData.role === 'assistant' && formData.assignedEmployees.length === 0) {
        toast.error('Assistants must be assigned to at least one employee');
        return;
      }

      if (formData.role === 'employee') {
        // Auto-match employee profile by email
        const matchingEmployee = employees.find(
          emp => emp.email.toLowerCase() === formData.email.toLowerCase()
        );
        
        if (!matchingEmployee) {
          toast.error('No employee profile found', {
            description: `No employee record found with email ${formData.email}. Please ensure the employee exists in the system first.`,
          });
          return;
        }
        // Auto-assign the matched employee profile
        formData.employeeProfileId = matchingEmployee.id;
      }

      // In production, make API call here
      const newUser: User = {
        id: String(users.length + 1),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        isActive: true,
        createdAt: new Date().toISOString(),
        assignedEmployees: formData.role === 'assistant' ? formData.assignedEmployees : undefined,
        employeeProfileId: formData.role === 'employee' ? formData.employeeProfileId : undefined,
        createdBy: currentUser.id,
      };

      setUsers([...users, newUser]);
      setShowAddUserDialog(false);
      toast.success('User created successfully', {
        description: `${formData.name} has been added as ${getRoleDisplayName(formData.role)}.${
          formData.role === 'employee' ? ' They can now log in to view their profile.' : ''
        }`,
      });
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Failed to create user');
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      // Check if role change is allowed
      if (formData.role !== selectedUser.role) {
        const validation = canChangeRole(currentUser, selectedUser, formData.role);
        if (!validation.allowed) {
          toast.error('Role change not allowed', {
            description: validation.reason,
          });
          return;
        }
      }

      // In production, make API call here
      const updatedUsers = users.map((user) =>
        user.id === selectedUser.id
          ? {
              ...user,
              name: formData.name,
              email: formData.email,
              role: formData.role,
              assignedEmployees: formData.role === 'assistant' ? formData.assignedEmployees : undefined,
              employeeProfileId: formData.role === 'employee' ? formData.employeeProfileId : undefined,
            }
          : user
      );

      setUsers(updatedUsers);
      setShowEditUserDialog(false);
      setSelectedUser(null);
      toast.success('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleToggleUserStatus = async (user: User) => {
    try {
      // In production, make API call here
      const updatedUsers = users.map((u) =>
        u.id === user.id ? { ...u, isActive: !u.isActive } : u
      );
      setUsers(updatedUsers);
      toast.success(
        user.isActive ? 'User deactivated' : 'User activated',
        {
          description: `${user.name} has been ${user.isActive ? 'deactivated' : 'activated'}`,
        }
      );
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const getEmployeeNameById = (id: string) => {
    const employee = employees.find((emp) => emp.id === id);
    return employee ? employee.employeeName : 'Unknown';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5B8DEF] mx-auto mb-4"></div>
              <p className="text-[#6B7280]">Loading users...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <UserCog className="h-7 w-7 text-[#5B8DEF]" />
                <h1 className="text-[#1E1E1E]">User Management</h1>
              </div>
              <p className="text-[#4A4A4A]">
                Manage user accounts, roles, and permissions for the visa tracking system.
              </p>
            </div>
            <Button
              onClick={handleAddUser}
              className="bg-black text-[#FFCC00] hover:bg-neutral-900"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
          <div className="h-[1px] bg-[#E5E5E5]" />
        </div>

        {/* Role Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-[#5B8DEF] bg-[#E9F2FF] p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#5B8DEF] rounded-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-[#1E1E1E] mb-1">UMBC Administrator</h3>
                <p className="text-sm text-[#4A4A4A]">
                  Full system access - manage users, employees, reports, and settings
                </p>
                <div className="mt-2">
                  <Badge className="bg-[#5B8DEF] text-white">
                    {users.filter((u) => u.role === 'administrator').length} users
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-[#EFB74A] bg-[#FFF9EB] p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#EFB74A] rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-[#1E1E1E] mb-1">Assistant</h3>
                <p className="text-sm text-[#4A4A4A]">
                  Limited access - view and manage only assigned employees
                </p>
                <div className="mt-2">
                  <Badge className="bg-[#EFB74A] text-white">
                    {users.filter((u) => u.role === 'assistant').length} users
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-[#9E9E9E] bg-[#F5F5F5] p-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#9E9E9E] rounded-lg">
                <UserCog className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-[#1E1E1E] mb-1">Employee (Self-View)</h3>
                <p className="text-sm text-[#4A4A4A]">
                  Self-view only - can only view their own profile information
                </p>
                <div className="mt-2">
                  <Badge className="bg-[#9E9E9E] text-white">
                    {users.filter((u) => u.role === 'employee').length} users
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6 border-[#E5E5E5]">
          <div className="p-4 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-[#E1E1E1]"
              />
            </div>
            <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as typeof roleFilter)}>
              <SelectTrigger className="w-full md:w-[200px] bg-white border-[#E1E1E1]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="administrator">Administrator</SelectItem>
                <SelectItem value="assistant">Assistant</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Users Table */}
        <Card className="border-[#E5E5E5]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F1F3F5] hover:bg-[#F1F3F5]">
                  <TableHead className="text-[#1E1E1E]">User</TableHead>
                  <TableHead className="text-[#1E1E1E]">Role</TableHead>
                  <TableHead className="text-[#1E1E1E]">Status</TableHead>
                  <TableHead className="text-[#1E1E1E]">Assignments</TableHead>
                  <TableHead className="text-[#1E1E1E]">Last Login</TableHead>
                  <TableHead className="text-[#1E1E1E]">Created</TableHead>
                  <TableHead className="text-[#1E1E1E] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-[#6B7280]">
                      <AlertCircle className="h-12 w-12 mx-auto mb-3 text-[#9E9E9E]" />
                      <p className="text-[#1E1E1E]">No users found</p>
                      <p className="text-sm mt-1">Try adjusting your search or filters</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="border-b border-[#E5E5E5]">
                      <TableCell>
                        <div>
                          <p className="font-medium text-[#1E1E1E]">{user.name}</p>
                          <p className="text-sm text-[#6B7280] flex items-center gap-1 mt-0.5">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {getRoleDisplayName(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.isActive ? (
                          <Badge className="bg-[#5BB974] text-white">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-[#D86464] text-[#D86464]">
                            <XCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.role === 'assistant' && user.assignedEmployees && (
                          <span className="text-sm text-[#4A4A4A]">
                            {user.assignedEmployees.length} {user.assignedEmployees.length === 1 ? 'employee' : 'employees'}
                          </span>
                        )}
                        {user.role === 'employee' && user.employeeProfileId && (
                          <span className="text-sm text-[#4A4A4A]">
                            {getEmployeeNameById(user.employeeProfileId)}
                          </span>
                        )}
                        {user.role === 'administrator' && (
                          <span className="text-sm text-[#6B7280]">All employees</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.lastLogin ? (
                          <span className="text-sm text-[#4A4A4A]">
                            {new Date(user.lastLogin).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        ) : (
                          <span className="text-sm text-[#6B7280]">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-[#4A4A4A] flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(user.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="text-[#5B8DEF] hover:text-[#4A7DD8] hover:bg-[#E9F2FF]"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleUserStatus(user)}
                            disabled={user.id === currentUser.id}
                            className={
                              user.isActive
                                ? 'text-[#D86464] hover:text-[#C85454] hover:bg-[#FEE2E2]'
                                : 'text-[#5BB974] hover:text-[#4AA864] hover:bg-[#F0F9F4]'
                            }
                          >
                            {user.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Add User Dialog */}
        <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account and assign their role and permissions.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john.doe@umbc.edu"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      role: value as UserRole,
                      assignedEmployees: [],
                      employeeProfileId: '',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrator">UMBC Administrator</SelectItem>
                    <SelectItem value="assistant">Assistant</SelectItem>
                    <SelectItem value="employee">Employee (Self-View)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-[#6B7280]">{getRoleDescription(formData.role)}</p>
              </div>

              {/* Assistant-specific: Assign Employees */}
              {formData.role === 'assistant' && (
                <div className="space-y-2">
                  <Label>Assign Employees *</Label>
                  <Card className="border-[#E5E5E5] p-4 max-h-[200px] overflow-y-auto">
                    <div className="space-y-2">
                      {employees.map((employee) => (
                        <div key={employee.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`emp-${employee.id}`}
                            checked={formData.assignedEmployees.includes(employee.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  assignedEmployees: [...formData.assignedEmployees, employee.id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  assignedEmployees: formData.assignedEmployees.filter(
                                    (id) => id !== employee.id
                                  ),
                                });
                              }
                            }}
                          />
                          <label
                            htmlFor={`emp-${employee.id}`}
                            className="text-sm cursor-pointer flex-1"
                          >
                            {employee.name} - {employee.department}
                          </label>
                        </div>
                      ))}
                    </div>
                  </Card>
                  <p className="text-xs text-[#6B7280]">
                    Selected: {formData.assignedEmployees.length} employees
                  </p>
                </div>
              )}

              {/* Employee-specific: Link to Profile */}
              {formData.role === 'employee' && (
                <Card className="border-[#5B8DEF] bg-[#E9F2FF] p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-[#5B8DEF] rounded-lg">
                      <UserCog className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#1E1E1E] mb-1">
                        Automatic Profile Linking
                      </p>
                      <p className="text-xs text-[#4A4A4A]">
                        The system will automatically link this user account to the employee profile with the matching email address. 
                        Make sure the email you enter matches an existing employee record.
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveUser} className="bg-[#5B8DEF] hover:bg-[#4A7DD8] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information, role, and assignments.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Full Name *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email Address *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-role">Role *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      role: value as UserRole,
                      assignedEmployees: [],
                      employeeProfileId: '',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="administrator">UMBC Administrator</SelectItem>
                    <SelectItem value="assistant">Assistant</SelectItem>
                    <SelectItem value="employee">Employee (Self-View)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-[#6B7280]">{getRoleDescription(formData.role)}</p>
              </div>

              {/* Assistant-specific: Assign Employees */}
              {formData.role === 'assistant' && (
                <div className="space-y-2">
                  <Label>Assign Employees *</Label>
                  <Card className="border-[#E5E5E5] p-4 max-h-[200px] overflow-y-auto">
                    <div className="space-y-2">
                      {employees.map((employee) => (
                        <div key={employee.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`edit-emp-${employee.id}`}
                            checked={formData.assignedEmployees.includes(employee.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setFormData({
                                  ...formData,
                                  assignedEmployees: [...formData.assignedEmployees, employee.id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  assignedEmployees: formData.assignedEmployees.filter(
                                    (id) => id !== employee.id
                                  ),
                                });
                              }
                            }}
                          />
                          <label
                            htmlFor={`edit-emp-${employee.id}`}
                            className="text-sm cursor-pointer flex-1"
                          >
                            {employee.name} - {employee.department}
                          </label>
                        </div>
                      ))}
                    </div>
                  </Card>
                  <p className="text-xs text-[#6B7280]">
                    Selected: {formData.assignedEmployees.length} employees
                  </p>
                </div>
              )}

              {/* Employee-specific: Link to Profile */}
              {formData.role === 'employee' && (
                <div className="space-y-2">
                  <Label htmlFor="edit-employee-profile">Link to Employee Profile *</Label>
                  <Select
                    value={formData.employeeProfileId}
                    onValueChange={(value) => setFormData({ ...formData, employeeProfileId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee profile" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} - {employee.department}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditUserDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUser} className="bg-[#5B8DEF] hover:bg-[#4A7DD8] text-white">
                <Edit className="h-4 w-4 mr-2" />
                Update User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      </div>
  );
}