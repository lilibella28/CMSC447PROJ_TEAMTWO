import { StatCard } from "./StatCard";
import { DataTable, VisaCase } from "./DataTable";
import { FilterBar } from "./FilterBar";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import { Plus, Download, AlertTriangle } from "lucide-react";

// Mock data for the dashboard - diverse employee dataset demonstrating all priority levels
const mockVisaCases: VisaCase[] = [
  // HIGHEST PRIORITY - Expired/Overdue (negative days)
  {
    id: "1",
    employee: {
      name: "Fatima Al-Rashid",
      department: "Finance",
    },
    visaType: "F-1",
    status: "Expired",
    expirationDate: "2024-09-20",
    daysLeft: -42,
  },
  {
    id: "2",
    employee: { name: "Chen Wei", department: "Engineering" },
    visaType: "OPT",
    status: "Expired",
    expirationDate: "2024-10-15",
    daysLeft: -17,
  },

  // HIGH PRIORITY - Expiring ≤30 days
  {
    id: "3",
    employee: {
      name: "Maria Gonzalez",
      department: "Marketing",
    },
    visaType: "H-1B",
    status: "Active",
    expirationDate: "2024-11-15",
    daysLeft: 12,
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
    id: "5",
    employee: { name: "Olumide Adebayo", department: "HR" },
    visaType: "F-1",
    status: "Processing",
    expirationDate: "2024-11-30",
    daysLeft: 27,
  },

  // EXTENSION NEEDED - Expiring 31-180 days (within 6 months)
  {
    id: "6",
    employee: {
      name: "Sofia Petrov",
      department: "Engineering",
    },
    visaType: "H-1B",
    status: "Active",
    expirationDate: "2024-12-20",
    daysLeft: 47,
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
    id: "8",
    employee: {
      name: "Aisha Okonkwo",
      department: "Marketing",
    },
    visaType: "F-1",
    status: "Active",
    expirationDate: "2025-03-10",
    daysLeft: 127,
  },
  {
    id: "9",
    employee: { name: "Viktor Kozlov", department: "Sales" },
    visaType: "OPT STEM",
    status: "Active",
    expirationDate: "2025-04-05",
    daysLeft: 153,
  },

  // LOW PRIORITY - Expiring >180 days (long-term)
  {
    id: "10",
    employee: {
      name: "Isabella Rodriguez",
      department: "Engineering",
    },
    visaType: "H-1B",
    status: "Active",
    expirationDate: "2025-08-15",
    daysLeft: 285,
  },
  {
    id: "11",
    employee: { name: "Samuel Okafor", department: "HR" },
    visaType: "Permanent Resident",
    status: "Active",
    expirationDate: "2026-11-30",
    daysLeft: 753,
  },
  {
    id: "12",
    employee: {
      name: "Anastasia Volkov",
      department: "Finance",
    },
    visaType: "Permanent Resident",
    status: "Active",
    expirationDate: "2027-03-20",
    daysLeft: 863,
  },
  {
    id: "13",
    employee: {
      name: "Diego Morales",
      department: "Marketing",
    },
    visaType: "H-1B",
    status: "Active",
    expirationDate: "2025-07-08",
    daysLeft: 247,
  },
  {
    id: "14",
    employee: { name: "Priya Sharma", department: "Sales" },
    visaType: "F-1",
    status: "Active",
    expirationDate: "2025-06-12",
    daysLeft: 221,
  },
];

interface DashboardProps {
  onNavigateToAddEmployee?: () => void;
  onViewEmployee?: (employee: VisaCase) => void;
}

export function Dashboard({
  onNavigateToAddEmployee,
  onViewEmployee,
}: DashboardProps) {
  // Sort visa cases by priority
  const getPriority = (daysLeft: number) => {
    if (daysLeft < 0) return 1; // Expired/Overdue (Highest Priority)
    if (daysLeft <= 30) return 2; // Expiring in ≤30 days (High Priority)
    if (daysLeft <= 180) return 3; // Expiring in ≤180 days (Extension Needed)
    return 4; // Expiring in >180 days (Low Priority)
  };

  const sortedVisaCases = [...mockVisaCases].sort((a, b) => {
    const priorityA = getPriority(a.daysLeft);
    const priorityB = getPriority(b.daysLeft);

    // First sort by priority
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // Within same priority group, sort by soonest expiration (ascending daysLeft)
    return a.daysLeft - b.daysLeft;
  });

  // Calculate KPI statistics
  const activeVisas = mockVisaCases.filter(
    (visa) => visa.status === "Active",
  ).length;
  const expiringWithin60Days = mockVisaCases.filter(
    (visa) => visa.daysLeft > 0 && visa.daysLeft <= 60,
  ).length;
  const expired = mockVisaCases.filter(
    (visa) => visa.daysLeft < 0,
  ).length;
  const pending = mockVisaCases.filter(
    (visa) => visa.status === "Processing",
  ).length;
  const completed = 312; // Static number for completed cases

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-black">
            Live Cases Overview
          </h1>
          <p className="text-neutral-gray-500 mt-1">
            Monitor visa status and expiration dates
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="border-neutral-gray-200 flex-1 md:flex-none"
          >
            <Download className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Export CSV</span>
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

      {/* Alert Banner */}
      <Alert className="border-[#F59E0B] bg-[#FFF7E6]">
        <AlertTriangle className="h-4 w-4 text-[#F59E0B] flex-shrink-0" />
        <AlertDescription className="text-[#92400E] text-sm">
          <strong>{expiringWithin60Days} visas</strong> expiring
          within 60 days. Review and notify employees.
        </AlertDescription>
      </Alert>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        <StatCard
          title="Active Visas"
          value={activeVisas}
          variant="default"
        />
        <StatCard
          title="Expiring ≤ 60 Days"
          value={expiringWithin60Days}
          variant="warning"
          badge={{ text: "Alert", variant: "warning" }}
        />
        <StatCard
          title="Expired"
          value={expired}
          variant="error"
          badge={{
            text: "Action Required",
            variant: "destructive",
          }}
        />
        <StatCard
          title="Pending"
          value={pending}
          variant="default"
          badge={{ text: "In Process", variant: "secondary" }}
        />
        <StatCard
          title="Completed"
          value={completed}
          variant="success"
          badge={{ text: "This Year", variant: "secondary" }}
        />
      </div>

      {/* Filter Bar */}
      <FilterBar />

      {/* Data Table */}
      <DataTable
        data={sortedVisaCases}
        onViewEmployee={onViewEmployee}
      />

      {/* Pagination would go here */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4">
        <p className="text-sm text-neutral-gray-500">
          Showing {sortedVisaCases.length} of{" "}
          {sortedVisaCases.length} results
        </p>
        <div className="flex items-center space-x-2 justify-center md:justify-end">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-black text-[#FFCC00]"
          >
            1
          </Button>
          <Button variant="outline" size="sm">
            2
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}