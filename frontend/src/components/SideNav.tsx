import { LayoutDashboard, Users, FileText, Settings, Building2, X } from "lucide-react";
import { Button } from "./ui/button";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Users, label: "Employees", active: false },
  { icon: Building2, label: "Departments", active: false },
  { icon: FileText, label: "Reports", active: false },
  { icon: Settings, label: "Settings", active: false },
];

interface SideNavProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function SideNav({ isOpen = false, onClose }: SideNavProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={onClose}
        />
      )}
      
      {/* Sidebar - Traditional Vertical Navigation */}
      <nav className={`
        fixed md:static inset-y-0 left-0 z-50
        w-[280px] bg-[#000000] flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* UMBC Wordmark Header */}
        <div className="pt-6 pb-6 px-6 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-xl text-[#FFFFFF]">UMBC</h1>
            <div className="h-0.5 w-12 bg-[#FFCC00] mt-1"></div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-white hover:text-white hover:bg-[#111111]"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Section Title */}
        <div className="px-6 pb-6">
          <h2 className="text-sm text-[#FFFFFF]">Visa Management</h2>
        </div>
        
        {/* Navigation Items - Vertical Stack */}
        <div className="flex-1 pt-6 pb-6">
          <ul>
            {navItems.map((item, index) => (
              <li key={index} className={index > 0 ? "mt-4" : ""}>
                <a
                  href="#"
                  className={`
                    flex items-center px-6 py-3 relative transition-all duration-200
                    ${
                      item.active
                        ? "text-[#FFFFFF]"
                        : "text-[#FFFFFF] hover:bg-[#111111]"
                    }
                  `}
                  onClick={() => onClose?.()}
                >
                  {/* Active state - 4px gold accent bar on left */}
                  {item.active && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FFCC00]"></div>
                  )}
                  
                  {/* Icon with 8px gap */}
                  <item.icon className="h-5 w-5 text-[#FFFFFF]" />
                  
                  {/* Label with 8px gap (gap-2 = 8px) */}
                  <span className="ml-2 text-[#FFFFFF]">{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}