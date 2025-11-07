import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MapPin, Calendar, Eye, Mail } from "lucide-react";
import { VisaCase } from "../../utils/dataService";

interface EmployeeCardProps {
  employee: VisaCase;
  onViewEmployee?: (employee: VisaCase) => void;
  onEmailEmployee?: (employee: VisaCase) => void;
}

export function EmployeeCard({ employee, onViewEmployee, onEmailEmployee }: EmployeeCardProps) {
  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default";
      case "Expired":
        return "destructive";
      case "Processing":
        return "secondary";
      case "Expiring Soon":
        return "outline";
      default:
        return "default";
    }
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
    if (daysLeft < 0) return `Overdue by ${Math.abs(daysLeft)}`;
    return daysLeft;
  };

  return (
    <Card className="p-5 hover:shadow-md hover:bg-[#F3F4F6] transition-all duration-200">
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
          <span className={`font-semibold ${getDaysLeftColor(employee.daysLeft)}`}>
            {formatDaysLeft(employee.daysLeft)}
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
          onClick={() => onEmailEmployee?.(employee)}
        >
          <Mail className="h-3 w-3 mr-1" />
          Email
        </Button>
      </div>
    </Card>
  );
}