/**
 * User Switcher Component
 * Demo component to quickly switch between different user roles for testing
 */

import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import {
  Shield,
  Users,
  UserCog,
  RefreshCw,
  CheckCircle,
  ChevronDown,
} from 'lucide-react';
import { User, UserRole, getRoleDisplayName, getRoleBadgeColor } from '../../utils/roles';

interface DemoUser extends User {
  description: string;
  password: string; // For demo purposes only
}

const DEMO_USERS: DemoUser[] = [
  {
    id: '1',
    email: 'admin@umbc.edu',
    name: 'Sarah Martinez',
    role: 'administrator',
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    lastLogin: '2024-12-04T09:30:00Z',
    description: 'Full system access - can manage all employees, users, and settings',
    password: 'admin123',
  },
  {
    id: '2',
    email: 'assistant@umbc.edu',
    name: 'Michael Chen',
    role: 'assistant',
    isActive: true,
    createdAt: '2024-02-20T14:30:00Z',
    assignedEmployees: ['1', '2', '3'],
    lastLogin: '2024-12-04T08:20:00Z',
    description: 'Can view and manage 3 assigned employees only',
    password: 'assistant123',
  },
  {
    id: '3',
    email: 'laura.smith@umbc.edu',
    name: 'Laura Smith',
    role: 'employee',
    isActive: true,
    createdAt: '2024-04-05T09:00:00Z',
    employeeProfileId: '1',
    lastLogin: '2024-12-02T14:10:00Z',
    description: 'Can only view own employee profile (Laura Smith)',
    password: 'employee123',
  },
];

interface UserSwitcherProps {
  currentUser: User | null;
  onSwitchUser: (user: User) => void;
}

export function UserSwitcher({ currentUser, onSwitchUser }: UserSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectUser = (user: DemoUser) => {
    onSwitchUser(user);
    setIsOpen(false);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'administrator':
        return <Shield className="h-5 w-5" />;
      case 'assistant':
        return <Users className="h-5 w-5" />;
      case 'employee':
        return <UserCog className="h-5 w-5" />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'administrator':
        return 'text-[#5B8DEF]';
      case 'assistant':
        return 'text-[#EFB74A]';
      case 'employee':
        return 'text-[#9E9E9E]';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-[#E5E5E5] hover:bg-[#F8F9FA] gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Switch Demo User</span>
          <span className="sm:hidden">Switch</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Switch Demo User</DialogTitle>
          <DialogDescription>
            Select a demo user to test different role-based access levels and permissions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {DEMO_USERS.map((user) => (
            <Card
              key={user.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md border-2 ${
                currentUser?.id === user.id
                  ? 'border-[#5B8DEF] bg-[#E9F2FF]'
                  : 'border-[#E5E5E5] hover:border-[#D1D5DB]'
              }`}
              onClick={() => handleSelectUser(user)}
            >
              <div className="flex items-start gap-4">
                {/* Role Icon */}
                <div
                  className={`p-3 rounded-lg ${
                    user.role === 'administrator'
                      ? 'bg-[#E9F2FF]'
                      : user.role === 'assistant'
                      ? 'bg-[#FFF9EB]'
                      : 'bg-[#F5F5F5]'
                  }`}
                >
                  <div className={getRoleColor(user.role)}>
                    {getRoleIcon(user.role)}
                  </div>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-[#1E1E1E]">{user.name}</h3>
                    {currentUser?.id === user.id && (
                      <CheckCircle className="h-4 w-4 text-[#5BB974]" />
                    )}
                  </div>
                  <p className="text-sm text-[#6B7280] mb-2">{user.email}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {getRoleDisplayName(user.role)}
                    </Badge>
                    {user.role === 'assistant' && user.assignedEmployees && (
                      <Badge variant="outline" className="border-[#EFB74A] text-[#EFB74A]">
                        {user.assignedEmployees.length} employees assigned
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-[#4A4A4A]">{user.description}</p>
                </div>

                {/* Demo Credentials */}
                <div className="hidden md:block text-right">
                  <p className="text-xs text-[#6B7280] mb-1">Demo Login</p>
                  <div className="bg-[#F8F9FA] rounded px-2 py-1 border border-[#E5E5E5]">
                    <p className="text-xs font-mono text-[#4A4A4A]">{user.email}</p>
                    <p className="text-xs font-mono text-[#4A4A4A]">{user.password}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="bg-[#FFF9EB] border border-[#EFB74A] rounded-lg p-4">
          <p className="text-sm text-[#7A4C00]">
            <strong>Note:</strong> This is a demo feature for testing purposes. In production,
            users would log in normally and cannot switch between accounts.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { DEMO_USERS };
export type { DemoUser };