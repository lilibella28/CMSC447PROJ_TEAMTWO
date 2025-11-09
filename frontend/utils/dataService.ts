// Data Service - Handles data fetching from local data (will be replaced with API calls)
// This abstraction makes it easy to switch from local data to API without changing components

import { Dependent, PendingVisaApplication } from './employeeData';
import { calculateVisaStatus, calculateDaysRemaining } from './visaStatusUtils';

export interface SalaryRecord {
  effectiveDate: string;
  amount: number;
  position: string;
  changeReason?: string;
}

export interface PermanentResidencyInfo {
  filingDate?: string;
  currentStatus?: "Not Started" | "Filed" | "Awaiting Response" | "Approved" | "Denied";
  notes?: string;
}

export interface Employee {
  id: number;
  employeeName?: string;
  // Personal Information
  firstName?: string;
  lastName?: string;
  personalEmail?: string;
  gender?: "Male" | "Female" | "Non-binary" | "Prefer not to say" | string;
  countryOfBirth?: string;
  citizenships?: string[]; // Array of countries
  // Contact & Identity
  email: string; // UMBC Email
  phone: string;
  address: string;
  nationality: string;
  dateOfBirth: string;
  passportNumber: string;
  // Employment Information
  department: string;
  employeeTitle?: string; // Position/Job Title
  departmentAdmin?: string;
  departmentAdvisor?: string; // PI / Chair
  annualSalary?: number;
  startDate: string;
  salaryHistory: SalaryRecord[];
  // Visa & Immigration
  visaType: string;
  status: "Active" | "Pending" | "Expired" | "Processing" | "Expiring Soon";
  visaStartDate: string;
  expirationDate: string;
  visaFiledBy: "Attorney" | "UMBC Administrator" | "Self-Petition";
  caseType?: string; // e.g., "H-1B Extension", "Initial COS", "Change of Status"
  initialH1BStartDate?: string;
  prepExtensionDate?: string; // Reminder field for when to prep extension
  maxHPeriod?: string; // Max H-1B period end date
  i94Number: string;
  i94ExpiryDate?: string;
  sevisId: string;
  permanentResidency?: PermanentResidencyInfo;
  // Dependents
  dependents: number;
  dependentsDetails: Dependent[];
  pendingVisaApplication?: PendingVisaApplication;
  // Education
  highestEducation?: "High School" | "Associate" | "Bachelor's" | "Master's" | "Doctorate" | "Other";
  fieldOfStudy?: string;
  // Administrative
  socCode?: string;
  socCodeDescription?: string;
  generalNotes?: string;
}

export type { Dependent, PendingVisaApplication };

export interface VisaCase {
  id: string;
  employee: {
    name: string;
    department: string;
    email?: string;
    phone?: string;
  };
  visaType: string;
  status: "Active" | "Pending" | "Expired" | "Processing" | "Expiring Soon";
  expirationDate: string;
  visaStartDate: string;
  daysLeft: number;
  visaFiledBy: "Attorney" | "UMBC Administrator" | "Self-Petition";
  hasPendingApplication?: boolean;
  pendingTargetVisaType?: string;
}

