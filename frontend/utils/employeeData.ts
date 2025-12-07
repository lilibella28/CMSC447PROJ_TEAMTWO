// Employee Data Type Definitions
// All employee data is now stored in /public/data/employees.json
// This file only exports TypeScript interfaces for type safety

export interface SalaryRecord {
  effectiveDate: string;
  amount: number;
  position: string;
  changeReason?: string;
}

export interface Dependent {
  id: string;
  name: string;
  relationship: "Spouse" | "Child" | "Parent" | "Sibling";
  dateOfBirth: string;
  nationality: string;
  passportNumber?: string;
}

export interface PendingVisaApplication {
  targetvisa_type: string;
  applicationDate: string;
  status: "Pending" | "Under Review" | "Awaiting Decision" | "Approved" | "Denied";
  expectedDecisionDate?: string;
  notes?: string;
  filed_by: "Attorney" | "UMBC Administrator" | "Self-Petition";
}

export interface PermanentResidencyInfo {
  filingDate?: string;
  currentStatus?: "Not Started" | "Filed" | "Awaiting Response" | "Approved" | "Denied";
  notes?: string;
}

export interface EmployeeData {
  id: number;
  employeeName: string;
  // Personal Information
  first_name?: string;
  last_name?: string;
  personal_email?: string;
  gender?: "Male" | "Female" | "Non-binary" | "Prefer not to say" | string;
  country_of_birth?: string;
  citizenship?: string[];
  // Contact & Identity
  email: string;
  phone: string;
  address: string;
  nationality: string;
  dateOfBirth: string;
  passportNumber: string;
  // Employment Information
  department: string;
  employee_title?: string;
  department_admin?: string;
  department_advisor?: string;
 annual_salary?: number;
  start_date: string;
  salary_history: SalaryRecord[];
  // Visa & Immigration
  visa_type: string;
  status: "Active" | "Pending" | "Expired" | "Processing" | "Expiring Soon";
  visa_start_date?: string;
  expiration_date: string;
  visaFiledBy: "Attorney" | "UMBC Administrator" | "Self-Petition";
  case_type?: string;
  initial_h1b_start_date?: string;
  prep_extension_date ?: string;
  max_h_period?: string;
 i94_number: string;
  i94_expiry_date?: string;
  sevis_id: string;
  permanentResidency?: PermanentResidencyInfo;
  // number_of_dependents
  number_of_dependents: number;
  number_of_dependentsDetails: Dependent[];
  pendingVisaApplication?: PendingVisaApplication;
  // Education
  highest_education?: "High School" | "Associate" | "Bachelor's" | "Master's" | "Doctorate" | "Other" | "B.A." | "M.S." | "Ph.D.";
  field_of_study?: string;
  // Administrative
  soc_code?: string;
  soc_code_description?: string;
  general_notes?: string;
}

// NOTE: Employee data is now stored in /public/data/employees.json
// Import and use via dataService.ts functions: fetchEmployees(), fetchEmployeeById(), etc.
