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
import { Mail, Eye, Clock, AlertCircle } from "lucide-react";
import { VisaCase } from "../utils/dataService";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./ui/tooltip";

// Re-export VisaCase for backward compatibility
export type { VisaCase };

interface DataTableProps {
  data: VisaCase[];
  onViewEmployee?: (employee: VisaCase) => void;
}

export function DataTable({ data, onViewEmployee }: DataTableProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "outline"; // Outline variant has less conflicting styles
      case "Pending":
        return "secondary";
      case "Expired":
        return "destructive";
      case "Processing":
        return "outline"; // Outline variant has less conflicting styles
      case "Expiring Soon":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    if (status === "Active") {
      return "!bg-[#5BB974] !text-white !border-[#5BB974] hover:!bg-[#5BB974]/90";
    }
    if (status === "Expired") {
      return "!bg-[#D86464] !text-white !border-[#D86464] hover:!bg-[#D86464]/90";
    }
    if (status === "Processing" || status === "Pending") {
      return "!bg-[#9E9E9E] !text-white !border-[#9E9E9E] hover:!bg-[#9E9E9E]/90";
    }
    if (status === "Expiring Soon") {
      return "!bg-[#EFB74A] !text-white !border-[#EFB74A] hover:!bg-[#EFB74A]/90";
    }
    return "";
  };

  const getRowBorderColor = (daysLeft: number) => {
    if (daysLeft < 0) return "border-l-4 border-l-[#D86464]"; // Expired/overdue - Red
    if (daysLeft <= 30) return "border-l-4 border-l-[#D86464]"; // ≤30 days - Red
    if (daysLeft <= 90) return "border-l-4 border-l-[#EFB74A]"; // 31-90 days - Yellow
    return "border-l-4 border-l-[#5BB974]"; // 90+ days - Green
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
              <TableCell className="text-black min-w-[120px]">{row.visa_type}</TableCell>
              <TableCell className="min-w-[100px]">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={getStatusVariant(row.status)} 
                    className={`capitalize ${getStatusBadgeStyle(row.status)}`}
                  >
                    {row.status}
                  </Badge>
                  {row.status === "Expired" && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className="bg-[#DC2626] text-white border-[#DC2626] hover:bg-[#DC2626]/90 flex items-center gap-1 cursor-help whitespace-nowrap">
                          <AlertCircle className="h-3 w-3" />
                          Highest Priority
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>This employee's visa has expired and needs action.</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </TableCell>
              <TableCell className="min-w-[180px]">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded text-sm border ${getDateChipStyle(row.daysLeft)}`}>
                    {formatDate(row.expiration_date)}
                  </span>
                  {row.daysLeft <= 180 && row.daysLeft > 0 && (
                    <Badge className="bg-[#FFCC00] text-black hover:bg-[#FFCC00]/90 border-[#FFCC00]">
                      Extension Needed
                    </Badge>
                  )}
                  {row.daysLeft < 0 && (
                    <Badge className="bg-[#D86464] text-white hover:bg-[#D86464]/90 border-[#D86464]">
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