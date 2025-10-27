import { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
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
import { Calendar, Download, Search, TrendingUp } from "lucide-react";


// Mock employee data for reports
const mockReportData = [
  {
    id: "1",
    employee: "Fatima Al-Rashid",
    gender: "Female",
    department: "Finance",
    visaType: "F-1",
    visaStart: "2022-09-20",
    visaEnd: "2024-09-20",
    lengthYears: 2,
    lengthMonths: 0,
    lengthDays: 0,
    status: "Expired",
  },
  {
    id: "2",
    employee: "Chen Wei",
    gender: "Male",
    department: "Engineering",
    visaType: "H-1B",
    visaStart: "2022-10-15",
    visaEnd: "2025-10-15",
    lengthYears: 3,
    lengthMonths: 0,
    lengthDays: 0,
    status: "Active",
  },
  {
    id: "3",
    employee: "Maria Gonzalez",
    gender: "Female",
    department: "Marketing",
    visaType: "H-1B",
    visaStart: "2021-11-15",
    visaEnd: "2024-11-15",
    lengthYears: 3,
    lengthMonths: 0,
    lengthDays: 0,
    status: "Active",
  },
  {
    id: "4",
    employee: "Raj Patel",
    gender: "Male",
    department: "Sales",
    visaType: "OPT STEM",
    visaStart: "2021-11-25",
    visaEnd: "2024-11-25",
    lengthYears: 3,
    lengthMonths: 0,
    lengthDays: 0,
    status: "Active",
  },
  {
    id: "5",
    employee: "Olumide Adebayo",
    gender: "Male",
    department: "HR",
    visaType: "F-1",
    visaStart: "2022-11-30",
    visaEnd: "2024-11-30",
    lengthYears: 2,
    lengthMonths: 0,
    lengthDays: 0,
    status: "Processing",
  },
  {
    id: "6",
    employee: "Sofia Petrov",
    gender: "Female",
    department: "Engineering",
    visaType: "H-1B",
    visaStart: "2021-12-20",
    visaEnd: "2024-12-20",
    lengthYears: 3,
    lengthMonths: 0,
    lengthDays: 0,
    status: "Active",
  },
  {
    id: "7",
    employee: "Kenji Nakamura",
    gender: "Male",
    department: "Finance",
    visaType: "J-1",
    visaStart: "2022-01-15",
    visaEnd: "2025-01-15",
    lengthYears: 3,
    lengthMonths: 0,
    lengthDays: 0,
    status: "Active",
  },
  {
    id: "8",
    employee: "Aisha Okonkwo",
    gender: "Female",
    department: "Marketing",
    visaType: "F-1",
    visaStart: "2022-03-10",
    visaEnd: "2025-03-10",
    lengthYears: 3,
    lengthMonths: 0,
    lengthDays: 0,
    status: "Active",
  },
  {
    id: "9",
    employee: "Viktor Kozlov",
    gender: "Male",
    department: "Sales",
    visaType: "H-1B",
    visaStart: "2022-04-05",
    visaEnd: "2025-04-05",
    lengthYears: 3,
    lengthMonths: 0,
    lengthDays: 0,
    status: "Active",
  },
  {
    id: "10",
    employee: "Isabella Rodriguez",
    gender: "Female",
    department: "Engineering",
    visaType: "H-1B",
    visaStart: "2022-08-15",
    visaEnd: "2025-08-15",
    lengthYears: 3,
    lengthMonths: 0,
    lengthDays: 0,
    status: "Active",
  },
  {
    id: "11",
    employee: "Samuel Okafor",
    gender: "Male",
    department: "HR",
    visaType: "Permanent Resident",
    visaStart: "2021-11-30",
    visaEnd: "2026-11-30",
    lengthYears: 5,
    lengthMonths: 0,
    lengthDays: 0,
    status: "Active",
  },
  {
    id: "12",
    employee: "Anastasia Volkov",
    gender: "Female",
    department: "Finance",
    visaType: "J-1",
    visaStart: "2022-03-20",
    visaEnd: "2025-03-20",
    lengthYears: 3,
    lengthMonths: 0,
    lengthDays: 0,
    status: "Active",
  },
  {
    id: "13",
    employee: "Diego Morales",
    gender: "Male",
    department: "Marketing",
    visaType: "H-1B",
    visaStart: "2022-07-08",
    visaEnd: "2025-07-08",
    lengthYears: 3,
    lengthMonths: 0,
    lengthDays: 0,
    status: "Active",
  },
  {
    id: "14",
    employee: "Priya Sharma",
    gender: "Female",
    department: "Sales",
    visaType: "F-1",
    visaStart: "2022-06-12",
    visaEnd: "2025-06-12",
    lengthYears: 3,
    lengthMonths: 0,
    lengthDays: 0,
    status: "Active",
  },
  {
    id: "15",
    employee: "Ahmed Hassan",
    gender: "Male",
    department: "Engineering",
    visaType: "H-1B",
    visaStart: "2020-05-10",
    visaEnd: "2023-05-10",
    lengthYears: 3,
    lengthMonths: 0,
    lengthDays: 0,
    status: "Expired",
  },
];


export function Reports() {
  const [reportPeriod, setReportPeriod] = useState("fiscal-year");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [visaTypeFilter, setVisaTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [adminNotes, setAdminNotes] = useState(
    "4 H-1B extensions pending approval. Engineering department has highest visa renewal rate."
  );

  // Filter data
  const filteredData = mockReportData.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.employee.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender = genderFilter === "all" || item.gender === genderFilter;
    const matchesDepartment =
      departmentFilter === "all" || item.department === departmentFilter;
    const matchesVisaType =
      visaTypeFilter === "all" || item.visaType === visaTypeFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;

    return (
      matchesSearch &&
      matchesGender &&
      matchesDepartment &&
      matchesVisaType &&
      matchesStatus
    );
  });

  // KPI Calculations
  const totalEmployees = filteredData.length;
  const activeVisas = filteredData.filter((d) => d.status === "Active").length;
  const expiredVisas = filteredData.filter((d) => d.status === "Expired").length;
  const avgStayMonths =
    filteredData.reduce((sum, d) => sum + d.lengthYears * 12 + d.lengthMonths, 0) /
    totalEmployees;
  const avgYears = Math.floor(avgStayMonths / 12);
  const avgMonths = Math.round(avgStayMonths % 12);

  


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

  // Generate insights
  const generateInsights = () => {
    const h1bCount = filteredData.filter((d) => d.visaType === "H-1B").length;
    const deptCounts = filteredData.reduce((acc, item) => {
      acc[item.department] = (acc[item.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const topDept = Object.entries(deptCounts).sort((a, b) => b[1] - a[1])[0];
    const processingCount = filteredData.filter((d) => d.status === "Processing").length;

    return [
      `${topDept?.[0] || "Engineering"} holds the highest number of active visas (${topDept?.[1] || 0}).`,
      `There are currently ${h1bCount} H-1B visa holders across all departments.`,
      `${processingCount} employee${processingCount !== 1 ? "s have" : " has"} pending renewals due before December 31.`,
    ];
  };

  const insights = generateInsights();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="text-sm text-[#6B7280]">Dashboard / Reports</div>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-black">
              Visa Compliance & Analytics
            </h1>
            <p className="text-neutral-gray-500 mt-1">
              Overview of all active, expired, and pending visas across departments.
            </p>
          </div>

          {/* Reporting Toolbar */}
        </div>
      </div>

      {/* Section 1 - Overview Analytics (Always Visible) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      </div>
      {/* Section 3 - Detailed Employee Data Table */}
      <Card className="p-6 border border-[#E5E7EB]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-black">
            Detailed Employee Data
          </h2>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-gray-500 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search employees..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-9 rounded-lg border border-[#D1D5DB] bg-white text-sm"
            />
          </div>
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger className="h-9 rounded-lg border border-[#D1D5DB] bg-white text-sm">
              <SelectValue placeholder="Gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="h-9 rounded-lg border border-[#D1D5DB] bg-white text-sm">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="Engineering">Engineering</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="HR">HR</SelectItem>
              <SelectItem value="Marketing">Marketing</SelectItem>
              <SelectItem value="Sales">Sales</SelectItem>
            </SelectContent>
          </Select>
          <Select value={visaTypeFilter} onValueChange={setVisaTypeFilter}>
            <SelectTrigger className="h-9 rounded-lg border border-[#D1D5DB] bg-white text-sm">
              <SelectValue placeholder="Visa Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Visa Types</SelectItem>
              <SelectItem value="F-1">F-1</SelectItem>
              <SelectItem value="H-1B">H-1B</SelectItem>
              <SelectItem value="J-1">J-1</SelectItem>
              <SelectItem value="OPT STEM">OPT STEM</SelectItem>
              <SelectItem value="Permanent Resident">Permanent Resident</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 rounded-lg border border-[#D1D5DB] bg-white text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Processing">Processing</SelectItem>
              <SelectItem value="Expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-[#E5E7EB] overflow-x-auto">
          {/* <Table>
            <TableHeader>
              <TableRow className="bg-[#FAFAFA] hover:bg-[#FAFAFA]">
                <TableHead className="text-neutral-gray-700 border-b-2 border-[#FFCC00]">
                  Employee
                </TableHead>
                <TableHead className="text-neutral-gray-700 border-b-2 border-[#FFCC00]">
                  Gender
                </TableHead>
                <TableHead className="text-neutral-gray-700 border-b-2 border-[#FFCC00]">
                  Department
                </TableHead>
                <TableHead className="text-neutral-gray-700 border-b-2 border-[#FFCC00]">
                  Visa Type
                </TableHead>
                <TableHead className="text-neutral-gray-700 border-b-2 border-[#FFCC00]">
                  Start Date
                </TableHead>
                <TableHead className="text-neutral-gray-700 border-b-2 border-[#FFCC00]">
                  End Date
                </TableHead>
                <TableHead className="text-neutral-gray-700 border-b-2 border-[#FFCC00]">
                  Stay Length
                </TableHead>
                <TableHead className="text-neutral-gray-700 border-b-2 border-[#FFCC00]">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((row, index) => (
                <TableRow
                  key={row.id}
                  className={`hover:bg-[#F6F6F6] ${
                    index % 2 === 1 ? "bg-[#FAFAFA]" : ""
                  }`}
                >
                  <TableCell className="font-medium text-black">
                    {row.employee}
                  </TableCell>
                  <TableCell className="text-black">{row.gender}</TableCell>
                  <TableCell className="text-black">{row.department}</TableCell>
                  <TableCell className="text-black">{row.visaType}</TableCell>
                  <TableCell className="text-black">{row.visaStart}</TableCell>
                  <TableCell className="text-black">{row.visaEnd}</TableCell>
                  <TableCell className="text-black">
                    {row.lengthYears}y {row.lengthMonths}m {row.lengthDays}d
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(row.status)}>
                      {row.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table> */}
        </div>

        <div className="mt-4 text-sm text-[#6B7280]">
          Showing {filteredData.length} of {mockReportData.length} employees
        </div>
      </Card>

      {/* Section 4 - Summary Insights */}
      <Card className="p-6 border border-[#E5E7EB]">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-[#FFCC00]" />
          <h2 className="text-lg font-semibold text-black">Summary Insights</h2>
        </div>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="mt-1.5 h-2 w-2 rounded-full bg-[#FFCC00] flex-shrink-0"></div>
              <p className="text-sm text-[#374151]">{insight}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Section 5 - Notes & Export */}
      <Card className="p-6 border border-[#E5E7EB]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h2 className="text-lg font-semibold text-black">Admin Notes & Export</h2>
          <Button
            variant="outline"
            size="sm"
            className="bg-[#FFCC00] text-black hover:bg-[#FFCC00]/90 border-[#FFCC00]"
          >
            <Download className="h-4 w-4 mr-2" />
            Download USCIS Report (CSV)
          </Button>
        </div>
        <Textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Add internal notes for USCIS submissions and compliance tracking..."
          className="min-h-[120px] bg-white border border-[#D1D5DB] rounded-lg"
        />
        <div className="mt-3 text-sm text-[#6B7280]">
          Internal notes for compliance tracking and USCIS reporting
        </div>
      </Card>
    </div>
  );
}
