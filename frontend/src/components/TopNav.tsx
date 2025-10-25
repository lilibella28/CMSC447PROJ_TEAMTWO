import { Search, Bell, User, LogOut, Menu, X, LayoutDashboard, Users, Building2, FileText, Settings } from "lucide-react";
import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

interface TopNavProps {
  onLogout?: () => void;
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export function TopNav({ onLogout, currentPage = "dashboard", onNavigate }: TopNavProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", page: "dashboard", active: currentPage === "dashboard" },
    { icon: Users, label: "Employees", page: "employees", active: currentPage === "employees" },
    { icon: Building2, label: "Departments", page: "departments", active: currentPage === "departments" },
    { icon: FileText, label: "Reports", page: "reports", active: currentPage === "reports" },
    { icon: Settings, label: "Settings", page: "settings", active: currentPage === "settings" },
  ];

  const handleNavClick = (e: React.MouseEvent, page: string) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      {/* Top Bar - Logo and Actions */}
      <div className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8">
        {/* Left side - Mobile menu + Logo */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold text-black">UMBC</h1>
            <div className="h-0.5 w-8 bg-[#FFCC00]"></div>
          </div>
          <span className="text-neutral-gray-500 hidden sm:inline">Admin Dashboard</span>
        </div>

        {/* Right side - Search, Notifications, Profile */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-gray-500 h-4 w-4" />
            <Input 
              placeholder="Search..." 
              className="pl-10 w-64 bg-input-background border-neutral-gray-200"
            />
          </div>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-status-error rounded-full"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Horizontal Navigation Bar */}
      <nav className="bg-[#000000] hidden lg:block">
        <div className="px-8">
          <ul className="flex items-center space-x-8">
            {navItems.map((item, index) => (
              <li key={index}>
                <a
                  href="#"
                  onClick={(e) => handleNavClick(e, item.page)}
                  className={`
                    flex items-center py-6 relative transition-colors duration-200
                    ${
                      item.active
                        ? "text-[#FFFFFF]"
                        : "text-[#FFFFFF] hover:text-[#FFCC00]"
                    }
                  `}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="ml-2">{item.label}</span>
                  
                  {/* Active state - 2px gold underline */}
                  {item.active && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFCC00]"></div>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <nav className="bg-[#000000] lg:hidden border-t border-[#444444]/30">
          <ul className="py-4">
            {navItems.map((item, index) => (
              <li key={index}>
                <a
                  href="#"
                  className={`
                    flex items-center px-4 py-3 transition-colors duration-200
                    ${
                      item.active
                        ? "text-[#FFFFFF] bg-[#111111]"
                        : "text-[#FFFFFF] hover:bg-[#111111]"
                    }
                  `}
                  onClick={(e) => {
                    handleNavClick(e, item.page);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="ml-2">{item.label}</span>
                  
                  {/* Active state - gold left border on mobile */}
                  {item.active && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FFCC00]"></div>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}