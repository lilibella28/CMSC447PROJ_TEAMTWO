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
  first_name?: string;
  last_name?: string;
  personal_email?: string;
  gender?: "Male" | "Female" | "Non-binary" | "Prefer not to say" | string;
  country_of_birth?: string;
  citizenship?: string[]; // Array of countries
  // Contact & Identity
  email: string; // UMBC Email
  phone: string;
  address: string;
  nationality: string;
  dateOfBirth: string;
  passportNumber: string;
  // Employment Information
  department: string;
  employee_title?: string; // Position/Job Title
  department_admin?: string;
  department_advisor?: string; // PI / Chair
  annual_salary?: number;
  start_date: string;
  salary_history: SalaryRecord[];
  // Visa & Immigration
  visa_type: string;
  status: "Active" | "Pending" | "Expired" | "Processing" | "Expiring Soon";
  visa_start_date: string;
  expiration_date: string;
  visaFiledBy: "Attorney" | "UMBC Administrator" | "Self-Petition";
  case_type?: string; // e.g., "H-1B Extension", "Initial COS", "Change of Status"
  initial_h1b_start_date?: string;
  prep_extension_date ?: string; // Reminder field for when to prep extension
  max_h_period?: string; // Max H-1B period end date
 i94_number: string;
  i94_expiry_date?: string;
  sevis_id: string;
  permanentResidency?: PermanentResidencyInfo;
  // number_of_dependents
  number_of_dependents: number;
  number_of_dependentsDetails: Dependent[];
  pendingVisaApplication?: PendingVisaApplication;
  // Education
  highest_education?: "High School" | "Associate" | "Bachelor's" | "Master's" | "Doctorate" | "Other";
  field_of_study?: string;
  // Administrative
  soc_code?: string;
  soc_code_description?: string;
  general_notes?: string;
}

export type { Dependent, PendingVisaApplication };

export interface VisaCase {
  id: string;
  employee: {
    id(id: any): unknown;
    name: string;
    department: string;
    email?: string;
    phone?: string;
  };
  visa_type: string;
  status: "Active" | "Pending" | "Expired" | "Processing" | "Expiring Soon";
  expiration_date: string;
  visa_start_date: string;
  daysLeft: number;
  visaFiledBy: "Attorney" | "UMBC Administrator" | "Self-Petition";
  hasPendingApplication?: boolean;
  pendingTargetvisa_type?: string;
}


// Convert Employee to VisaCase format
function employeeToVisaCase(employee: Employee): VisaCase {
  // Safely build full name from either `employeeName` or first/last name
  const fullName =
    employee.employeeName ||
    `${employee.first_name ?? ""} ${employee.last_name ?? ""}`.trim() ||
    "Unnamed Employee";

  const hasPendingApplication = !!employee.pendingVisaApplication;
  const daysLeft = calculateDaysRemaining(employee.expiration_date);
  const computedStatus = calculateVisaStatus(employee.expiration_date, hasPendingApplication);

  return {
    id: employee.id.toString(),
    employee: {
      name: fullName,
      department: employee.department || "Unknown Department",
      email: employee.email,
      phone: employee.phone,
    },
    visa_type: employee.visa_type,
    status: computedStatus, // Use computed status instead of stored status
    expiration_date: employee.expiration_date,
    visa_start_date: employee.visa_start_date || employee.start_date,
    daysLeft,
    visaFiledBy: employee.visaFiledBy,
    hasPendingApplication,
    pendingTargetvisa_type: employee.pendingVisaApplication?.targetvisa_type,
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

export async function fetchUsers() {
  const res = await fetch("http://localhost:5000/api/auth/users", {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to load users");
  }

  return data.users;
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
 * Delete employee using backend API
 * DELETE /api/employees/:id
 */
export async function deleteEmployee(id: string): Promise<boolean> {
  try {
    const response = await fetch(`http://127.0.0.1:5000/api/employees/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to delete employee:", response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting employee:", error);
    return false;
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


// ========================================
// VISA HISTORY API FUNCTIONS
// ========================================

export interface VisaHistoryRecord {
  id: number;
  employee_id: number;
  visa_type: string;
  status: string;
  start_date: string;
  expiration_date: string;
  comments?: string;
  added_at: string;
  added_by: string;
  is_current: boolean;
}

/**
 * Fetch all visa history records for an employee
 * GET /api/employees/:id/visa-history
 */
export async function fetchVisaHistory(employeeId: number): Promise<VisaHistoryRecord[]> {
  try {
    const API_BASE = 'http://localhost:5000/api';
    const response = await fetch(`${API_BASE}/employees/${employeeId}/visa-history`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch visa history: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      return data.visa_history || [];
    } else {
      throw new Error(data.error || 'Failed to fetch visa history');
    }
  } catch (error) {
    console.error('Error fetching visa history:', error);
    return []; // Return empty array on error
  }
}

/**
 * Add a new visa history record
 * POST /api/employees/:id/visa-history
 */
export async function addVisaHistory(
  employeeId: number,
  visaData: {
    visa_type: string;
    status: string;
    start_date: string;
    expiration_date: string;
    comments?: string;
    added_by: string;
    is_current?: boolean;
  }
): Promise<{ success: boolean; visa_history?: VisaHistoryRecord; error?: string }> {
  try {
    const API_BASE = 'http://localhost:5000/api';
    const response = await fetch(`${API_BASE}/employees/${employeeId}/visa-history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(visaData),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to add visa history',
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error adding visa history:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update an existing visa history record
 * PUT /api/visa-history/:id
 */
export async function updateVisaHistory(
  historyId: number,
  updates: {
    status?: string;
    expiration_date?: string;
    comments?: string;
  }
): Promise<{ success: boolean; visa_history?: VisaHistoryRecord; error?: string }> {
  try {
    const API_BASE = 'http://localhost:5000/api';
    const response = await fetch(`${API_BASE}/visa-history/${historyId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to update visa history',
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error updating visa history:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}