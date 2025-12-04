/**
 * Missing Dates Warning Banner
 * Displays warnings for employees with missing/invalid visa dates
 * Shows across Dashboard, Employees, Reports, and other employee list views
 */

import { AlertTriangle, X, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { useMissingDates, EmployeeWithMissingDates } from '../contexts/MissingDatesContext';
import { Badge } from './ui/badge';

interface MissingDatesWarningBannerProps {
  onNavigateToEmployee?: (employeeId: string) => void;
  showDismissAll?: boolean;
  maxVisible?: number;
}

export function MissingDatesWarningBanner({ 
  onNavigateToEmployee,
  showDismissAll = true,
  maxVisible = 3
}: MissingDatesWarningBannerProps) {
  const { 
    employeesWithMissingDates, 
    hasWarnings, 
    clearAllWarnings,
    removeEmployeeFromWarnings,
    getWarningsCount 
  } = useMissingDates();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (!hasWarnings || isDismissed) {
    return null;
  }

  const warningCount = getWarningsCount();
  const displayedEmployees = isExpanded 
    ? employeesWithMissingDates 
    : employeesWithMissingDates.slice(0, maxVisible);
  const hasMore = warningCount > maxVisible;

  const handleDismissAll = () => {
    setIsDismissed(true);
    // Don't clear from context - just hide the banner
    // clearAllWarnings();
  };

  const handleDismissOne = (employeeId: string) => {
    removeEmployeeFromWarnings(employeeId);
  };

  const handleNavigate = (employeeId: string) => {
    if (onNavigateToEmployee) {
      onNavigateToEmployee(employeeId);
    }
  };

  return (
    <Alert className="border-[#EFB74A] bg-[#FFF9EB] mb-6 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-[#EFB74A] mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <AlertDescription className="text-[#7A4C00]">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-[#7A4C00]">
                  ⚠️ Missing Visa Dates Detected
                </p>
                <p className="text-sm mt-1">
                  {warningCount} {warningCount === 1 ? 'employee has' : 'employees have'} missing or invalid visa dates from the recent import. 
                  Please update these records to ensure compliance.
                </p>
              </div>
              {showDismissAll && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismissAll}
                  className="text-[#7A4C00] hover:text-[#5A3600] hover:bg-[#FFE8B3] -mt-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Employee List */}
            <div className="space-y-2 mt-3">
              {displayedEmployees.map((employee) => (
                <div
                  key={employee.employeeId}
                  className="bg-white/50 rounded-md p-3 border border-[#EFB74A]/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-[#1E1E1E]">
                          {employee.employeeName}
                        </p>
                        <Badge variant="outline" className="text-xs bg-[#FFF9EB] border-[#EFB74A] text-[#7A4C00]">
                          {employee.missingFields.length} {employee.missingFields.length === 1 ? 'field' : 'fields'}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#6B7280] mb-2">{employee.email}</p>
                      <div className="flex flex-wrap gap-1">
                        {employee.missingFields.map((field, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]"
                          >
                            Missing: {field}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {onNavigateToEmployee && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleNavigate(employee.employeeId)}
                          className="bg-[#FFCC00] text-black hover:bg-[#FFCC00]/90 border-[#FFCC00] text-xs"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Fix Now
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismissOne(employee.employeeId)}
                        className="text-[#7A4C00] hover:text-[#5A3600] hover:bg-[#FFE8B3]"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Expand/Collapse Button */}
            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-3 text-[#7A4C00] hover:text-[#5A3600] hover:bg-[#FFE8B3] w-full"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Show All ({warningCount - maxVisible} more)
                  </>
                )}
              </Button>
            )}

            {/* Action Footer */}
            <div className="mt-3 pt-3 border-t border-[#EFB74A]/30">
              <p className="text-xs text-[#7A4C00]">
                <strong>Next Steps:</strong> Click "Fix Now" to navigate to each employee's profile and update the missing dates.
                Missing dates are highlighted in red with tooltips explaining the issue.
              </p>
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}