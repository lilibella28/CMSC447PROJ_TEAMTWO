import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Search, Eye, Edit2, ChevronLeft, ChevronRight, Users, Upload, Plus, AlertCircle, RefreshCw, Mail, Trash2 } from "lucide-react";
import { fetchVisaCases, VisaCase } from "../../utils/dataService";
import { Card } from "./ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";
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
import { User } from "../../utils/roles";
import { toast } from "sonner";

interface EmployeesProps {
  onViewEmployee?: (employee: VisaCase) => void;
  onNavigateToAddEmployee?: () => void;
  onNavigateToImport?: () => void;
  onEditEmployee?: (employee: VisaCase) => void;
  onDeleteEmployee?: (employee: VisaCase) => void;
  currentUser?: User;
}

export function Employees({ onViewEmployee, onNavigateToAddEmployee, onNavigateToImport, onEditEmployee, onDeleteEmployee, currentUser }: EmployeesProps) {
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [visaTypeFilter, setVisaTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [employees, setEmployees] = useState<VisaCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Delete dialog state
  const [employeeToDelete, setEmployeeToDelete] = useState<VisaCase | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Load data on component mount
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

  // Get status badge variant and styles with UMBC color palette
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-[#5BB974] text-white border-[#5BB974] hover:bg-[#5BB974]/90";
      case "Expired":
        return "bg-[#D86464] text-white border-[#D86464] hover:bg-[#D86464]/90";
      case "Processing":
      case "Pending":
        return "bg-[#9E9E9E] text-white border-[#9E9E9E] hover:bg-[#9E9E9E]/90";
      case "Expiring Soon":
        return "bg-[#EFB74A] text-white border-[#EFB74A] hover:bg-[#EFB74A]/90";
      default:
        return "bg-[#6B7280] text-white border-[#6B7280]";
    }
  };

  // Format days remaining with color coding
  const formatDaysRemaining = (daysLeft: number) => {
    if (daysLeft < 0) {
      return {
        text: `${Math.abs(daysLeft)} days ago`,
        color: "text-[#D86464]", // Red for expired
        bgColor: "bg-[#FEE2E2]", // Light red background
        icon: <AlertCircle className="h-3.5 w-3.5" />,
      };
    } else if (daysLeft === 0) {
      return {
        text: "Expires today",
        color: "text-[#DC2626]", // Bright red
        bgColor: "bg-[#FEE2E2]",
        icon: <AlertCircle className="h-3.5 w-3.5" />,
      };
    } else if (daysLeft <= 30) {
      return {
        text: `${daysLeft} days`,
        color: "text-[#DC2626]", // Red for critical
        bgColor: "bg-[#FEE2E2]",
        icon: <AlertCircle className="h-3.5 w-3.5" />,
      };
    } else if (daysLeft <= 60) {
      return {
        text: `${daysLeft} days`,
        color: "text-[#D97706]", // Orange for warning
        bgColor: "bg-[#FEF3C7]",
        icon: <AlertCircle className="h-3.5 w-3.5" />,
      };
    } else if (daysLeft <= 90) {
      return {
        text: `${daysLeft} days`,
        color: "text-[#CA8A04]", // Yellow for caution
        bgColor: "bg-[#FEF9C3]",
        icon: null,
      };
    } else {
      return {
        text: `${daysLeft} days`,
        color: "text-[#4A4A4A]", // Gray for safe
        bgColor: "bg-[#F9FAFB]",
        icon: null,
      };
    }
  };

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter((employee) => {
    // Role-based filtering: Assistants only see assigned employees
    if (currentUser?.role === 'manager' && currentUser.assignedEmployees) {
      const isAssigned = currentUser.assignedEmployees.includes(employee.id);
      if (!isAssigned) {
        return false;
      }
    }

    // Search filter (name or email)
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      employee.employee.name.toLowerCase().includes(searchLower) ||
      employee.employee.email.toLowerCase().includes(searchLower);

    // Department filter
    const matchesDepartment =
      departmentFilter === "all" ||
      employee.employee.department === departmentFilter;

    // Visa type filter
    const matchesVisaType =
      visaTypeFilter === "all" ||
      employee.visa_type === visaTypeFilter;

    // Status filter
    const matchesStatus =
      statusFilter === "all" ||
      employee.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesVisaType && matchesStatus;
  });

  // Get status priority for sorting (lower number = higher priority)
  const getStatusPriority = (status: string): number => {
    switch (status) {
      case "Expired":
        return 1; // Highest priority - expired visas at top
      case "Expiring Soon":
        return 2; // Second priority - expiring within 90 days
      case "Processing":
      case "Pending":
        return 3; // Third priority - pending cases
      case "Active":
        return 4; // Lowest priority - active visas at bottom
      default:
        return 5; // Unknown statuses at very bottom
    }
  };

  // Sort by visa status priority first, then alphabetically by last name within each group
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    // First, sort by status priority
    const priorityA = getStatusPriority(a.status);
    const priorityB = getStatusPriority(b.status);
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // Within same priority group, sort alphabetically by last name
    const lastNameA = a.employee.name.split(" ").pop() || "";
    const lastNameB = b.employee.name.split(" ").pop() || "";
    return lastNameA.localeCompare(lastNameB);
  });

  // Pagination
  const totalPages = Math.ceil(sortedEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEmployees = sortedEmployees.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, departmentFilter, visaTypeFilter, statusFilter]);

  // Get unique values for filter dropdowns
  const allDepartments = Array.isArray(employees) ? Array.from(
    new Set(employees.map((emp) => emp.employee.department))
  ).sort() : [];

  const allVisaTypes = Array.isArray(employees) ? Array.from(
    new Set(employees.map((emp) => emp.visa_type))
  ).sort() : [];

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-7 w-7 text-[#5B8DEF]" />
                <h1 className="text-[#1E1E1E]">Employees Directory</h1>
              </div>
              <p className="text-[#4A4A4A]">
                All current employees with active or pending visa records.
              </p>
            </div>
            <Button
              onClick={onNavigateToAddEmployee}
              className="bg-black text-[#FFCC00] hover:bg-neutral-gray-900"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Case
            </Button>
          </div>
          <div className="h-[1px] bg-[#E5E5E5]" />
        </div>

        {/* Search & Filter Bar */}
        <Card className="mb-6 border-[#E5E5E5] sticky top-0 z-10 shadow-sm">
          <div className="p-4">
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Search Input */}
              <div className="relative flex-1 max-w-[400px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by name or email…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 bg-white border-[#E1E1E1] rounded-lg focus-visible:ring-[#5B8DEF]"
                />
              </div>

              {/* Department Filter */}
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-full lg:w-[200px] h-10 bg-white border-[#E1E1E1] rounded-lg">
                  <SelectValue placeholder="Department" />
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

              {/* Visa Type Filter */}
              <Select value={visaTypeFilter} onValueChange={setVisaTypeFilter}>
                <SelectTrigger className="w-full lg:w-[180px] h-10 bg-white border-[#E1E1E1] rounded-lg">
                  <SelectValue placeholder="Visa Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Visa Types</SelectItem>
                  {allVisaTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-[180px] h-10 bg-white border-[#E1E1E1] rounded-lg">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Expiring Soon">Expiring Soon</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Employee Table */}
        {isLoading ? (
          <Card className="border-[#E5E5E5]">
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5B8DEF] mx-auto mb-4"></div>
                <p className="text-[#6B7280]">Loading employees...</p>
              </div>
            </div>
          </Card>
        ) : sortedEmployees.length === 0 ? (
          // Empty State
          <Card className="border-[#E5E5E5]">
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <Users className="h-16 w-16 text-[#D1D5DB] mb-4" />
              <h3 className="text-[#1E1E1E] mb-2">No employees found matching your filters.</h3>
              <p className="text-sm text-[#6B7280] mb-6">
                Try adjusting your search or filter criteria, or upload employee data.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setDepartmentFilter("all");
                    setVisaTypeFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
                <Button
                  onClick={onNavigateToImport}
                  className="bg-[#5B8DEF] hover:bg-[#4A7DD8] text-white"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Employee Data
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <>
            {/* Table Card */}
            <Card className="border-[#E5E5E5] overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F1F3F5] hover:bg-[#F1F3F5] border-b border-[#E5E5E5]">
                      <TableHead className="text-[#1E1E1E]">Employee</TableHead>
                      <TableHead className="text-[#1E1E1E]">Department</TableHead>
                      <TableHead className="text-[#1E1E1E]">Visa Type</TableHead>
                      <TableHead className="text-[#1E1E1E]">Status</TableHead>
                      <TableHead className="text-[#1E1E1E]">Expiration Date</TableHead>
                      <TableHead className="text-[#1E1E1E]">Days Left</TableHead>
                      <TableHead className="text-[#1E1E1E]">Priority / Extension Label</TableHead>
                      <TableHead className="text-[#1E1E1E] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEmployees.map((employee, index) => (
                      <TableRow
                        key={employee.id}
                        className={`
                          border-b border-[#E5E5E5] transition-colors cursor-pointer
                          ${index % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"}
                          hover:bg-[#E9F2FF]
                        `}
                        onClick={() => onViewEmployee?.(employee)}
                      >
                        <TableCell>
                          <span className="text-sm text-[#1E1E1E] font-medium">
                            {employee.employee.name}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-[#4A4A4A]">
                          {employee.employee.department}
                        </TableCell>
                        <TableCell className="text-sm text-[#4A4A4A]">
                          {employee.visa_type}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeStyle(employee.status)}>
                            {employee.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-[#4A4A4A]">
                          {new Date(employee.expiration_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const daysInfo = formatDaysRemaining(employee.daysLeft);
                            return (
                              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${daysInfo.bgColor}`}>
                                {daysInfo.icon}
                                <span className={`text-sm font-medium ${daysInfo.color}`}>
                                  {daysInfo.text}
                                </span>
                              </div>
                            );
                          })()}
                        </TableCell>
                        <TableCell className="text-sm text-[#4A4A4A]">
                          {employee.status === "Expired" ? (
                            <span className="text-[#DC2626] font-medium">Highest Priority</span>
                          ) : employee.daysLeft < 60 && employee.daysLeft >= 0 ? (
                            <span className="text-[#F59E0B] font-medium">Extension Needed</span>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-[#5B8DEF] hover:text-[#4A7DD8] hover:bg-[#E9F2FF]"
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewEmployee?.(employee);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-[#5B8DEF] hover:text-[#4A7DD8] hover:bg-[#E9F2FF]"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEditEmployee?.(employee);
                              }}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-[#5B8DEF] hover:text-[#4A7DD8] hover:bg-[#E9F2FF]"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `mailto:${employee.employee.email}`;
                              }}
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-[#5B8DEF] hover:text-[#4A7DD8] hover:bg-[#E9F2FF]"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEmployeeToDelete(employee);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Pagination Footer */}
            <Card className="mt-4 border-[#E5E5E5] bg-[#F8F9FA]">
              <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-[#4A4A4A]">
                  Showing{" "}
                  <span className="font-medium text-[#1E1E1E]">
                    {startIndex + 1}–{Math.min(endIndex, sortedEmployees.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-[#1E1E1E]">
                    {sortedEmployees.length}
                  </span>{" "}
                  employees
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-9 px-3 border-[#E1E1E1]"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className={`h-9 w-9 p-0 ${
                            currentPage === pageNum
                              ? "bg-[#5B8DEF] text-white hover:bg-[#4A7DD8]"
                              : "border-[#E1E1E1]"
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-9 px-3 border-[#E1E1E1]"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the employee record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (employeeToDelete) {
                  onDeleteEmployee?.(employeeToDelete);
                  toast.success("Employee deleted successfully!");
                }
                setShowDeleteDialog(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );}