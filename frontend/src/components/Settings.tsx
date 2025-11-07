import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
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
import { Mail, Lock, Plus, Trash2, Moon, Sun, Bell } from "lucide-react";
import { toast } from "sonner";

// Mock admin users data
const initialAdmins = [
  { id: "1", name: "Admin User", email: "admin@umbc.edu" },
  { id: "2", name: "Sarah Johnson", email: "sarah.johnson@umbc.edu" },
  { id: "3", name: "Michael Chen", email: "michael.chen@umbc.edu" },
];

export function Settings() {
  // Account Settings State
  const [name, setName] = useState("Admin User");
  const [email, setEmail] = useState("admin@umbc.edu");
  
  // Admin Management State
  const [admins, setAdmins] = useState(initialAdmins);
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [adminToRemove, setAdminToRemove] = useState<string | null>(null);
  
  // Preferences State
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [visaExpiryAlerts, setVisaExpiryAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Change Password Dialog State
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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
    
    const newAdmin = {
      id: String(admins.length + 1),
      name: newAdminName,
      email: newAdminEmail,
    };
    
    setAdmins([...admins, newAdmin]);
    setNewAdminName("");
    setNewAdminEmail("");
    setIsAddAdminOpen(false);
    
    toast.success("Admin added successfully!", {
      description: `${newAdminName} has been added as an admin.`,
      duration: 3000,
    });
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
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Admin</DialogTitle>
                    <DialogDescription>
                      Enter the details of the new administrator.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="adminName">Name</Label>
                      <Input
                        id="adminName"
                        value={newAdminName}
                        onChange={(e) => setNewAdminName(e.target.value)}
                        placeholder="Enter admin name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="adminEmail">Email</Label>
                      <Input
                        id="adminEmail"
                        type="email"
                        value={newAdminEmail}
                        onChange={(e) => setNewAdminEmail(e.target.value)}
                        placeholder="Enter admin email"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddAdminOpen(false);
                        setNewAdminName("");
                        setNewAdminEmail("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-black text-[#FFCC00] hover:bg-[#1F1F1F]"
                      onClick={handleAddAdmin}
                    >
                      Add Admin
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
                  <div className="flex-1">
                    <p className="text-base font-medium text-black">
                      {admin.name}
                    </p>
                    <p className="text-xs text-[#6B7280] mt-0.5">
                      {admin.email}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#EF4444] hover:text-[#DC2626] hover:bg-[#FEF2F2]"
                    onClick={() => setAdminToRemove(admin.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
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