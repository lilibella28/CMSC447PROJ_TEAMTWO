import { useState, useEffect } from "react";
import { StatCard } from "./StatCard";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { MissingDatesWarningBanner } from "./MissingDatesWarningBanner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Plus,
  Download,
  AlertTriangle,
  Upload,
  LayoutDashboard,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Search,
  RefreshCw,
  Mail,
  Edit,
  BookOpen,
} from "lucide-react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { fetchVisaCases, fetchStatistics, VisaCase } from "../../utils/dataService";
import { exportEmployeesToExcel, generateTimestampedFilename } from "../../utils/excelExport";
import { toast } from "sonner";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";
import { ReportingToolbar, ReportingMode } from "./ReportingToolbar";
import { User } from "../../utils/roles";

interface DashboardProps {
  onNavigateToAddEmployee?: () => void;
  onNavigateToImport?: () => void;
  onViewEmployee?: (employee: VisaCase) => void;
  onEditEmployee?: (employee: VisaCase) => void;
  onNavigate?: (page: string) => void;
  currentUser?: User;
}

export function Dashboard({
  onNavigateToAddEmployee,
  onNavigateToImport,
  onViewEmployee,
  onEditEmployee,
  onNavigate,
  currentUser,
}: DashboardProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [visaCases, setVisaCases] = useState<VisaCase[]>([]);
  const [statistics, setStatistics] = useState({
    activeVisas: 0,
    expiringWithin60Days: 0,
    expired: 0,
    pending: 0,
    totalVisas: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [visaTypeFilter, setVisaTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Reporting states
  const [reportStartDate, setReportStartDate] = useState<string | null>(null);
  const [reportEndDate, setReportEndDate] = useState<string | null>(null);
  const [reportMode, setReportMode] = useState<ReportingMode | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      console.log('📊 Dashboard: Starting to load data...');
      const [cases, stats] = await Promise.all([
        fetchVisaCases(),
        fetchStatistics(),
      ]);
      console.log('📊 Dashboard: Loaded', cases.length, 'visa cases');
      console.log('📊 Dashboard: Stats:', stats);
      setVisaCases(cases);
      setStatistics(stats);
    } catch (error) {
      console.error("❌ Dashboard: Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter visa cases by all filters
  const filteredVisaCases = visaCases.filter((visaCase) => {
    // Role-based filtering: Assistants only see assigned employees
    if (currentUser?.role === 'manager' && currentUser.assignedEmployees) {
      const isAssigned = currentUser.assignedEmployees.includes(visaCase.id);
      if (!isAssigned) {
        return false;
      }
    }

    // Search filter (name or email)
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      visaCase.employee.name.toLowerCase().includes(searchLower) ||
      visaCase.employee.email?.toLowerCase().includes(searchLower);

    // Department filter
    const matchesDepartment =
      departmentFilter === "all" ||
      visaCase.employee.department === departmentFilter;

    // Visa type filter
    const matchesVisaType =
      visaTypeFilter === "all" ||
      visaCase.visa_type === visaTypeFilter;

    // Status filter (from dropdown)
    const matchesStatusFilter =
      statusFilter === "all" ||
      visaCase.status === statusFilter;

    // Date range filter (from reporting toolbar)
    let matchesDateRange = true;
    if (reportStartDate && reportEndDate) {
      const expDate = new Date(visaCase.expiration_date);
      const startDate = new Date(reportStartDate);
      const endDate = new Date(reportEndDate);
      matchesDateRange = expDate >= startDate && expDate <= endDate;
    }

    // StatCard filter (takes precedence if set)
    let matchesStatCard = true;
    if (activeFilter === "active") {
      matchesStatCard = visaCase.status === "Active";
    } else if (activeFilter === "expiring") {
      matchesStatCard = visaCase.status === "Expiring Soon" || (visaCase.daysLeft > 0 && visaCase.daysLeft <= 60);
    } else if (activeFilter === "expired") {
      matchesStatCard = visaCase.status === "Expired" || visaCase.daysLeft < 0;
    } else if (activeFilter === "pending") {
      matchesStatCard = visaCase.status === "Processing" || visaCase.status === "Pending";
    }

    return matchesSearch && matchesDepartment && matchesVisaType && matchesStatusFilter && matchesDateRange && matchesStatCard;
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
  const sortedVisaCases = [...filteredVisaCases].sort((a, b) => {
    // First, sort by status priority
    const priorityA = getStatusPriority(a.status);
    const priorityB = getStatusPriority(b.status);
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    const daysA = a.daysLeft ?? Infinity;
  const daysB = b.daysLeft ?? Infinity;

  return daysA - daysB;
  });

  // Pagination
  const totalPages = Math.ceil(sortedVisaCases.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCases = sortedVisaCases.slice(startIndex, endIndex);

  // Reset to page 1 when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchQuery, departmentFilter, visaTypeFilter, statusFilter]);

  // Get unique values for filter dropdowns
  const allDepartments = Array.isArray(visaCases) ? Array.from(
    new Set(visaCases.map((vc) => vc.employee.department))
  ).sort() : [];

  const allVisaTypes = Array.isArray(visaCases) ? Array.from(
    new Set(visaCases.map((vc) => vc.visa_type))
  ).sort() : [];

  // Destructure statistics
  const { activeVisas, expiringWithin60Days, expired, pending, totalVisas } = statistics;

  // Handle StatCard filter click
  const handleFilterClick = (filterType: string | null) => {
    // Toggle filter: if clicking the same filter, clear it; otherwise set new filter
    setActiveFilter(activeFilter === filterType ? null : filterType);
  };

 
  // Get status badge style
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

  
  // Prepare chart data
  const visaTypeData = Array.isArray(visaCases) ? Object.entries(
    visaCases.reduce((acc, vc) => {
      acc[vc.visa_type] = (acc[vc.visa_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value })) : [];

  const statusData = Array.isArray(visaCases) ? Object.entries(
    visaCases.reduce((acc, vc) => {
      acc[vc.status] = (acc[vc.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value })) : [];

  const COLORS = ["#5B8DEF", "#69C4A6", "#EFB74A", "#B8A6E8", "#9EA6B8"];

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5B8DEF] mx-auto mb-4"></div>
              <p className="text-[#6B7280]">Loading dashboard data...</p>
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <LayoutDashboard className="h-7 w-7 text-[#5B8DEF]" />
                <h1 className="text-[#1E1E1E]">Dashboard Overview</h1>
              </div>
              <p className="text-[#4A4A4A]">
                Overview of employees and visa case statuses.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={onNavigateToImport}
                variant="outline"
                className="border-[#5B8DEF] text-[#5B8DEF] hover:bg-[#E9F2FF] flex-1 md:flex-none"
              >
                <Upload className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Import Excel</span>
              </Button>
              <Button
                onClick={() => {
                  setIsDownloading("export");
                  exportEmployeesToExcel(sortedVisaCases, generateTimestampedFilename("visa_cases")).then(() => {
                    setIsDownloading(null);
                  });
                }}
                variant="outline"
                className="border-[#E1E1E1] flex-1 md:flex-none"
                disabled={isDownloading === "export"}
              >
                {isDownloading === "export" ? (
                  <RefreshCw className="h-4 w-4 md:mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 md:mr-2" />
                )}
                <span className="hidden md:inline">Export Excel</span>
              </Button>
              <Button
                onClick={onNavigateToAddEmployee}
                className="bg-black text-[#FFCC00] hover:bg-neutral-gray-900 flex-1 md:flex-none"
              >
                <Plus className="h-4 w-4 md:mr-2" />
                <span className="hidden sm:inline">New Case</span>
              </Button>
            </div>
          </div>
          <div className="h-[1px] bg-[#E5E5E5]" />
        </div>

      

        {/* Alert Banner */}
        {expiringWithin60Days > 0 && (
          <Alert className="mb-6 border-[#F59E0B] bg-[#FFF7E6]">
            <AlertTriangle className="h-4 w-4 text-[#F59E0B] flex-shrink-0" />
            <AlertDescription className="text-[#92400E] text-sm">
              <strong>{expiringWithin60Days} visas</strong> expiring within 60 days. Review and notify employees.
            </AlertDescription>
          </Alert>
        )}

        {/* Missing Dates Warning Banner */}
        <MissingDatesWarningBanner
          onNavigateToEmployee={(employeeId) => {
            // Find the employee and navigate to their profile
            const employee = visaCases.find(vc => vc.id === employeeId);
            if (employee && onViewEmployee) {
              onViewEmployee(employee);
            }
          }}
          showDismissAll={true}
          maxVisible={3}
        />

        {/* Case Summary Metrics */}
        <div className="mb-8">
          <h2 className="text-[#1E1E1E] mb-4">Case Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Active Visas"
              value={activeVisas}
              variant="default"
              onClick={() => handleFilterClick("active")}
              isActive={activeFilter === "active"}
            />
            <StatCard
              title="Expiring ≤ 60 Days"
              value={expiringWithin60Days}
              variant="warning"
              badge={{ text: "Alert", variant: "warning" }}
              onClick={() => handleFilterClick("expiring")}
              isActive={activeFilter === "expiring"}
            />
            <StatCard
              title="Expired"
              value={expired}
              variant="error"
              badge={{
                text: "Action Required",
                variant: "destructive",
              }}
              onClick={() => handleFilterClick("expired")}
              isActive={activeFilter === "expired"}
            />
            <StatCard
              title="Pending"
              value={pending}
              variant="default"
              badge={{ text: "In Process", variant: "secondary" }}
              onClick={() => handleFilterClick("pending")}
              isActive={activeFilter === "pending"}
            />
            <StatCard
              title="Total Visas"
              value={totalVisas}
              variant="default"
              onClick={() => handleFilterClick(null)}
              isActive={activeFilter === null}
            />
          </div>
          {activeFilter && (
            <div className="mt-3 text-sm text-[#6B7280]">
              Showing:{" "}
              <span className="font-medium text-[#5B8DEF]">
                {activeFilter === "active" && "Active Cases"}
                {activeFilter === "expiring" && "Expiring Cases"}
                {activeFilter === "expired" && "Expired Cases"}
                {activeFilter === "pending" && "Pending Cases"}
              </span>
              {" "}({sortedVisaCases.length} cases)
            </div>
          )}
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

        {/* Employee List Table */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#1E1E1E]">Employee List</h2>
            <div className="text-sm text-[#6B7280]">
              {sortedVisaCases.length} {sortedVisaCases.length === 1 ? 'case' : 'cases'}
            </div>
          </div>

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
                  {paginatedCases.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-12 text-[#6B7280]">
                        {isLoading ? (
                          <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5B8DEF]"></div>
                            <p>Loading employees...</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-3">
                            <AlertTriangle className="h-12 w-12 text-[#F59E0B]" />
                            <p className="text-[#1E1E1E]">No employees found</p>
                            <p className="text-sm">There are no visa cases to display.</p>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedCases.map((employee, index) => (
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
                            <Edit className="h-4 w-4" />
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
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card className="mt-4 border-[#E5E5E5] bg-[#F8F9FA]">
              <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-[#4A4A4A]">
                  Showing{" "}
                  <span className="font-medium text-[#1E1E1E]">
                    {startIndex + 1}–{Math.min(endIndex, sortedVisaCases.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-[#1E1E1E]">
                    {sortedVisaCases.length}
                  </span>{" "}
                  cases
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
          )}
        </div>

       


        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[#E5E5E5]">
          <p className="text-xs text-[#6B7280] text-center">
            UMBC Visa Management System — Internal HR Use Only
          </p>
        </div>
      </div>
    </div>
  );
}