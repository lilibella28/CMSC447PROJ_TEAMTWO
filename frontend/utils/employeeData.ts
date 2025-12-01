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
  targetVisaType: string;
  applicationDate: string;
  status: "Pending" | "Under Review" | "Awaiting Decision" | "Approved" | "Denied";
  expectedDecisionDate?: string;
  notes?: string;
  filedBy: "Attorney" | "UMBC Administrator" | "Self-Petition";
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
  firstName?: string;
  lastName?: string;
  personalEmail?: string;
  gender?: "Male" | "Female" | "Non-binary" | "Prefer not to say" | string;
  countryOfBirth?: string;
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
  employeeTitle?: string;
  departmentAdmin?: string;
  departmentAdvisor?: string;
  annualSalary?: number;
  startDate: string;
  salaryHistory: SalaryRecord[];
  // Visa & Immigration
  visaType: string;
  status: "Active" | "Pending" | "Expired" | "Processing" | "Expiring Soon";
  visaStartDate?: string;
  expirationDate: string;
  visaFiledBy: "Attorney" | "UMBC Administrator" | "Self-Petition";
  caseType?: string;
  initialH1BStartDate?: string;
  prepExtensionDate?: string;
  maxHPeriod?: string;
  i94Number: string;
  i94ExpiryDate?: string;
  sevisId: string;
  permanentResidency?: PermanentResidencyInfo;
  // Dependents
  dependents: number;
  dependentsDetails: Dependent[];
  pendingVisaApplication?: PendingVisaApplication;
  // Education
  highestEducation?: "High School" | "Associate" | "Bachelor's" | "Master's" | "Doctorate" | "Other" | "B.A." | "M.S." | "Ph.D.";
  fieldOfStudy?: string;
  // Administrative
  socCode?: string;
  socCodeDescription?: string;
  generalNotes?: string;
}

// NOTE: Employee data is now stored in /public/data/employees.json
// Import and use via dataService.ts functions: fetchEmployees(), fetchEmployeeById(), etc.
