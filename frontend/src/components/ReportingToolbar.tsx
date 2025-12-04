import { useState } from "react";
import { Calendar, FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export type ReportingMode = "fiscal" | "academic" | "calendar" | "custom";

interface ReportingToolbarProps {
  onGenerateReport: (start_date: string, endDate: string, mode: ReportingMode) => void;
}

export function ReportingToolbar({ onGenerateReport }: ReportingToolbarProps) {
  const [reportingMode, setReportingMode] = useState<ReportingMode>("fiscal");
  const [start_date, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Get default date ranges based on reporting mode
  const getDateRangeForMode = (mode: ReportingMode): { start: string; end: string } => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-11

    switch (mode) {
      case "fiscal":
        // Fiscal Year: July 1 - June 30
        // If we're before July, use previous fiscal year start
        if (currentMonth < 6) {
          // Jan-Jun: use Jul 1 of previous year to Jun 30 of current year
          return {
            start: `${currentYear - 1}-07-01`,
            end: `${currentYear}-06-30`,
          };
        } else {
          // Jul-Dec: use Jul 1 of current year to Jun 30 of next year
          return {
            start: `${currentYear}-07-01`,
            end: `${currentYear + 1}-06-30`,
          };
        }

      case "academic":
        // Academic Year: September 1 - August 31
        if (currentMonth < 8) {
          // Jan-Aug: use Sep 1 of previous year to Aug 31 of current year
          return {
            start: `${currentYear - 1}-09-01`,
            end: `${currentYear}-08-31`,
          };
        } else {
          // Sep-Dec: use Sep 1 of current year to Aug 31 of next year
          return {
            start: `${currentYear}-09-01`,
            end: `${currentYear + 1}-08-31`,
          };
        }

      case "calendar":
        // Calendar Year: January 1 - December 31
        return {
          start: `${currentYear}-01-01`,
          end: `${currentYear}-12-31`,
        };

      case "custom":
        // Custom: Keep current dates or use current year
        return {
          start: start_date || `${currentYear}-01-01`,
          end: endDate || `${currentYear}-12-31`,
        };

      default:
        return { start: "", end: "" };
    }
  };

  // Handle reporting mode change
  const handleModeChange = (mode: ReportingMode) => {
    setReportingMode(mode);
    
    // Auto-populate dates for non-custom modes
    if (mode !== "custom") {
      const { start, end } = getDateRangeForMode(mode);
      setStartDate(start);
      setEndDate(end);
    }
  };

  // Handle generate report
  const handleGenerate = () => {
    if (!start_date || !endDate) {
      alert("Please select both start and end dates");
      return;
    }

    if (new Date(start_date) > new Date(endDate)) {
      alert("Start date must be before end date");
      return;
    }

    onGenerateReport(start_date, endDate, reportingMode);
  };

  // Initialize with fiscal year dates on mount
  useState(() => {
    const { start, end } = getDateRangeForMode("fiscal");
    setStartDate(start);
    setEndDate(end);
  });

  return (
    <div className="flex items-center justify-end gap-3 flex-wrap">
      {/* Reporting Mode Dropdown */}
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-gray-600" />
        <Select value={reportingMode} onValueChange={(value) => handleModeChange(value as ReportingMode)}>
          <SelectTrigger className="w-[180px] h-9 border-gray-300">
            <SelectValue placeholder="Select reporting mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fiscal">
              <div className="flex flex-col">
                <span className="font-medium">Fiscal Year</span>
                <span className="text-xs text-gray-500">July 1 – June 30</span>
              </div>
            </SelectItem>
            <SelectItem value="academic">
              <div className="flex flex-col">
                <span className="font-medium">Academic Year</span>
                <span className="text-xs text-gray-500">Sep 1 – Aug 31</span>
              </div>
            </SelectItem>
            <SelectItem value="calendar">
              <div className="flex flex-col">
                <span className="font-medium">Calendar Year</span>
                <span className="text-xs text-gray-500">Jan 1 – Dec 31</span>
              </div>
            </SelectItem>
            <SelectItem value="custom">
              <div className="flex flex-col">
                <span className="font-medium">Custom Range</span>
                <span className="text-xs text-gray-500">Select your own dates</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Range Picker */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-600" />
        <Input
          type="date"
          value={start_date}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-[140px] h-9 border-gray-300"
          disabled={reportingMode !== "custom"}
        />
        <span className="text-gray-500 text-sm">to</span>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-[140px] h-9 border-gray-300"
          disabled={reportingMode !== "custom"}
        />
      </div>

      {/* Generate Report Button */}
      <Button
        onClick={handleGenerate}
        className="h-9 bg-[#FFCC00] hover:bg-[#FFCC00]/90 text-black font-medium px-6"
        size="sm"
      >
        Generate Report
      </Button>
    </div>
  );
}