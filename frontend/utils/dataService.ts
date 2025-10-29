// Data Service - Handles data fetching from local data (will be replaced with API calls)
// This abstraction makes it easy to switch from local data to API without changing components

import { employeesData } from './employeeData';

export interface Employee {
  id: number;
  employeeName: string;
  department: string;
  visaType: string;
  status: "Active" | "Pending" | "Expired" | "Pending";
  expirationDate: string;
  visaStartDate: string;
  email: string;
  phone: string;
  address: string;
  nationality: string;
  dateOfBirth: string;
  passportNumber: string;
  i94Number: string;
  sevisId: string;
  startDate: string;
}

export interface VisaCase {
  id: string;
  employee: {
    name: string;
    department: string;
    email?: string;
    phone?: string;
  };
  visaType: string;
  status: "Active" | "Expired" | "Pending";
  expirationDate: string;
  visaStartDate: string;
  daysLeft: number;
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
  return {
    id: employee.id.toString(),
    employee: {
      name: employee.employeeName,
      department: employee.department,
      email: employee.email,
      phone: employee.phone,
    },
    visaType: employee.visaType,
    status: employee.status,
    expirationDate: employee.expirationDate,
    visaStartDate: employee.visaStartDate,
    daysLeft: calculateDaysLeft(employee.expirationDate),
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
    // Current implementation: Load from local TypeScript data
    // Simulate async behavior to match future API calls
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const employees: Employee[] = employeesData as Employee[];
    return employees.map(employeeToVisaCase);
    
    // Future API implementation (commented out):
    // const response = await fetch('http://localhost:5000/api/visa-cases');
    // if (!response.ok) {
    //   throw new Error(`HTTP error! status: ${response.status}`);
    // }
    // const data = await response.json();
    // return data;
    
  } catch (error) {
    console.error('Error fetching visa cases:', error);
    throw error;
  }
}

/**
 * Fetch all employees from local data
 * TODO: Replace with API call to: GET /api/employees
 */
export async function fetchEmployees(): Promise<Employee[]> {
  try {
    // Current implementation: Load from local TypeScript data
    // Simulate async behavior to match future API calls
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return employeesData as Employee[];
    
    // Future API implementation (commented out):
    // const response = await fetch('http://localhost:5000/api/employees');
    // if (!response.ok) {
    //   throw new Error(`HTTP error! status: ${response.status}`);
    // }
    // const data = await response.json();
    // return data;
    
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
}

/**
 * Fetch single employee by ID
 * TODO: Replace with API call to: GET /api/employees/:id
 */
export async function fetchEmployeeById(id: string): Promise<Employee | null> {
  try {
    // Current implementation: Load from JSON and filter
    const employees = await fetchEmployees();
    return employees.find(emp => emp.id.toString() === id) || null;
    
    // Future API implementation (commented out):
    // const response = await fetch(`http://localhost:5000/api/employees/${id}`);
    // const data = await response.json();
    // return data;
    
  } catch (error) {
    console.error('Error fetching employee:', error);
    throw error;
  }
}

/**
 * Create new employee
 * TODO: Replace with API call to: POST /api/employees
 */
export async function createEmployee(employeeData: Omit<Employee, 'id'>): Promise<Employee> {
  try {
    // Current implementation: Mock creation (doesn't persist to CSV)
    const newEmployee: Employee = {
      id: Date.now().toString(),
      ...employeeData,
    };
    
    console.log('Employee created (mock):', newEmployee);
    return newEmployee;
    
    // Future API implementation (commented out):
    // const response = await fetch('http://localhost:5000/api/employees', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(employeeData),
    // });
    // const data = await response.json();
    // return data;
    
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error;
  }
}

/**
 * Update employee
 * TODO: Replace with API call to: PUT /api/employees/:id
 */
export async function updateEmployee(id: string, employeeData: Partial<Employee>): Promise<Employee> {
  try {
    // Current implementation: Mock update (doesn't persist to CSV)
    const employees = await fetchEmployees();
    const employee = employees.find(emp => emp.id === id);
    
    if (!employee) {
      throw new Error(`Employee with ID ${id} not found`);
    }
    
    const updatedEmployee = { ...employee, ...employeeData };
    console.log('Employee updated (mock):', updatedEmployee);
    return updatedEmployee;
    
    // Future API implementation (commented out):
    // const response = await fetch(`http://localhost:5000/api/employees/${id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(employeeData),
    // });
    // const data = await response.json();
    // return data;
    
  } catch (error) {
    console.error('Error updating employee:', error);
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
      completed: 312, // Static for now
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
