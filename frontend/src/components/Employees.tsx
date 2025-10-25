import { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Mail, Phone, MapPin, Calendar, Search, Eye } from "lucide-react";
import { VisaCase } from "./DataTable";

interface EmployeesProps {
  onViewEmployee?: (employee: VisaCase) => void;
}

// Mock data - same as Dashboard but organized by department
const mockEmployees: VisaCase[] = [
  {
    id: "1",
    employee: { name: "Fatima Al-Rashid", department: "Finance" },
    visaType: "F-1",
    status: "Expired",
    expirationDate: "2024-09-20",
    daysLeft: -42,
  },
  {
    id: "7",
    employee: { name: "Kenji Nakamura", department: "Finance" },
    visaType: "OPT",
    status: "Active",
    expirationDate: "2025-01-15",
    daysLeft: 73,
  },
  {
    id: "12",
    employee: { name: "Anastasia Volkov", department: "Finance" },
    visaType: "Permanent Resident",
    status: "Active",
    expirationDate: "2027-03-20",
    daysLeft: 863,
  },
  {
    id: "2",
    employee: { name: "Chen Wei", department: "Engineering" },
    visaType: "OPT",
    status: "Expired",
    expirationDate: "2024-10-15",
    daysLeft: -17,
  },
  {
    id: "6",
    employee: { name: "Sofia Petrov", department: "Engineering" },
    visaType: "H-1B",
    status: "Active",
    expirationDate: "2024-12-20",
    daysLeft: 47,
  },
  {
    id: "10",
    employee: { name: "Isabella Rodriguez", department: "Engineering" },
    visaType: "H-1B",
    status: "Active",
    expirationDate: "2025-08-15",
    daysLeft: 285,
  },
  {
    id: "3",
    employee: { name: "Maria Gonzalez", department: "Marketing" },
    visaType: "H-1B",
    status: "Active",
    expirationDate: "2024-11-15",
    daysLeft: 12,
  },
  {
    id: "8",
    employee: { name: "Aisha Okonkwo", department: "Marketing" },
    visaType: "F-1",
    status: "Active",
    expirationDate: "2025-03-10",
    daysLeft: 127,
  },
  {
    id: "13",
    employee: { name: "Diego Morales", department: "Marketing" },
    visaType: "H-1B",
    status: "Active",
    expirationDate: "2025-07-08",
    daysLeft: 247,
  },
  {
    id: "4",
    employee: { name: "Raj Patel", department: "Sales" },
    visaType: "OPT STEM",
    status: "Active",
    expirationDate: "2024-11-25",
    daysLeft: 22,
  },
  {
    id: "9",
    employee: { name: "Viktor Kozlov", department: "Sales" },
    visaType: "OPT STEM",
    status: "Active",
    expirationDate: "2025-04-05",
    daysLeft: 153,
  },
  {
    id: "14",
    employee: { name: "Priya Sharma", department: "Sales" },
    visaType: "F-1",
    status: "Active",
    expirationDate: "2025-06-12",
    daysLeft: 221,
  },
  {
    id: "5",
    employee: { name: "Olumide Adebayo", department: "HR" },
    visaType: "F-1",
    status: "Processing",
    expirationDate: "2024-11-30",
    daysLeft: 27,
  },
  {
    id: "11",
    employee: { name: "Samuel Okafor", department: "HR" },
    visaType: "Permanent Resident",
    status: "Active",
    expirationDate: "2026-11-30",
    daysLeft: 753,
  },
];

export function Employees({ onViewEmployee }: EmployeesProps) {
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default";
      case "Expired":
        return "destructive";
      case "Processing":
        return "secondary";
      default:
        return "default";
    }
  };

  // Filter employees based on search and filters
  const filteredEmployees = mockEmployees.filter((employee) => {
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
    new Set(mockEmployees.map((emp) => emp.employee.department))
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
            Showing: <span className="font-semibold text-black">{filteredEmployees.length}</span> of {mockEmployees.length} employees
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
        {filteredEmployees.length === 0 ? (
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

              {/* Employee Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {departments[department].map((employee) => (
                  <Card key={employee.id} className="p-5 hover:shadow-md hover:bg-[#F3F4F6] transition-all duration-200">
                    {/* Employee Name & Status */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-black">
                          {employee.employee.name}
                        </h3>
                        <p className="text-sm text-neutral-gray-500">
                          {employee.employee.department}
                        </p>
                      </div>
                      <Badge variant={getStatusVariant(employee.status)}>
                        {employee.status}
                      </Badge>
                    </div>

                    {/* Employee Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-neutral-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-neutral-gray-400" />
                        <span>Visa Type: {employee.visaType}</span>
                      </div>
                      <div className="flex items-center text-sm text-neutral-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-neutral-gray-400" />
                        <span>Expires: {employee.expirationDate}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="mr-2 text-neutral-gray-600">Days left:</span>
                        <span
                          className={`font-semibold ${
                            employee.daysLeft < 0
                              ? "text-[#EF4444]"
                              : employee.daysLeft <= 30
                              ? "text-[#F59E0B]"
                              : employee.daysLeft <= 180
                              ? "text-[#F59E0B]"
                              : "text-[#10B981]"
                          }`}
                        >
                          {employee.daysLeft < 0 ? `Overdue by ${Math.abs(employee.daysLeft)}` : employee.daysLeft}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => onViewEmployee?.(employee)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs"
                      >
                        <Mail className="h-3 w-3 mr-1" />
                        Email
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
