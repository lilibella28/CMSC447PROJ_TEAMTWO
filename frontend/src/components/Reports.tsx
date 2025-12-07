import { useState, useEffect, useMemo } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { 
  Calendar, 
  Download, 
  FileText, 
  Users, 
  AlertCircle, 
  Clock,
  Filter,
  ArrowUpDown,
  ChevronDown,
  FileSpreadsheet,
  Edit2,
  Mail,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { exportEmployeesToExcel, generateTimestampedFilename } from "../../utils/excelExport";
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
import { fetchEmployees, Employee } from "../../utils/dataService";
import { calculateVisaStatus, calculateDaysRemaining } from "../../utils/visaStatusUtils";
import { ReportingToolbar, ReportingMode } from "./ReportingToolbar";
import { toast } from "sonner";

// Visa Type color palette (neutral analytical scheme)
const VISA_TYPE_COLORS: Record<string, string> = {
  "F-1": "#69C4A6",
  "OPT": "#69C4A6",
  "OPT STEM": "#69C4A6",
  "H-1B": "#5B8DEF",
  "Permanent Resident": "#9EA6B8",
};

// Gender color palette
const GENDER_COLORS: Record<string, string> = {
  "Female": "#B8A6E8",
  "Male": "#6C8EBF",
  "Non-binary": "#D9D9D9",
  "Prefer not to say": "#D9D9D9",
  "Other": "#D9D9D9",
};

// Define VisaCase type based on the structure used in Dashboard
interface VisaCase {
  id: string;
  employee: {
    name: string;
    email: string;
    department: string;
  };
  visa_type: string;
  status: string;
  expiration_date: string;
  daysLeft: number;
}

interface ReportsProps {
  onViewEmployee?: (employee: VisaCase) => void;
  onEditEmployee?: (employee: VisaCase) => void;
}

export function Reports({ onViewEmployee, onEditEmployee }: ReportsProps) {
  const [reportPeriod, setReportPeriod] = useState("fiscal-year");
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([]);
  const [visa_typeFilter, setVisaTypeFilter] = useState<string[]>([]);
  const [countryFilter, setCountryFilter] = useState<string[]>([]);
  const [prStatusFilter, setPrStatusFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [employeesData, setEmployeesData] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  
  // Date range filtering states
  const [reportStartDate, setReportStartDate] = useState<string | null>(null);
  const [reportEndDate, setReportEndDate] = useState<string | null>(null);
  const [reportMode, setReportMode] = useState<ReportingMode | null>(null);

  // Load employee data
  useEffect(() => {
    async function loadEmployees() {
      try {
        const data = await fetchEmployees();
        setEmployeesData(data);
      } catch (error) {
        console.error("Error loading employees:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadEmployees();
  }, []);

  // Transform employee data for reports
  const reportData = Array.isArray(employeesData) ? employeesData.map((emp) => {
    // Calculate computed status and days remaining
    const hasPendingApplication = !!emp.pendingVisaApplication;
    const daysLeft = calculateDaysRemaining(emp.expiration_date);
    const computedStatus = calculateVisaStatus(emp.expiration_date, hasPendingApplication);
    const { first_name, last_name } = emp;
    return {
      id: emp.id,
      name:`${first_name} ${last_name}`,
      department: emp.department,
      title: emp.employee_title || "N/A",
      case_type: emp.case_type || "N/A",
      filedBy: emp.visaFiledBy,
      start_date: emp.visa_start_date || emp.start_date,
      expiration_date: emp.expiration_date,
      number_of_dependents: emp.number_of_dependents,
      prStatus: emp.permanentResidency?.currentStatus || "Not Started",
      country: emp.country_of_birth || emp.nationality,
      visa_type: emp.visa_type,
      status: computedStatus, // Use computed status instead of stored status
      daysLeft,
      notes: emp.general_notes || "",
    };
  }) : [];

  // Apply date range filter first (from report generation)
  const dateRangeFilteredData = reportData.filter((item) => {
    if (!reportStartDate || !reportEndDate) return true;
    
    const expDate = new Date(item.expiration_date);
    const start_date = new Date(reportStartDate);
    const endDate = new Date(reportEndDate);
    
    return expDate >= start_date && expDate <= endDate;
  });

  // Filter data (apply additional filters on top of date range filter)
  const filteredData = dateRangeFilteredData.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment =
      departmentFilter.length === 0 || departmentFilter.includes(item.department);
    
    const matchesVisaType =
      visa_typeFilter.length === 0 || visa_typeFilter.includes(item.visa_type);
    
    const matchesCountry =
      countryFilter.length === 0 || countryFilter.includes(item.country);
    
    const matchesPrStatus =
      prStatusFilter.length === 0 || prStatusFilter.includes(item.prStatus);

    return matchesSearch && matchesDepartment && matchesVisaType && matchesCountry && matchesPrStatus;
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aVal = a[sortColumn as keyof typeof a];
    const bVal = b[sortColumn as keyof typeof b];
    
    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  // Handle column sort
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Calculate KPIs
  const totalEmployees = filteredData.length;
  const activeVisas = filteredData.filter((d) => d.status === "Active").length;
  const expiringWithin60Days = filteredData.filter((d) => d.status === "Expiring Soon" || (d.daysLeft > 0 && d.daysLeft <= 60)).length;
  const expiredVisas = filteredData.filter((d) => d.status === "Expired" || d.daysLeft < 0).length;
  const pendingVisas = filteredData.filter((d) => d.status === "Processing" || d.status === "Pending").length;
  const activeH1B = filteredData.filter((d) => d.visa_type === "H-1B" && d.status === "Active").length;
  const pendingPR = filteredData.filter((d) => 
    d.prStatus === "Filed" || d.prStatus === "Awaiting Response"
  ).length;
  const expiringNext90 = filteredData.filter((d) => d.daysLeft > 0 && d.daysLeft <= 90).length;

  // Chart data - Case Type distribution (use date range filtered data)
  const case_typeData = Object.entries(
    dateRangeFilteredData.reduce((acc, item) => {
      const case_type = item.case_type || "Other";
      acc[case_type] = (acc[case_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Filed By distribution (use date range filtered data)
  const filedByData = Object.entries(
    dateRangeFilteredData.reduce((acc, item) => {
      acc[item.filedBy] = (acc[item.filedBy] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Expiration timeline - show based on report date range if selected, otherwise next 12 months
  const expirationTimeline = (() => {
    if (reportStartDate && reportEndDate) {
      // When a report is generated, show distribution across the selected date range
      const start = new Date(reportStartDate);
      const end = new Date(reportEndDate);
      const monthsDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
      const numMonths = Math.min(Math.max(monthsDiff, 1), 12); // Show at least 1 month, max 12

      return Array.from({ length: numMonths }, (_, i) => {
        const targetDate = new Date(start);
        targetDate.setMonth(targetDate.getMonth() + i);
        const monthName = targetDate.toLocaleString("en-US", { month: "short" });
        const year = targetDate.getFullYear();
        
        const count = dateRangeFilteredData.filter((emp) => {
          const expDate = new Date(emp.expiration_date);
          return (
            expDate.getMonth() === targetDate.getMonth() &&
            expDate.getFullYear() === targetDate.getFullYear()
          );
        }).length;
        
        return { month: `${monthName} ${year}`, count };
      });
    } else {
      // Default: show next 12 months
      return Array.from({ length: 12 }, (_, i) => {
        const targetDate = new Date();
        targetDate.setMonth(targetDate.getMonth() + i);
        const monthName = targetDate.toLocaleString("en-US", { month: "short" });
        const year = targetDate.getFullYear();
        
        const count = reportData.filter((emp) => {
          const expDate = new Date(emp.expiration_date);
          return (
            expDate.getMonth() === targetDate.getMonth() &&
            expDate.getFullYear() === targetDate.getFullYear()
          );
        }).length;
        
        return { month: `${monthName} ${year}`, count };
      });
    }
  })();

  // Employee Distribution Overview data
  // 1. Visa Type Breakdown (categorize F-1, OPT, OPT STEM as F1 group)
  const visa_typeDistribution = filteredData.reduce((acc, emp) => {
    let category = emp.visa_type;
    // Group F-1, OPT, OPT STEM together
    if (emp.visa_type === "F-1" || emp.visa_type === "OPT" || emp.visa_type === "OPT STEM") {
      category = "F-1";
    } else if (emp.visa_type === "H-1B") {
      category = "H-1B";
    } else if (emp.visa_type === "Permanent Resident") {
      category = "PR";
    }
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const visa_typeData = Object.entries(visa_typeDistribution).map(([name, count]) => {
    const percentage = filteredData.length > 0
      ? ((count / filteredData.length) * 100).toFixed(0)
      : '0';
    return { name, count, percentage: `${percentage}%` };
  });

  // 2. Gender Distribution
  const genderDistribution = filteredData.reduce((acc, emp) => {
    const gender = employeesData.find(e => e.id === emp.id)?.gender || "Prefer not to say";
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const genderData = Object.entries(genderDistribution).map(([name, count]) => {
    const percentage = filteredData.length > 0
      ? ((count / filteredData.length) * 100).toFixed(0)
      : '0';
    return { name, count, percentage: `${percentage}%` };
  });

  // 3. Department Breakdown
  const departmentDistribution = filteredData.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const departmentData = Object.entries(departmentDistribution)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count); // Sort by count descending

  const CHART_COLORS = {
    primary: "#5B8DEF",
    secondary: "#69C4A6",
    attention: "#EFB74A",
    critical: "#D86464",
  };

  const PR_STATUS_COLORS: Record<string, string> = {
    "Approved": "#5BB974",
    "Filed": "#EFB74A",
    "Awaiting Response": "#EFB74A",
    "Not Started": "#B1B1B1",
    "Denied": "#D86464",
  };

  // Get unique values for filters
  const uniqueDepartments = Array.from(new Set(reportData.map(d => d.department))).sort();
  const uniqueVisaTypes = Array.from(new Set(reportData.map(d => d.visa_type))).sort();
  const uniqueCountries = Array.from(new Set(reportData.map(d => d.country))).filter(Boolean).sort();
  const uniquePrStatuses = Array.from(new Set(reportData.map(d => d.prStatus))).sort();

  // Export functions
  const exportCSV = () => {
    const headers = ["Employee Name", "Department", "Title", "Case Type", "Filed By", "Start Date", "Expiration Date", "Dependents", "PR Status", "Country", "Notes"];
    const csvContent = [
      headers.join(","),
      ...sortedData.map(row => [
        `"${row.name}"`,
        `"${row.department}"`,
        `"${row.title}"`,
        `"${row.case_type}"`,
        `"${row.filedBy}"`,
        row.start_date,
        row.expiration_date,
        row.number_of_dependents,
        `"${row.prStatus}"`,
        `"${row.country}"`,
        `"${row.notes}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `USCIS_Compliance_Report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const exportPDF = () => {
    alert("PDF export functionality would be implemented here with a PDF library.");
  };

  const exportExcel = async () => {
    try {
      const filename = generateTimestampedFilename("USCIS_Compliance_Report");
      await exportEmployeesToExcel(employeesData, filename);
      
      toast.success("Excel file exported!", {
        description: `${filename} has been downloaded successfully.`,
        duration: 5000,
      });
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error("Excel export failed", {
        description: "Could not generate the Excel file. Please try again.",
        duration: 5000,
      });
    }
  };

  // Current timestamp
  const timestamp = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short"
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-[1440px] mx-auto px-6 py-6 space-y-6">
        
        {/* Header Section */}
        <div className="bg-white border-b border-[#E5E5E5] -mx-6 px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl text-[#1E1E1E]">USCIS Compliance Report</h1>
              <p className="text-sm text-[#4A4A4A] mt-1">Employee Visa & Residency Summary – UMBC</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
            </div>
          </div>
        </div>

        {/* Reporting Toolbar */}
        <div className="flex justify-end mb-6">
          <ReportingToolbar
            onGenerateReport={(start_date, endDate, mode) => {
              setReportStartDate(start_date);
              setReportEndDate(endDate);
              setReportMode(mode);
              
              // Filter data based on date range
              const start = new Date(start_date);
              const end = new Date(endDate);
              
              const filteredCount = reportData.filter((emp) => {
                const expDate = new Date(emp.expiration_date);
                return expDate >= start && expDate <= end;
              }).length;
              
              toast.success(`Report generated for ${mode === 'fiscal' ? 'Fiscal Year' : mode === 'academic' ? 'Academic Year' : mode === 'calendar' ? 'Calendar Year' : 'Custom Range'}`, {
                description: `${filteredCount} employees found with visa expiration dates in the range ${new Date(start_date).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`,
                duration: 5000,
              });
            }}
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Employees */}
          <Card className="p-5 bg-[#F7F8FA] border-[#E5E5E5]">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-[#6B6B6B]">Total Employees</p>
                <p className="text-[28px] text-[#1E1E1E]">{totalEmployees}</p>
              </div>
              <Users className="h-5 w-5 text-[#6B6B6B]" />
            </div>
          </Card>

          {/* Active H-1B Visas */}
          <Card className="p-5 bg-[#E9F2FF] border-[#5B8DEF]">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-[#0A3D91]">Active H-1B Visas</p>
                <p className="text-[28px] text-[#0A3D91]">{activeH1B}</p>
              </div>
              <FileText className="h-5 w-5 text-[#5B8DEF]" />
            </div>
          </Card>

          {/* Pending PR Applications */}
          <Card className="p-5 bg-[#FFF8E1] border-[#EFB74A]">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-[#7A4C00]">Pending PR Applications</p>
                <p className="text-[28px] text-[#7A4C00]">{pendingPR}</p>
              </div>
              <Clock className="h-5 w-5 text-[#EFB74A]" />
            </div>
          </Card>

          {/* Expiring Next 90 Days */}
          <Card className="p-5 bg-[#FDECEA] border-[#D86464]">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-[#7D2828]">Expiring (Next 90 Days)</p>
                <p className="text-[28px] text-[#7D2828]">{expiringNext90}</p>
              </div>
              <AlertCircle className="h-5 w-5 text-[#D86464]" />
            </div>
          </Card>
        </div>

        {/* Case Summary Section */}

        
        {/* Employee Distribution Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg text-[#1E1E1E]">Employee Distribution Overview</h2>
            <p className="text-xs text-[#6B6B6B]">
              Data reflects current employee records as of {new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* A. Visa Type Breakdown */}
            <Card className="p-6 bg-white border-[#E5E5E5] shadow-sm">
              <h3 className="text-base text-[#1E1E1E] mb-4">Employees by Visa Type</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={visa_typeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                  <XAxis type="number" tick={{ fill: "#4A4A4A", fontSize: 12 }} />
                  <YAxis 
                    type="category" 
                    dataKey="name" 
                    tick={{ fill: "#4A4A4A", fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E5E5E5",
                      borderRadius: "8px",
                    }}
                    formatter={(value: any, name: string, props: any) => [
                      `${value} employees (${props.payload.percentage})`,
                      "Count"
                    ]}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {visa_typeData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.name === "F-1" ? "#69C4A6" :
                          entry.name === "H-1B" ? "#5B8DEF" :
                          entry.name === "PR" ? "#9EA6B8" : "#D9D9D9"
                        } 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {visa_typeData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-sm" 
                        style={{ 
                          backgroundColor: 
                            item.name === "F-1" ? "#69C4A6" :
                            item.name === "H-1B" ? "#5B8DEF" :
                            item.name === "PR" ? "#9EA6B8" : "#D9D9D9"
                        }}
                      />
                      <span className="text-[#4A4A4A]">{item.name}</span>
                    </div>
                    <span className="text-[#1E1E1E]">{item.count} ({item.percentage})</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* B. Gender Distribution */}
            <Card className="p-6 bg-white border-[#E5E5E5] shadow-sm">
              <h3 className="text-base text-[#1E1E1E] mb-4">Employees by Gender</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="count"
                    label={({ name, percentage }) => `${name}: ${percentage}`}
                  >
                    {genderData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={GENDER_COLORS[entry.name] || "#D9D9D9"} 
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E5E5E5",
                      borderRadius: "8px",
                    }}
                    formatter={(value: any, name: string, props: any) => [
                      `${value} employees (${props.payload.percentage})`,
                      props.payload.name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {genderData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: GENDER_COLORS[item.name] || "#D9D9D9" }}
                      />
                      <span className="text-[#4A4A4A]">{item.name}</span>
                    </div>
                    <span className="text-[#1E1E1E]">{item.count} ({item.percentage})</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#6B6B6B] mt-4 italic">
                Gender self-identified data collected for HR compliance purposes.
              </p>
            </Card>

            {/* C. Department Breakdown */}
            <Card className="p-6 bg-white border-[#E5E5E5] shadow-sm">
              <h3 className="text-base text-[#1E1E1E] mb-4">Employees by Department</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={departmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: "#4A4A4A", fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis tick={{ fill: "#4A4A4A", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #E5E5E5",
                      borderRadius: "8px",
                    }}
                    formatter={(value: any) => [`${value} employees`, "Count"]}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {departmentData.map((entry, index) => {
                      // Create gradient from light to dark blue based on count
                      const maxCount = Math.max(...departmentData.map(d => d.count));
                      const intensity = entry.count / maxCount;
                      const lightness = 85 - (intensity * 30); // Range from #D6E4FF to darker
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`hsl(215, 100%, ${lightness}%)`}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 max-h-32 overflow-y-auto space-y-1">
                {departmentData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <span className="text-[#4A4A4A] truncate">{item.name}</span>
                    <span className="text-[#1E1E1E] ml-2">{item.count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
        <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="h-10 border-[#E5E5E5] hover:bg-[#F8F9FA]"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </Button>

        {/* Filters Sidebar */}
        {showFilters && (
          <Card className="p-6 bg-white border-[#E5E5E5]">
            <h3 className="text-base text-[#1E1E1E] mb-4">Filter Options</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Department Filter */}
              <div className="space-y-3">
                <Label className="text-sm text-[#4A4A4A]">Department</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {uniqueDepartments.map((dept) => (
                    <div key={dept} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dept-${dept}`}
                        checked={departmentFilter.includes(dept)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setDepartmentFilter([...departmentFilter, dept]);
                          } else {
                            setDepartmentFilter(departmentFilter.filter(d => d !== dept));
                          }
                        }}
                      />
                      <label htmlFor={`dept-${dept}`} className="text-sm text-[#1E1E1E] cursor-pointer">
                        {dept}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visa Type Filter */}
              <div className="space-y-3">
                <Label className="text-sm text-[#4A4A4A]">Visa Type</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {uniqueVisaTypes.map((visa) => (
                    <div key={visa} className="flex items-center space-x-2">
                      <Checkbox
                        id={`visa-${visa}`}
                        checked={visa_typeFilter.includes(visa)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setVisaTypeFilter([...visa_typeFilter, visa]);
                          } else {
                            setVisaTypeFilter(visa_typeFilter.filter(v => v !== visa));
                          }
                        }}
                      />
                      <label htmlFor={`visa-${visa}`} className="text-sm text-[#1E1E1E] cursor-pointer">
                        {visa}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Country Filter */}
              <div className="space-y-3">
                <Label className="text-sm text-[#4A4A4A]">Country</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {uniqueCountries.map((country) => (
                    <div key={country} className="flex items-center space-x-2">
                      <Checkbox
                        id={`country-${country}`}
                        checked={countryFilter.includes(country)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setCountryFilter([...countryFilter, country]);
                          } else {
                            setCountryFilter(countryFilter.filter(c => c !== country));
                          }
                        }}
                      />
                      <label htmlFor={`country-${country}`} className="text-sm text-[#1E1E1E] cursor-pointer">
                        {country}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* PR Status Filter */}
              <div className="space-y-3">
                <Label className="text-sm text-[#4A4A4A]">PR Status</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {uniquePrStatuses.map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        id={`pr-${status}`}
                        checked={prStatusFilter.includes(status)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setPrStatusFilter([...prStatusFilter, status]);
                          } else {
                            setPrStatusFilter(prStatusFilter.filter(s => s !== status));
                          }
                        }}
                      />
                      <label htmlFor={`pr-${status}`} className="text-sm text-[#1E1E1E] cursor-pointer">
                        {status}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDepartmentFilter([]);
                  setVisaTypeFilter([]);
                  setCountryFilter([]);
                  setPrStatusFilter([]);
                }}
                className="border-[#E5E5E5]"
              >
                Clear All Filters
              </Button>
            </div>
          </Card>
        )}

       
        {/* Main Data Table */}
        <Card className="bg-white border-[#E5E5E5]">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              
              <h2 className="text-lg text-[#1E1E1E]">Employee Visa Data</h2>
              <div className="relative w-72">
                <Input
                  type="text"
                  placeholder="Search by name or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 border-[#E5E5E5] bg-white pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Filter className="h-4 w-4 text-[#6B6B6B]" />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[#E5E5E5] overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F1F3F5] hover:bg-[#F1F3F5]">
                      <TableHead className="text-[#1E1E1E] h-12">
                        <button
                          onClick={() => handleSort("name")}
                          className="flex items-center gap-1 hover:text-black"
                        >
                          Employee Name
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead className="text-[#1E1E1E]">
                        <button
                          onClick={() => handleSort("department")}
                          className="flex items-center gap-1 hover:text-black"
                        >
                          Department
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead className="text-[#1E1E1E]">Title</TableHead>
                      <TableHead className="text-[#1E1E1E]">Case Type</TableHead>
                      <TableHead className="text-[#1E1E1E]">Filed By</TableHead>
                      <TableHead className="text-[#1E1E1E]">
                        <button
                          onClick={() => handleSort("start_date")}
                          className="flex items-center gap-1 hover:text-black"
                        >
                          Start Date
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead className="text-[#1E1E1E]">
                        <button
                          onClick={() => handleSort("expiration_date")}
                          className="flex items-center gap-1 hover:text-black"
                        >
                          Expiration
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead className="text-[#1E1E1E]">Dependents</TableHead>
                      <TableHead className="text-[#1E1E1E]">PR Status</TableHead>
                      <TableHead className="text-[#1E1E1E]">Country</TableHead>
                      <TableHead className="text-[#1E1E1E]">Notes</TableHead>
                      <TableHead className="text-[#1E1E1E] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((row, index) => (
                      <TableRow
                        key={row.id}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"
                        } hover:bg-[#E9F2FF] transition-colors`}
                      >
                        <TableCell className="text-[#1E1E1E]">{row.name}</TableCell>
                        <TableCell className="text-[#4A4A4A]">{row.department}</TableCell>
                        <TableCell className="text-[#4A4A4A]">{row.title}</TableCell>
                        <TableCell className="text-[#4A4A4A]">{row.case_type}</TableCell>
                        <TableCell className="text-[#4A4A4A]">{row.filedBy}</TableCell>
                        <TableCell className="text-[#4A4A4A]">
                          {new Date(row.start_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                          })}
                        </TableCell>
                        <TableCell className="text-[#4A4A4A]">
                          {new Date(row.expiration_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                          })}
                        </TableCell>
                        <TableCell className="text-[#4A4A4A]">{row.number_of_dependents}</TableCell>
                        <TableCell>
                          <Badge
                            style={{
                              backgroundColor: PR_STATUS_COLORS[row.prStatus] || "#B1B1B1",
                              color: "white",
                              border: "none"
                            }}
                          >
                            {row.prStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[#4A4A4A]">{row.country}</TableCell>
                        <TableCell className="text-[#4A4A4A] max-w-[200px] truncate" title={row.notes}>
                          {row.notes || "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#4A4A4A] hover:text-black"
                            onClick={() => onEditEmployee?.({
                              id: row.id,
                              employee: {
                                name: row.name,
                                email: employeesData.find(e => e.id === row.id)?.email || "",
                                department: row.department
                              },
                              visa_type: row.visa_type,
                              status: row.status,
                              expiration_date: row.expiration_date,
                              daysLeft: row.daysLeft
                            })}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#4A4A4A] hover:text-black"
                            onClick={() => onViewEmployee?.({
                              id: row.id,
                              employee: {
                                name: row.name,
                                email: employeesData.find(e => e.id === row.id)?.email || "",
                                department: row.department
                              },
                              visa_type: row.visa_type,
                              status: row.status,
                              expiration_date: row.expiration_date,
                              daysLeft: row.daysLeft
                            })}
                          >
                            <Mail className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="mt-4 text-sm text-[#6B6B6B]">
              Showing {sortedData.length} of {reportData.length} employees
            </div>

            {/* Pagination */}
            {Math.ceil(sortedData.length / itemsPerPage) > 1 && (
              <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E5E5E5] bg-[#F8F9FA]">
                <div className="text-sm text-[#4A4A4A]">
                  Showing{" "}
                  <span className="font-medium text-[#1E1E1E]">
                    {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, sortedData.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-[#1E1E1E]">
                    {sortedData.length}
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
                    {Array.from({ length: Math.min(5, Math.ceil(sortedData.length / itemsPerPage)) }, (_, i) => {
                      const totalPages = Math.ceil(sortedData.length / itemsPerPage);
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
                    onClick={() => setCurrentPage((p) => Math.min(Math.ceil(sortedData.length / itemsPerPage), p + 1))}
                    disabled={currentPage === Math.ceil(sortedData.length / itemsPerPage)}
                    className="h-9 px-3 border-[#E1E1E1]"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Case Type Distribution */}
          <Card className="p-6 bg-white border-[#E5E5E5]">
            <h3 className="text-base text-[#1E1E1E] mb-4">Employees by Case Type</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={case_typeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: "#4A4A4A", fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis tick={{ fill: "#4A4A4A", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E5E5E5",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="value" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Filed By Distribution */}
          <Card className="p-6 bg-white border-[#E5E5E5]">
            <h3 className="text-base text-[#1E1E1E] mb-4">Filed By Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={filedByData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {filedByData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={[CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.attention][index % 3]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E5E5E5",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Expiration Timeline */}
        <Card className="p-6 bg-white border-[#E5E5E5]">
          <h3 className="text-base text-[#1E1E1E] mb-4">Upcoming Expiration Dates (Next 12 Months)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={expirationTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: "#4A4A4A", fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis tick={{ fill: "#4A4A4A", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #E5E5E5",
                  borderRadius: "8px",
                }}
              />
              <Bar 
                dataKey="count" 
                fill={CHART_COLORS.attention}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Footer */}
        <div className="bg-[#F7F8FA] border border-[#E5E5E5] rounded-lg p-4 text-center">
          <p className="text-xs text-[#555555]">
            Generated for internal USCIS compliance and HR reporting only.
          </p>
          <p className="text-xs text-[#555555] mt-1">
            Generated on {timestamp}
          </p>
        </div>
      </div>
    </div>
  );
}