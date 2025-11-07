import { useState, useEffect } from "react";
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
  FileSpreadsheet
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
import { fetchEmployees, Employee } from "../../utils/dataService";
import { calculateVisaStatus, calculateDaysRemaining } from "../../utils/visaStatusUtils";

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

export function Reports() {
  const [reportPeriod, setReportPeriod] = useState("fiscal-year");
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([]);
  const [visaTypeFilter, setVisaTypeFilter] = useState<string[]>([]);
  const [countryFilter, setCountryFilter] = useState<string[]>([]);
  const [prStatusFilter, setPrStatusFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [employeesData, setEmployeesData] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    const daysLeft = calculateDaysRemaining(emp.expirationDate);
    const computedStatus = calculateVisaStatus(emp.expirationDate, hasPendingApplication);

    return {
      id: emp.id,
      name: emp.employeeName,
      department: emp.department,
      title: emp.employeeTitle || "N/A",
      caseType: emp.caseType || "N/A",
      filedBy: emp.visaFiledBy,
      startDate: emp.visaStartDate || emp.startDate,
      expirationDate: emp.expirationDate,
      dependents: emp.dependents,
      prStatus: emp.permanentResidency?.currentStatus || "Not Started",
      country: emp.countryOfBirth || emp.nationality,
      visaType: emp.visaType,
      status: computedStatus, // Use computed status instead of stored status
      daysLeft,
      notes: emp.generalNotes || "",
    };
  }) : [];

  // Filter data
  const filteredData = reportData.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment =
      departmentFilter.length === 0 || departmentFilter.includes(item.department);
    
    const matchesVisaType =
      visaTypeFilter.length === 0 || visaTypeFilter.includes(item.visaType);
    
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
  const totalEmployees = reportData.length;
  const activeH1B = reportData.filter((d) => d.visaType === "H-1B" && d.status === "Active").length;
  const pendingPR = reportData.filter((d) => 
    d.prStatus === "Filed" || d.prStatus === "Awaiting Response"
  ).length;
  const expiringNext90 = reportData.filter((d) => d.daysLeft > 0 && d.daysLeft <= 90).length;

  // Chart data - Case Type distribution
  const caseTypeData = Object.entries(
    reportData.reduce((acc, item) => {
      const caseType = item.caseType || "Other";
      acc[caseType] = (acc[caseType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Filed By distribution
  const filedByData = Object.entries(
    reportData.reduce((acc, item) => {
      acc[item.filedBy] = (acc[item.filedBy] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Expiration timeline (next 12 months)
  const expirationTimeline = Array.from({ length: 12 }, (_, i) => {
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + i);
    const monthName = targetDate.toLocaleString("en-US", { month: "short" });
    const year = targetDate.getFullYear();
    
    const count = reportData.filter((emp) => {
      const expDate = new Date(emp.expirationDate);
      return (
        expDate.getMonth() === targetDate.getMonth() &&
        expDate.getFullYear() === targetDate.getFullYear()
      );
    }).length;
    
    return { month: `${monthName} ${year}`, count };
  });

  // Employee Distribution Overview data
  // 1. Visa Type Breakdown (categorize F-1, OPT, OPT STEM as F1 group)
  const visaTypeDistribution = Array.isArray(employeesData) ? employeesData.reduce((acc, emp) => {
    let category = emp.visaType;
    // Group F-1, OPT, OPT STEM together
    if (emp.visaType === "F-1" || emp.visaType === "OPT" || emp.visaType === "OPT STEM") {
      category = "F-1";
    } else if (emp.visaType === "H-1B") {
      category = "H-1B";
    } else if (emp.visaType === "Permanent Resident") {
      category = "PR";
    }
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) : {};

  const visaTypeData = Object.entries(visaTypeDistribution).map(([name, count]) => {
    const percentage = Array.isArray(employeesData) && employeesData.length > 0
      ? ((count / employeesData.length) * 100).toFixed(0)
      : '0';
    return { name, count, percentage: `${percentage}%` };
  });

  // 2. Gender Distribution
  const genderDistribution = Array.isArray(employeesData) ? employeesData.reduce((acc, emp) => {
    const gender = emp.gender || "Prefer not to say";
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) : {};

  const genderData = Object.entries(genderDistribution).map(([name, count]) => {
    const percentage = Array.isArray(employeesData) && employeesData.length > 0
      ? ((count / employeesData.length) * 100).toFixed(0)
      : '0';
    return { name, count, percentage: `${percentage}%` };
  });

  // 3. Department Breakdown
  const departmentDistribution = Array.isArray(employeesData) ? employeesData.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) : {};

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
  const uniqueVisaTypes = Array.from(new Set(reportData.map(d => d.visaType))).sort();
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
        `"${row.caseType}"`,
        `"${row.filedBy}"`,
        row.startDate,
        row.expirationDate,
        row.dependents,
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
              <Select value={reportPeriod} onValueChange={setReportPeriod}>
                <SelectTrigger className="w-[180px] h-10 bg-white border-[#E5E5E5]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fiscal-year">Fiscal Year 2025</SelectItem>
                  <SelectItem value="academic-year">Academic Year 2024-25</SelectItem>
                  <SelectItem value="calendar-year">Calendar Year 2025</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={exportCSV}
                className="h-10 border-[#E5E5E5] hover:bg-[#F8F9FA]"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export CSV
              </Button>

              <Button
                variant="outline"
                onClick={exportPDF}
                className="h-10 border-[#E5E5E5] hover:bg-[#F8F9FA]"
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="h-10 border-[#E5E5E5] hover:bg-[#F8F9FA]"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showFilters ? "rotate-180" : ""}`} />
              </Button>
            </div>
          </div>
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
                <BarChart data={visaTypeData} layout="vertical">
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
                    {visaTypeData.map((entry, index) => (
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
                {visaTypeData.map((item) => (
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
                        checked={visaTypeFilter.includes(visa)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setVisaTypeFilter([...visaTypeFilter, visa]);
                          } else {
                            setVisaTypeFilter(visaTypeFilter.filter(v => v !== visa));
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
                          onClick={() => handleSort("startDate")}
                          className="flex items-center gap-1 hover:text-black"
                        >
                          Start Date
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead className="text-[#1E1E1E]">
                        <button
                          onClick={() => handleSort("expirationDate")}
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedData.map((row, index) => (
                      <TableRow
                        key={row.id}
                        className={`${
                          index % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"
                        } hover:bg-[#E9F2FF] transition-colors`}
                      >
                        <TableCell className="text-[#1E1E1E]">{row.name}</TableCell>
                        <TableCell className="text-[#4A4A4A]">{row.department}</TableCell>
                        <TableCell className="text-[#4A4A4A]">{row.title}</TableCell>
                        <TableCell className="text-[#4A4A4A]">{row.caseType}</TableCell>
                        <TableCell className="text-[#4A4A4A]">{row.filedBy}</TableCell>
                        <TableCell className="text-[#4A4A4A]">
                          {new Date(row.startDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                          })}
                        </TableCell>
                        <TableCell className="text-[#4A4A4A]">
                          {new Date(row.expirationDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric"
                          })}
                        </TableCell>
                        <TableCell className="text-[#4A4A4A]">{row.dependents}</TableCell>
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="mt-4 text-sm text-[#6B6B6B]">
              Showing {sortedData.length} of {reportData.length} employees
            </div>
          </div>
        </Card>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Case Type Distribution */}
          <Card className="p-6 bg-white border-[#E5E5E5]">
            <h3 className="text-base text-[#1E1E1E] mb-4">Employees by Case Type</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={caseTypeData}>
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
