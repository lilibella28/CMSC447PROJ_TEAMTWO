/**
 * Visa Status Utility Functions
 * Centralized logic for calculating visa status based on expiration dates
 */

import { EmployeeData } from "./employeeData";

export type VisaStatus = "Active" | "Pending" | "Expired" | "Processing" | "Expiring Soon";

/**
 * Calculate the current visa status based on expiration date and pending applications
 * @param expirationDate - The visa expiration date
 * @param hasPendingApplication - Whether there's a pending visa application
 * @returns The calculated visa status
 */
export function calculateVisaStatus(
  expirationDate: string,
  hasPendingApplication: boolean = false
): VisaStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
  
  const expDate = new Date(expirationDate);
  expDate.setHours(0, 0, 0, 0);
  
  const daysUntilExpiration = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // If expired
  if (daysUntilExpiration < 0) {
    // If expired but has pending application, mark as "Processing"
    if (hasPendingApplication) {
      return "Processing";
    }
    return "Expired";
  }
  
  // If expiring within 60 days but has pending application
  if (daysUntilExpiration <= 60 && hasPendingApplication) {
    return "Processing";
  }
  
  // If expiring within 30 days
  if (daysUntilExpiration <= 30) {
    return "Expiring Soon";
  }
  
  // If expiring within 60 days
  if (daysUntilExpiration <= 60) {
    return "Expiring Soon";
  }
  
  // Otherwise, it's active
  return "Active";
}

/**
 * Calculate days remaining until expiration
 * @param expirationDate - The visa expiration date
 * @returns Number of days until expiration (negative if expired)
 */
export function calculateDaysRemaining(expirationDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expDate = new Date(expirationDate);
  expDate.setHours(0, 0, 0, 0);
  
  return Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Get priority level based on visa status and days remaining
 * Used for sorting by urgency
 * @param status - The visa status
 * @param daysRemaining - Days until expiration
 * @returns Priority level (lower number = higher priority)
 */
export function getPriorityLevel(status: VisaStatus, daysRemaining: number): number {
  if (status === "Expired") return 1; // Highest priority
  if (status === "Processing") return 2;
  if (status === "Expiring Soon" && daysRemaining <= 30) return 3;
  if (status === "Expiring Soon" && daysRemaining <= 60) return 4;
  if (status === "Pending") return 5;
  return 6; // Active - lowest priority
}

/**
 * Get the badge variant for a given visa status
 * @param status - The visa status
 * @returns Badge variant string
 */
export function getStatusBadgeVariant(status: VisaStatus): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "Active":
      return "default";
    case "Expired":
      return "destructive";
    case "Processing":
    case "Pending":
      return "secondary";
    case "Expiring Soon":
      return "outline";
    default:
      return "default";
  }
}

/**
 * Get computed employee data with calculated status
 * @param employee - The employee data
 * @returns Employee data with computed status
 */
export function getEmployeeWithComputedStatus(employee: EmployeeData): EmployeeData & { computedStatus: VisaStatus; daysRemaining: number } {
  const hasPendingApplication = !!employee.pendingVisaApplication;
  const computedStatus = calculateVisaStatus(employee.expirationDate, hasPendingApplication);
  const daysRemaining = calculateDaysRemaining(employee.expirationDate);
  
  return {
    ...employee,
    computedStatus,
    daysRemaining,
  };
}

/**
 * Get all employees with computed status
 * @param employees - Array of employee data
 * @returns Array of employees with computed status and days remaining
 */
export function getEmployeesWithComputedStatus(
  employees: EmployeeData[]
): Array<EmployeeData & { computedStatus: VisaStatus; daysRemaining: number }> {
  return employees.map(getEmployeeWithComputedStatus);
}

/**
 * Sort employees by priority (most urgent first)
 * @param employees - Array of employees with computed status
 * @returns Sorted array of employees
 */
export function sortEmployeesByPriority(
  employees: Array<EmployeeData & { computedStatus: VisaStatus; daysRemaining: number }>
): Array<EmployeeData & { computedStatus: VisaStatus; daysRemaining: number }> {
  return [...employees].sort((a, b) => {
    const priorityA = getPriorityLevel(a.computedStatus, a.daysRemaining);
    const priorityB = getPriorityLevel(b.computedStatus, b.daysRemaining);
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    // If same priority, sort by days remaining (ascending)
    return a.daysRemaining - b.daysRemaining;
  });
}

/**
 * Format days remaining as human-readable string
 * @param days - Number of days
 * @returns Formatted string
 */
export function formatDaysRemaining(days: number): string {
  if (days < 0) {
    const absDays = Math.abs(days);
    if (absDays === 1) return "Expired 1 day ago";
    return `Expired ${absDays} days ago`;
  }
  
  if (days === 0) return "Expires today";
  if (days === 1) return "Expires tomorrow";
  if (days <= 7) return `Expires in ${days} days`;
  if (days <= 30) return `Expires in ${days} days`;
  if (days <= 60) return `Expires in ${Math.ceil(days / 7)} weeks`;
  if (days <= 365) return `Expires in ${Math.ceil(days / 30)} months`;
  
  const years = Math.floor(days / 365);
  const months = Math.ceil((days % 365) / 30);
  
  if (years === 1 && months === 0) return "Expires in 1 year";
  if (years === 1) return `Expires in 1 year, ${months} month${months !== 1 ? 's' : ''}`;
  if (months === 0) return `Expires in ${years} years`;
  return `Expires in ${years} years, ${months} month${months !== 1 ? 's' : ''}`;
}