// Calculate days left until expiration
function calculateDaysLeft(expirationDate: string): number {
  const today = new Date();
  const expDate = new Date(expirationDate);
  const diffTime = expDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Convert Employee to VisaCase format
function employeeToVisaCase(employee: Employee): VisaCase {
  // Safely build full name from either `employeeName` or first/last name
  const fullName =
    employee.employeeName ||
    `${employee.firstName ?? ""} ${employee.lastName ?? ""}`.trim() ||
    "Unnamed Employee";

  const hasPendingApplication = !!employee.pendingVisaApplication;
  const daysLeft = calculateDaysRemaining(employee.expirationDate);
  const computedStatus = calculateVisaStatus(employee.expirationDate, hasPendingApplication);

  return {
    id: employee.id.toString(),
    employee: {
      name: fullName,
      department: employee.department || "Unknown Department",
      email: employee.email,
      phone: employee.phone,
    },
    visaType: employee.visaType,
    status: computedStatus, // Use computed status instead of stored status
    expirationDate: employee.expirationDate,
    visaStartDate: employee.visaStartDate || employee.startDate,
    daysLeft,
    visaFiledBy: employee.visaFiledBy,
    hasPendingApplication,
    pendingTargetVisaType: employee.pendingVisaApplication?.targetVisaType,
  };
}


// ========================================
// DATA FETCHING FUNCTIONS
// ========================================

/**
 * Fetch all visa cases from local data
 * TODO: Replace with API call to: GET /api/visa-cases
 */
export async function fetchVisaCases(): Promise<VisaCase[]> {
  try {
    const response = await fetch("http://127.0.0.1:5000/api/employees");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const employees = await response.json();
    console.log("✅ Loaded employees from backend:", employees.length);

    return employees.map((emp: any) => employeeToVisaCase(emp));
  } catch (error) {
    console.error("❌ Error fetching visa cases:", error);
    return [];
  }
}


/**
 * Fetch all employees from local data
 * TODO: Replace with API call to: GET /api/employees
 */
export async function fetchEmployees(): Promise<Employee[]> {
  try {
    const response = await fetch("http://127.0.0.1:5000/api/employees");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Loaded employees for fetchEmployees:", data.length);
    return data;
  } catch (error) {
    console.error("❌ Error fetching employees:", error);
    return [];
  }
}


/**
 * Fetch single employee by ID
 * TODO: Replace with API call to: GET /api/employees/:id
 */

export async function fetchEmployeeById(id: number | string): Promise<Employee> {
  const response = await fetch(`http://127.0.0.1:5000/api/employees/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch employee: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}



/**
 * Create new employee
 * TODO: Replace with API call to: POST /api/employees
 */
export async function createEmployee(employeeData: Omit<Employee, "id">): Promise<Employee> {
  try {
    const response = await fetch("http://127.0.0.1:5000/api/employees/newcase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employeeData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Employee created successfully:", data.employee);
    return data.employee;
  } catch (error) {
    console.error("❌ Error creating employee:", error);
    throw error;
  }
}

/**
 * Update employee
 * TODO: Replace with API call to: PUT /api/employees/:id
 */
export async function updateEmployee(id: string, employeeData: Partial<Employee>): Promise<Employee> {
  try {
    const response = await fetch(`http://127.0.0.1:5000/api/employees/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employeeData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const updated = await response.json();
    console.log("✅ Employee updated successfully:", updated);
    return updated;
  } catch (error) {
    console.error("❌ Error updating employee:", error);
    throw error;
  }
}


/**
 * Delete employee
 * TODO: Replace with API call to: DELETE /api/employees/:id
 */
export async function deleteEmployee(id: string): Promise<boolean> {
  try {
    // Current implementation: Mock delete (doesn't persist to CSV)
    console.log('Employee deleted (mock):', id);
    return true;
    
    // Future API implementation (commented out):
    // const response = await fetch(`http://localhost:5000/api/employees/${id}`, {
    //   method: 'DELETE',
    // });
    // return response.ok;
    
  } catch (error) {
    console.error('Error deleting employee:', error);
    throw error;
  }
}

// ========================================
// ANALYTICS & STATISTICS
// ========================================

/**
 * Get dashboard statistics
 * TODO: Replace with API call to: GET /api/statistics
 */
export async function fetchStatistics() {
  try {
    const visaCases = await fetchVisaCases();
    
    return {
      activeVisas: visaCases.filter(v => v.status === "Active").length,
      expiringWithin60Days: visaCases.filter(v => v.daysLeft > 0 && v.daysLeft <= 60).length,
      expired: visaCases.filter(v => v.daysLeft < 0).length,
      pending: visaCases.filter(v => v.status === "Processing").length,
      totalVisas: visaCases.length,
    };
    
    // Future API implementation (commented out):
    // const response = await fetch('http://localhost:5000/api/statistics');
    // const data = await response.json();
    // return data;
    
  } catch (error) {
    console.error('Error fetching statistics:', error);
    throw error;
  }
}
