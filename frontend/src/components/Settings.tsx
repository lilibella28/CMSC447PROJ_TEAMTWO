import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Checkbox } from "./ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Shield,
  Users,
  UserCog,
  UserPlus,
  X,
  Mail,
  User,
  Building2,
  Bell,
  Globe,
  Eye,
  Save,
  Trash2,
  Edit,
  AlertCircle,
  Lock,
  Plus,
  Moon,
  Sun,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { getRoleDisplayName, getRoleBadgeColor, UserRole } from "../../utils/roles";
import { DEMO_USERS } from "./UserSwitcher";
import { Separator } from "./ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";

// Mock admin users data with roles
interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  assignedEmployees?: string[];
  employeeProfileId?: string;
}

const initialAdmins: AdminUser[] = [
  { id: "1", name: "Sarah Martinez", email: "admin@umbc.edu", role: "admin" },
  { id: "2", name: "Michael Chen", email: "manager@umbc.edu", role: "manager", assignedEmployees: ["1", "2", "3"] },
  { id: "3", name: "John Smith", email: "john.smith@umbc.edu", role: "viewer", employeeProfileId: "1" },
];

// Mock employee data type
interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
}

// Mock fetch employees function
// Fetch employees from backend
const fetchEmployees = async (): Promise<Employee[]> => {
  try {
    const response = await fetch("http://127.0.0.1:5000/api/employees/", {
      method: "GET",
      credentials: "include",   // include cookies/session
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to fetch employees", response.status);
      return [];
    }

    const data = await response.json();

    // Convert backend naming → frontend naming if needed
    return data.map((emp: any) => ({
      id: String(emp.id),
      name: `${emp.first_name} ${emp.last_name}`, 
      email: emp.email,
    }));
  } catch (error) {
    console.error("Error fetching employees:", error);
    return [];
  }
};

// Helper function to get role description
const getRoleDescription = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return 'Full system access including user management and all employees';
    case 'manager':
      return 'Limited access to assigned employees only';
    case 'viewer':
      return 'Can only view their own employee profile (read-only)';
  }
};

