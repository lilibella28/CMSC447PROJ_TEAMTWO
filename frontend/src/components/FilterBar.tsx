import { Search, Filter, Calendar } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";

interface FilterBarProps {
  onFilterChange?: (filters: any) => void;
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const activeFilters = [
    { label: "H-1B", type: "visaType" },
    { label: "Engineering", type: "department" },
  ];

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 bg-white border border-neutral-gray-200 rounded-lg mb-6">
      {/* Left side - Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <Select>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Visa Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="f1">F-1</SelectItem>
            <SelectItem value="opt">OPT</SelectItem>
            <SelectItem value="optstem">OPT STEM</SelectItem>
            <SelectItem value="h1b">H-1B</SelectItem>
            <SelectItem value="permanent">Permanent Resident</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="engineering">Engineering</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="hr">HR</SelectItem>
            <SelectItem value="research">Research</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Next 30 days</SelectItem>
            <SelectItem value="60">Next 60 days</SelectItem>
            <SelectItem value="90">Next 90 days</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-neutral-gray-500 hidden lg:inline">Active filters:</span>
            {activeFilters.map((filter, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="border-[#FFCC00] text-[#000000] bg-[#FFCC00]/10"
              >
                {filter.label}
                <button className="ml-1 text-xs">×</button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Right side - Search and Filter button */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 lg:flex-none">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-gray-500 h-4 w-4" />
          <Input 
            placeholder="Search employees..." 
            className="pl-10 w-full lg:w-64 bg-input-background border-neutral-gray-200"
          />
        </div>
        
        <Button variant="outline" className="border-neutral-gray-200">
          <Filter className="h-4 w-4 lg:mr-2" />
          <span className="hidden lg:inline">Filters</span>
        </Button>
      </div>
    </div>
  );
}