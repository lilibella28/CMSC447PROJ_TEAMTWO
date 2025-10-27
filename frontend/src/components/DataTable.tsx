import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Mail, Eye } from "lucide-react";

export interface VisaCase {
  id: string;
  employee: {
    name: string;
    department: string;
  };
  visaType: string;
  status: "Active" | "Pending" | "Expired" | "Processing";
  expirationDate: string;
  daysLeft: number;
}

interface DataTableProps {
  data: VisaCase[];
  onViewEmployee?: (employee: VisaCase) => void;
}

export function DataTable({ data, onViewEmployee }: DataTableProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default"; // Will be overridden with custom green styling
      case "Pending":
        return "secondary";
      case "Expired":
        return "destructive";
      case "Processing":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    if (status === "Active") {
      return "bg-[#10B981] text-white border-[#10B981] hover:bg-[#10B981]/90";
    }
    if (status === "Processing") {
      return "bg-[#10B981] text-white border-[#3B82F6] hover:!bg-[#3B82F6]/90";
    }
    return "";
  };

  const getRowBorderColor = (daysLeft: number) => {
    if (daysLeft < 0) return "border-l-4 border-l-[#EF4444]"; // Expired/overdue - Red
    if (daysLeft <= 30) return "border-l-4 border-l-[#EF4444]"; // ≤30 days - Red
    if (daysLeft <= 90) return "border-l-4 border-l-[#F59E0B]"; // 31-90 days - Yellow
    return "border-l-4 border-l-[#10B981]"; // 90+ days - Green
  };

  const getDateChipStyle = (daysLeft: number) => {
    if (daysLeft < 0) return "bg-red-50 text-red-700 border-red-200";
    if (daysLeft <= 60) return "bg-yellow-50 text-yellow-700 border-yellow-200";
    return "bg-gray-50 text-gray-700 border-gray-200";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="rounded-lg border border-neutral-gray-200 bg-white overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#FAFAFA] hover:bg-[#FAFAFA]">
            <TableHead className="text-neutral-gray-700">Employee</TableHead>
            <TableHead className="text-neutral-gray-700">Visa Type</TableHead>
            <TableHead className="text-neutral-gray-700">Status</TableHead>
            <TableHead className="text-neutral-gray-700">Expiration Date</TableHead>
            <TableHead className="text-neutral-gray-700 hidden md:table-cell">Days Left</TableHead>
            <TableHead className="text-neutral-gray-700 hidden lg:table-cell">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow 
              key={row.id} 
              className={`hover:bg-[#F6F6F6] ${getRowBorderColor(row.daysLeft)}`}
            >
              <TableCell className="min-w-[180px]">
                <div>
                  <div className="font-medium text-black">{row.employee.name}</div>
                  <div className="text-sm text-neutral-gray-500 hidden sm:block">{row.employee.department}</div>
                </div>
              </TableCell>
              <TableCell className="text-black min-w-[120px]">{row.visaType}</TableCell>
              <TableCell className="min-w-[100px]">
                <Badge 
                  variant={getStatusVariant(row.status)} 
                  className={`capitalize ${getStatusBadgeStyle(row.status)}`}
                >
                  {row.status}
                </Badge>
              </TableCell>
              <TableCell className="min-w-[180px]">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-sm border ${getDateChipStyle(row.daysLeft)}`}>
                    {formatDate(row.expirationDate)}
                  </span>
                  {row.daysLeft <= 180 && row.daysLeft > 0 && (
                    <Badge className="bg-[#FFCC00] text-black hover:bg-[#FFCC00]/90 border-[#FFCC00]">
                      Extension Needed
                    </Badge>
                  )}
                  {row.daysLeft < 0 && (
                    <Badge className="bg-[#EF4444] text-white hover:bg-[#EF4444]/90 border-[#EF4444]">
                      Highest Priority
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell min-w-[100px]">
                <span className={row.daysLeft < 0 ? "text-red-600 font-medium" : row.daysLeft <= 30 ? "text-yellow-600 font-medium" : "text-black"}>
                  {row.daysLeft < 0 ? `${Math.abs(row.daysLeft)} overdue` : `${row.daysLeft} days`}
                </span>
              </TableCell>
              <TableCell className="hidden lg:table-cell min-w-[180px]">
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onViewEmployee?.(row)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}