export function Settings() {
  // Account Settings State
  const [name, setName] = useState("Admin User");
  const [email, setEmail] = useState("admin@umbc.edu");
  
  // Admin Management State
  const [admins, setAdmins] = useState(initialAdmins);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<UserRole>("admin");
  const [newAdminAssignedEmployees, setNewAdminAssignedEmployees] = useState<string[]>([]);
  const [newAdminEmployeeProfileId, setNewAdminEmployeeProfileId] = useState("");
  const [adminToRemove, setAdminToRemove] = useState<string | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  // Preferences State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [visaExpiryAlerts, setVisaExpiryAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Change Password Dialog State
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Load employees for role assignment
  useState(() => {
    const loadEmployees = async () => {
      try {
        const data = await fetchEmployees();
        setEmployees(data);
      } catch (error) {
        console.error("Error loading employees:", error);
      }
    };
    loadEmployees();
  });

  // Handle Account Settings Save
  const handleSaveAccount = () => {
    toast.success("Account settings saved!", {
      description: "Your account information has been updated.",
      duration: 3000,
    });
  };

  // Handle Password Change
  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    setIsPasswordDialogOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Password changed successfully!");
  };

  // Handle Add Admin
  const handleAddAdmin = () => {
    if (!newAdminName || !newAdminEmail) {
      toast.error("Please fill in all fields");
      return;
    }

    // Validate role-specific requirements
    if (newAdminRole === 'manager' && newAdminAssignedEmployees.length === 0) {
      toast.error("Assistants must be assigned to at least one employee");
      return;
    }

    if (newAdminRole === 'viewer') {
      // Auto-match employee profile by email
      const matchingEmployee = employees.find(
        emp => emp.email.toLowerCase() === newAdminEmail.toLowerCase()
      );
      
      if (!matchingEmployee) {
        toast.error("No employee profile found", {
          description: `No employee record found with email ${newAdminEmail}. Please ensure the employee exists in the system first.`,
        });
        return;
      }
    }
    
    const newAdmin = {
      id: String(admins.length + 1),
      name: newAdminName,
      email: newAdminEmail,
      role: newAdminRole,
      assignedEmployees: newAdminAssignedEmployees,
      employeeProfileId: newAdminEmployeeProfileId,
    };
    
    setAdmins([...admins, newAdmin]);
    setNewAdminName("");
    setNewAdminEmail("");
    setNewAdminRole("admin");
    setNewAdminAssignedEmployees([]);
    setNewAdminEmployeeProfileId("");
    setIsAddAdminOpen(false);
    
    toast.success("User created successfully!", {
      description: `${newAdminName} has been added as ${getRoleDisplayName(newAdminRole)}.${
        newAdminRole === 'viewer' ? ' They can now log in to view their profile.' : ''
      }`,
      duration: 3000,
    });
  };

  // Handle Open Edit Dialog
  const handleOpenEditAdmin = (adminId: string) => {
    const admin = admins.find((a) => a.id === adminId);
    if (!admin) return;

    setEditingAdminId(adminId);
    setNewAdminName(admin.name);
    setNewAdminEmail(admin.email);
    setNewAdminRole(admin.role);
    setNewAdminAssignedEmployees(admin.assignedEmployees || []);
    setNewAdminEmployeeProfileId(admin.employeeProfileId || "");
    setIsAddAdminOpen(true);
  };

  // Handle Update Admin
  const handleUpdateAdmin = () => {
    if (!newAdminName || !newAdminEmail) {
      toast.error("Please fill in all fields");
      return;
    }

    // Validate role-specific requirements
    if (newAdminRole === 'manager' && newAdminAssignedEmployees.length === 0) {
      toast.error("Assistants must be assigned to at least one employee");
      return;
    }

    if (newAdminRole === 'viewer') {
      // Auto-match employee profile by email
      const matchingEmployee = employees.find(
        emp => emp.email.toLowerCase() === newAdminEmail.toLowerCase()
      );
      
      if (!matchingEmployee) {
        toast.error("No employee profile found", {
          description: `No employee record found with email ${newAdminEmail}. Please ensure the employee exists in the system first.`,
        });
        return;
      }
    }

    const updatedAdmins = admins.map((admin) => {
      if (admin.id === editingAdminId) {
        return {
          ...admin,
          name: newAdminName,
          email: newAdminEmail,
          role: newAdminRole,
          assignedEmployees: newAdminRole === 'manager' ? newAdminAssignedEmployees : undefined,
          employeeProfileId: newAdminRole === 'viewer' ? newAdminEmployeeProfileId : undefined,
        };
      }
      return admin;
    });

    setAdmins(updatedAdmins);
    setEditingAdminId(null);
    setNewAdminName("");
    setNewAdminEmail("");
    setNewAdminRole("admin");
    setNewAdminAssignedEmployees([]);
    setNewAdminEmployeeProfileId("");
    setIsAddAdminOpen(false);

    toast.success("User updated successfully!", {
      description: `${newAdminName}'s account has been updated.`,
      duration: 3000,
    });
  };

  // Handle Close Dialog
  const handleCloseDialog = () => {
    setIsAddAdminOpen(false);
    setEditingAdminId(null);
    setNewAdminName("");
    setNewAdminEmail("");
    setNewAdminRole("admin");
    setNewAdminAssignedEmployees([]);
    setNewAdminEmployeeProfileId("");
  };

  // Handle Remove Admin
  const handleRemoveAdmin = (adminId: string) => {
    const admin = admins.find((a) => a.id === adminId);
    setAdmins(admins.filter((a) => a.id !== adminId));
    setAdminToRemove(null);
    
    toast.success("Admin removed", {
      description: `${admin?.name} has been removed from admin access.`,
      duration: 3000,
    });
  };

  // Handle Preferences Save
  const handleSavePreferences = () => {
    toast.success("Preferences saved!", {
      description: "Your notification and display preferences have been updated.",
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-black">Settings</h1>
          <p className="text-sm text-[#6B7280]">
            Manage your account settings and admin users
          </p>
        </div>

        {/* Account Settings Section */}
        <Card className="p-6 rounded-2xl shadow-sm border border-[#E5E7EB]">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-black mb-1">
                Account Settings
              </h2>
              <p className="text-xs text-[#6B7280]">
                Update your personal information
              </p>
            </div>

            <div className="space-y-4">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">
                  Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-[#D1D5DB] h-11"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-[#D1D5DB] h-11"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label className="text-base">Password</Label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                    <Input
                      type="password"
                      value="••••••••••••"
                      disabled
                      className="pl-10 border-[#D1D5DB] h-11 bg-[#F9FAFB]"
                    />
                  </div>
                  <Dialog
                    open={isPasswordDialogOpen}
                    onOpenChange={setIsPasswordDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="border-[#D1D5DB] whitespace-nowrap"
                      >
                        Change Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                          Enter your current password and a new password.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="current">Current Password</Label>
                          <Input
                            id="current"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new">New Password</Label>
                          <Input
                            id="new"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm">Confirm Password</Label>
                          <Input
                            id="confirm"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                          />
                        </div>
                        <p className="text-xs text-[#6B7280]">
                          Password must be at least 8 characters long.
                        </p>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsPasswordDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="bg-black text-[#FFCC00] hover:bg-[#1F1F1F]"
                          onClick={handleChangePassword}
                        >
                          Update Password
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                className="bg-black text-[#FFCC00] hover:bg-[#1F1F1F]"
                onClick={handleSaveAccount}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Card>

        {/* Admin Management Section */}
        <Card className="p-6 rounded-2xl shadow-sm border border-[#E5E7EB]">
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-black mb-1">
                  Admin Management
                </h2>
                <p className="text-xs text-[#6B7280]">
                  Manage users with admin access
                </p>
              </div>
              <Dialog open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-black text-[#FFCC00] hover:bg-[#1F1F1F]">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Admin
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingAdminId ? 'Edit User' : 'Add New User'}</DialogTitle>
                    <DialogDescription>
                      {editingAdminId 
                        ? 'Update user account information, role, and permissions.'
                        : 'Create a new user account and assign their role and permissions.'
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="adminName">Full Name *</Label>
                        <Input
                          id="adminName"
                          value={newAdminName}
                          onChange={(e) => setNewAdminName(e.target.value)}
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="adminEmail">Email Address *</Label>
                        <Input
                          id="adminEmail"
                          type="email"
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                          placeholder="john.doe@umbc.edu"
                        />
                      </div>
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="adminRole">Role *</Label>
                      <Select
                        value={newAdminRole}
                        onValueChange={(value) => {
                          setNewAdminRole(value as UserRole);
                          setNewAdminAssignedEmployees([]);
                          setNewAdminEmployeeProfileId("");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-[#5B8DEF]" />
                              <span>UMBC Administrator</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="manager">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-[#EFB74A]" />
                              <span>Assistant</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="employee">
                            <div className="flex items-center gap-2">
                              <UserCog className="h-4 w-4 text-[#9E9E9E]" />
                              <span>Employee (Self-View)</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-[#6B7280]">
                        {getRoleDescription(newAdminRole)}
                      </p>
                    </div>

                    {/* Assistant-specific: Assign Employees */}
                    {newAdminRole === 'manager' && (
                      <div className="space-y-2">
                        <Label>Assign Employees *</Label>
                        <Card className="border-[#E5E5E5] p-4 max-h-[200px] overflow-y-auto">
                          {employees.length === 0 ? (
                            <p className="text-sm text-[#6B7280] text-center py-4">
                              No employees available
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {employees.map((employee) => (
                                <div key={employee.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`emp-${employee.id}`}
                                    checked={newAdminAssignedEmployees.includes(employee.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setNewAdminAssignedEmployees([...newAdminAssignedEmployees, employee.id]);
                                      } else {
                                        setNewAdminAssignedEmployees(
                                          newAdminAssignedEmployees.filter((id) => id !== employee.id)
                                        );
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
                          )}
                        </Card>
                        <p className="text-xs text-[#6B7280]">
                          Selected: {newAdminAssignedEmployees.length} {newAdminAssignedEmployees.length === 1 ? 'employee' : 'employees'}
                          {newAdminAssignedEmployees.length === 0 && ' (minimum 1 required)'}
                        </p>
                      </div>
                    )}

                    {/* Employee role info - automatic profile linking */}
                    {newAdminRole === 'viewer' && (
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
                    <Button
                      variant="outline"
                      onClick={handleCloseDialog}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-[#5B8DEF] hover:bg-[#4A7DD8] text-white"
                      onClick={editingAdminId ? handleUpdateAdmin : handleAddAdmin}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {editingAdminId ? 'Update User' : 'Create User'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Separator className="bg-[#E5E7EB]" />

            {/* Admin List */}
            <div className="space-y-3">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-[#E5E7EB] bg-white hover:bg-[#F9FAFB] transition-colors"
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <p className="text-base font-medium text-black">
                        {admin.name}
                      </p>
                      <Badge className={getRoleBadgeColor(admin.role)}>
                        {getRoleDisplayName(admin.role)}
                      </Badge>
                      {admin.role === 'manager' && admin.assignedEmployees && (
                        <Badge variant="outline" className="border-[#EFB74A] text-[#EFB74A]">
                          {admin.assignedEmployees.length} employees
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-[#6B7280]">
                      {admin.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#5B8DEF] hover:text-[#4A7DD8] hover:bg-[#E9F2FF]"
                      onClick={() => handleOpenEditAdmin(admin.id)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[#EF4444] hover:text-[#DC2626] hover:bg-[#FEF2F2]"
                      onClick={() => setAdminToRemove(admin.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Preferences Section */}
        <Card className="p-6 rounded-2xl shadow-sm border border-[#E5E7EB]">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-black mb-1">
                Preferences
              </h2>
              <p className="text-xs text-[#6B7280]">
                Customize your notification and display settings
              </p>
            </div>

            <div className="space-y-4">
              {/* Email Notifications Toggle */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3F4F6]">
                    <Bell className="h-5 w-5 text-[#6B7280]" />
                  </div>
                  <div>
                    <Label className="text-base cursor-pointer">
                      Email Notifications
                    </Label>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      Receive email updates about system events
                    </p>
                  </div>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                  className="data-[state=checked]:bg-[#FFCC00]"
                />
              </div>

              <Separator className="bg-[#E5E7EB]" />

              {/* Visa Expiry Alerts Toggle */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3F4F6]">
                    <Bell className="h-5 w-5 text-[#6B7280]" />
                  </div>
                  <div>
                    <Label className="text-base cursor-pointer">
                      Visa Expiry Alerts
                    </Label>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      Get notified when visas are about to expire
                    </p>
                  </div>
                </div>
                <Switch
                  checked={visaExpiryAlerts}
                  onCheckedChange={setVisaExpiryAlerts}
                  className="data-[state=checked]:bg-[#FFCC00]"
                />
              </div>

              <Separator className="bg-[#E5E7EB]" />

              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3F4F6]">
                    {darkMode ? (
                      <Moon className="h-5 w-5 text-[#6B7280]" />
                    ) : (
                      <Sun className="h-5 w-5 text-[#6B7280]" />
                    )}
                  </div>
                  <div>
                    <Label className="text-base cursor-pointer">
                      Dark Mode
                    </Label>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      Switch between light and dark theme
                    </p>
                  </div>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                  className="data-[state=checked]:bg-[#FFCC00]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                className="bg-black text-[#FFCC00] hover:bg-[#1F1F1F]"
                onClick={handleSavePreferences}
              >
                Save Preferences
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Remove Admin Confirmation Dialog */}
      <AlertDialog
        open={adminToRemove !== null}
        onOpenChange={() => setAdminToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Admin Access?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove admin privileges for{" "}
              {admins.find((a) => a.id === adminToRemove)?.name}. They will no
              longer be able to access admin features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#EF4444] hover:bg-[#DC2626]"
              onClick={() => adminToRemove && handleRemoveAdmin(adminToRemove)}
            >
              Remove Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}