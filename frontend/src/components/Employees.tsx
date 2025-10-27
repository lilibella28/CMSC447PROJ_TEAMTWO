import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Search, Eye, Mail, Phone, Calendar, MapPin, Briefcase } from "lucide-react";
import { fetchVisaCases, VisaCase } from "../../utils/dataService.ts";

interface EmployeesProps {
  onViewEmployee?: (employee: VisaCase) => void;
}

export function Employees({ onViewEmployee }: EmployeesProps) {
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [employees, setEmployees] = useState<VisaCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from CSV on component mount
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      const data = await fetchVisaCases();
      setEmployees(data);
    } catch (error) {
      console.error("Error loading employees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "outline"; // Use outline so we can override with custom colors
      case "Expired":
        return "destructive";
      case "Processing":
        return "outline"; // Use outline so we can override with custom colors
      default:
        return "default";
    }
  };

  // Get status badge custom styles (matching Dashboard)
  const getStatusBadgeStyle = (status: string) => {
    if (status === "Active") {
      return "!bg-[#10B981] !text-white !border-[#10B981] hover:!bg-[#10B981]/90";
    }
    if (status === "Processing") {
      return "!bg-[#3B82F6] !text-white !border-[#3B82F6] hover:!bg-[#3B82F6]/90";
    }
    return "";
  };

  // Get days left color
  const getDaysLeftColor = (daysLeft: number) => {
    if (daysLeft < 0) return "text-[#EF4444]"; // Red - Expired
    if (daysLeft <= 30) return "text-[#F59E0B]"; // Orange - Critical
    if (daysLeft <= 180) return "text-[#F59E0B]"; // Orange - Warning
    return "text-[#10B981]"; // Green - Safe
  };

  // Format days left display
  const formatDaysLeft = (daysLeft: number) => {
    if (daysLeft < 0) return `Overdue by ${Math.abs(daysLeft)} days`;
    return `${daysLeft} days`;
  };

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter((employee) => {
    // Search filter (name match)
    const matchesSearch = 
      searchQuery === "" ||
      employee.employee.name.toLowerCase().includes(searchQuery.toLowerCase());

    // Department filter
    const matchesDepartment =
      departmentFilter === "all" ||
      employee.employee.department === departmentFilter;

    // Status filter
    const matchesStatus =
      statusFilter === "all" ||
      employee.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Group filtered employees by department
  const departments = filteredEmployees.reduce((acc, employee) => {
    const dept = employee.employee.department;
    if (!acc[dept]) {
      acc[dept] = [];
    }
    acc[dept].push(employee);
    return acc;
  }, {} as Record<string, VisaCase[]>);

  // Sort departments alphabetically
  const sortedDepartments = Object.keys(departments).sort();

  // Get unique departments for filter dropdown
  const allDepartments = Array.from(
    new Set(employees.map((emp) => emp.employee.department))
  ).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-black">Employees</h1>
          <p className="text-neutral-gray-500 mt-1">
            View all employees organized by department
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-neutral-gray-500">
            Showing: <span className="font-semibold text-black">{filteredEmployees.length}</span> of {employees.length} employees
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1 md:max-w-[320px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-gray-500 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-lg border border-[#D1D5DB] bg-white focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20"
          />
        </div>

        {/* Department Filter */}
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-full md:w-[200px] h-10 rounded-lg border border-[#D1D5DB] bg-white focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {allDepartments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[160px] h-10 rounded-lg border border-[#D1D5DB] bg-white focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Processing">Processing</SelectItem>
            <SelectItem value="Expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Departments */}
      <div className="space-y-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-neutral-gray-500">Loading employees...</p>
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-gray-500">
              No employees found matching your search criteria.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setDepartmentFilter("all");
                setStatusFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          sortedDepartments.map((department) => (
            <div key={department}>
              {/* Department Header */}
              <div className="mb-4 pb-2 border-b-2 border-[#FFCC00]">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-black">{department}</h2>
                  <span className="text-sm text-neutral-gray-500">
                    {departments[department].length} {departments[department].length === 1 ? 'employee' : 'employees'}
                  </span>
                </div>
              </div>

              {/* Employee Stacked List */}
              <div className="bg-white rounded-lg border border-neutral-gray-200 divide-y divide-neutral-gray-200">
                {departments[department].map((employee, index) => (
                  <div
                    key={employee.id}
                    className="group hover:bg-[#FFFBEB] transition-colors duration-150"
                  >
                    <div className="p-4 md:p-5">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Left Section - Employee Info */}
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          {/* Avatar Circle */}
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 rounded-full bg-[#FFCC00] flex items-center justify-center">
                              <span className="text-black font-semibold text-lg">
                                {employee.employee.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </span>
                            </div>
                          </div>

                          {/* Employee Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="min-w-0">
                                <h3 className="font-semibold text-black truncate">
                                  {employee.employee.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Briefcase className="h-3.5 w-3.5 text-neutral-gray-400 flex-shrink-0" />
                                  <span className="text-sm text-neutral-gray-600 truncate">
                                    {employee.employee.department}
                                  </span>
                                </div>
                              </div>
                              <Badge 
                                variant={getStatusVariant(employee.status)} 
                                className={`flex-shrink-0 ${getStatusBadgeStyle(employee.status)}`}
                              >
                                {employee.status}
                              </Badge>
                            </div>

                            {/* Visa Information Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                              <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-3.5 w-3.5 text-neutral-gray-400 flex-shrink-0" />
                                <span className="text-neutral-gray-600">
                                  <span className="text-neutral-gray-500">Visa:</span> {employee.visaType}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-3.5 w-3.5 text-neutral-gray-400 flex-shrink-0" />
                                <span className="text-neutral-gray-600">
                                  <span className="text-neutral-gray-500">Expires:</span> {employee.expirationDate}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Section - Days Left & Actions */}
                        <div className="flex items-center justify-between lg:justify-end gap-4 lg:gap-6 flex-shrink-0">
                          {/* Days Left Badge */}
                          <div className="text-center">
                            <div className="text-xs text-neutral-gray-500 mb-1">Days Left</div>
                            <div className={`font-semibold ${getDaysLeftColor(employee.daysLeft)}`}>
                              {formatDaysLeft(employee.daysLeft)}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="group-hover:border-[#FFCC00] group-hover:bg-white transition-colors"
                              onClick={() => onViewEmployee?.(employee)}
                            >
                              <Eye className="h-4 w-4 md:mr-1.5" />
                              <span className="hidden md:inline">View</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="group-hover:border-[#FFCC00] group-hover:bg-white transition-colors"
                            >
                              <Mail className="h-4 w-4 md:mr-1.5" />
                              <span className="hidden md:inline">Email</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

