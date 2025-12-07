// Employee Data - Centralized data source
// This file contains all employee visa tracking data
// Import this in dataService.ts to avoid 404 errors from fetching public JSON

import { EmployeeData } from './employeeData';

export const employeesData: EmployeeData[] = [
  {
    id: 1,
    employeeName: "Laura Smith",
    firstName: "Laura",
    lastName: "Smith",
    email: "lsmith@umbc.edu",
    personal_email: "laura.smith@gmail.com",
    gender: "Female",
    country_of_birth: "Canada",
    citizenship: ["Canada"],
    phone: "+1-410-555-0201",
    address: "123 Research Blvd, Baltimore, MD 21250",
    nationality: "Canada",
    dateOfBirth: "1988-06-15",
    passportNumber: "CA8765432",
    department: "Physics",
    employee_title: "Assistant Research Scientist",
    department_admin: "Diane Owens",
    department_advisor: "Dr. Don Engem",
   annual_salary: 94500,
    start_date: "2023-05-01",
    visa_type: "H-1B",
    status: "Active",
    visa_start_date: "2023-05-01",
    expiration_date: "2026-05-01",
    visaFiledBy: "Attorney",
    case_type: "H-1B Extension",
    initial_h1b_start_date: "2020-05-01",
    prep_extension_date : "2026-02-01",
    max_h_period: "2029-05-01",
   i94_number: "94320230501",
    i94_expiry_date: "2026-05-01",
    sevis_id: "N/A",
    permanentResidency: {
      filingDate: "2025-04-10",
      currentStatus: "Awaiting Response",
      notes: "Applied for PR on 2025-04-10, awaiting approval"
    },
    number_of_dependents: 2,
    number_of_dependentsDetails: [
      {
        id: "d1-1",
        name: "James Smith",
        relationship: "Spouse",
        dateOfBirth: "1987-03-22",
        nationality: "Canada",
        passportNumber: "CA8765433"
      },
      {
        id: "d1-2",
        name: "Emma Smith",
        relationship: "Child",
        dateOfBirth: "2018-09-10",
        nationality: "Canada",
        passportNumber: "CA8765434"
      }
    ],
    highest_education: "Ph.D.",
    field_of_study: "Astrophysics",
    soc_code: "19-2012.00",
    soc_code_description: "Physicists",
    general_notes: "Needs travel signature update",
    salary_history: [
      {
        effectiveDate: "2020-05-01",
        amount: 75000,
        position: "Research Associate",
        changeReason: "Initial hire"
      },
      {
        effectiveDate: "2023-05-01",
        amount: 94500,
        position: "Assistant Research Scientist",
        changeReason: "Promotion and H-1B extension"
      }
    ]
  },
  {
    id: 2,
    employeeName: "Marcos Gonzalez",
    firstName: "Marcos",
    lastName: "Gonzalez",
    email: "mgonzalez@umbc.edu",
    personal_email: "marcosg@outlook.com",
    gender: "Male",
    country_of_birth: "Mexico",
    citizenship: ["Mexico"],
    phone: "+1-410-555-0202",
    address: "456 Academic Way, Baltimore, MD 21250",
    nationality: "Mexico",
    dateOfBirth: "1985-11-03",
    passportNumber: "MX1234567",
    department: "Philosophy",
    employee_title: "Assistant Professor",
    department_admin: "Lisa Reed",
    department_advisor: "Dr. Yamowitz",
   annual_salary: 82000,
    start_date: "2024-04-01",
    visa_type: "H-1B",
    status: "Active",
    visa_start_date: "2024-04-01",
    expiration_date: "2027-04-01",
    visaFiledBy: "UMBC Administrator",
    case_type: "H-1B Initial",
    initial_h1b_start_date: "2024-03-01",
    prep_extension_date : "2027-01-01",
    max_h_period: "2030-04-01",
   i94_number: "94320240401",
    i94_expiry_date: "2027-04-01",
    sevis_id: "N/A",
    permanentResidency: {
      currentStatus: "Not Started",
      notes: "No PR process started"
    },
    number_of_dependents: 1,
    number_of_dependentsDetails: [
      {
        id: "d2-1",
        name: "Sofia Gonzalez",
        relationship: "Spouse",
        dateOfBirth: "1986-08-14",
        nationality: "Mexico",
        passportNumber: "MX1234568"
      }
    ],
    highest_education: "Ph.D.",
    field_of_study: "Philosophy",
    soc_code: "25-1126",
    soc_code_description: "Philosophy Teachers, Postsecondary",
    general_notes: "Currently in first visa cycle",
    salary_history: [
      {
        effectiveDate: "2024-04-01",
        amount: 82000,
        position: "Assistant Professor",
        changeReason: "Initial hire"
      }
    ]
  },
  {
    id: 3,
    employeeName: "Anaya Patel",
    firstName: "Anaya",
    lastName: "Patel",
    email: "apatel@umbc.edu",
    personal_email: "anaya.patel@yahoo.com",
    gender: "Female",
    country_of_birth: "India",
    citizenship: ["India", "USA"],
    phone: "+1-410-555-0203",
    address: "789 Engineering Dr, Baltimore, MD 21250",
    nationality: "India",
    dateOfBirth: "1990-04-20",
    passportNumber: "IN9876543",
    department: "Computer Science",
    employee_title: "Research Engineer",
    department_admin: "Robert Chen",
    department_advisor: "Dr. M. Liu",
   annual_salary: 115000,
    start_date: "2024-01-01",
    visa_type: "H-1B",
    status: "Active",
    visa_start_date: "2024-01-01",
    expiration_date: "2027-01-01",
    visaFiledBy: "Self-Petition",
    case_type: "H-1B Extension",
    initial_h1b_start_date: "2018-02-15",
    prep_extension_date : "2026-10-01",
    max_h_period: "2029-01-01",
   i94_number: "94320240101",
    i94_expiry_date: "2027-01-01",
    sevis_id: "N/A",
    permanentResidency: {
      filingDate: "2023-05-20",
      currentStatus: "Approved",
      notes: "PR approved on 2024-12-10"
    },
    number_of_dependents: 0,
    number_of_dependentsDetails: [],
    highest_education: "M.S.",
    field_of_study: "Computer Science",
    soc_code: "15-1132.00",
    soc_code_description: "Software Developers, Applications",
    general_notes: "Transitioned to PR",
    salary_history: [
      {
        effectiveDate: "2018-02-15",
        amount: 85000,
        position: "Software Engineer",
        changeReason: "Initial hire"
      },
      {
        effectiveDate: "2021-02-15",
        amount: 98000,
        position: "Senior Software Engineer",
        changeReason: "Promotion"
      },
      {
        effectiveDate: "2024-01-01",
        amount: 115000,
        position: "Research Engineer",
        changeReason: "H-1B extension and role change"
      }
    ]
  },
  {
    id: 4,
    employeeName: "David Kim",
    firstName: "David",
    lastName: "Kim",
    email: "dkim@umbc.edu",
    personal_email: "davidkim@gmail.com",
    gender: "Male",
    country_of_birth: "South Korea",
    citizenship: ["South Korea"],
    phone: "+1-410-555-0204",
    address: "321 Innovation Pkwy, Baltimore, MD 21250",
    nationality: "South Korea",
    dateOfBirth: "1984-02-28",
    passportNumber: "KR5432198",
    department: "Engineering",
    employee_title: "Research Associate",
    department_admin: "Angela Morris",
    department_advisor: "Dr. S. Tan",
   annual_salary: 89000,
    start_date: "2022-06-01",
    visa_type: "H-1B",
    status: "Active",
    visa_start_date: "2022-06-01",
    expiration_date: "2025-06-01",
    visaFiledBy: "Attorney",
    case_type: "H-1B Extension",
    initial_h1b_start_date: "2019-06-01",
    prep_extension_date : "2025-03-01",
    max_h_period: "2028-06-01",
   i94_number: "94320220601",
    i94_expiry_date: "2025-06-01",
    sevis_id: "N/A",
    permanentResidency: {
      filingDate: "2024-09-15",
      currentStatus: "Filed",
      notes: "PR pending since 2024-09-15"
    },
    number_of_dependents: 3,
    number_of_dependentsDetails: [
      {
        id: "d4-1",
        name: "Ji-Yeon Kim",
        relationship: "Spouse",
        dateOfBirth: "1985-05-17",
        nationality: "South Korea",
        passportNumber: "KR5432199"
      },
      {
        id: "d4-2",
        name: "Min-Jun Kim",
        relationship: "Child",
        dateOfBirth: "2015-03-12",
        nationality: "South Korea",
        passportNumber: "KR5432200"
      },
      {
        id: "d4-3",
        name: "Seo-Yeon Kim",
        relationship: "Child",
        dateOfBirth: "2017-11-08",
        nationality: "South Korea",
        passportNumber: "KR5432201"
      }
    ],
    highest_education: "Ph.D.",
    field_of_study: "Electrical Engineering",
    soc_code: "17-2199.00",
    soc_code_description: "Engineers, All Other",
    general_notes: "Travel restriction lifted",
    salary_history: [
      {
        effectiveDate: "2019-06-01",
        amount: 72000,
        position: "Research Assistant",
        changeReason: "Initial hire"
      },
      {
        effectiveDate: "2022-06-01",
        amount: 89000,
        position: "Research Associate",
        changeReason: "H-1B extension and promotion"
      }
    ]
  },
  {
    id: 5,
    employeeName: "Noor Ahmed",
    firstName: "Noor",
    lastName: "Ahmed",
    email: "nahmed@umbc.edu",
    personal_email: "noorahmed@gmail.com",
    gender: "Female",
    country_of_birth: "Egypt",
    citizenship: ["Egypt"],
    phone: "+1-410-555-0205",
    address: "654 Admin Plaza, Baltimore, MD 21250",
    nationality: "Egypt",
    dateOfBirth: "1992-07-19",
    passportNumber: "EG7654321",
    department: "Administration",
    employee_title: "Program Coordinator",
    department_admin: "Kelly Brooks",
    department_advisor: "Dr. Fiona Hart",
   annual_salary: 63500,
    start_date: "2023-03-01",
    visa_type: "H-1B",
    status: "Active",
    visa_start_date: "2023-03-01",
    expiration_date: "2026-03-01",
    visaFiledBy: "UMBC Administrator",
    case_type: "H-1B Initial",
    initial_h1b_start_date: "2023-01-01",
    prep_extension_date : "2025-12-01",
    max_h_period: "2029-03-01",
   i94_number: "94320230301",
    i94_expiry_date: "2026-03-01",
    sevis_id: "N/A",
    permanentResidency: {
      currentStatus: "Not Started",
      notes: "No PR application yet"
    },
    number_of_dependents: 2,
    number_of_dependentsDetails: [
      {
        id: "d5-1",
        name: "Omar Ahmed",
        relationship: "Spouse",
        dateOfBirth: "1991-01-25",
        nationality: "Egypt",
        passportNumber: "EG7654322"
      },
      {
        id: "d5-2",
        name: "Layla Ahmed",
        relationship: "Child",
        dateOfBirth: "2019-06-14",
        nationality: "Egypt",
        passportNumber: "EG7654323"
      }
    ],
    highest_education: "B.A.",
    field_of_study: "Business Administration",
    soc_code: "43-6014.00",
    soc_code_description: "Secretaries and Administrative Assistants",
    general_notes: "Awaiting project funding",
    salary_history: [
      {
        effectiveDate: "2023-03-01",
        amount: 63500,
        position: "Program Coordinator",
        changeReason: "Initial hire"
      }
    ]
  },
  {
    id: 6,
    employeeName: "Fatima Al-Rashid",
    firstName: "Fatima",
    lastName: "Al-Rashid",
    department: "Finance",
    visa_type: "F-1",
    status: "Expired",
    expiration_date: "2024-09-20",
    visa_start_date: "2023-08-15",
    email: "fatima.alrashid@umbc.edu",
    phone: "+1-555-0101",
    address: "123 Main St, Baltimore, MD 21250",
    nationality: "Saudi Arabia",
    dateOfBirth: "1998-03-15",
    passportNumber: "SA123456",
   i94_number: "N/A",
    sevis_id: "N1234567890",
    start_date: "2023-08-15",
    visaFiledBy: "Self-Petition",
    number_of_dependents: 0,
    number_of_dependentsDetails: [],
    pendingVisaApplication: {
      targetvisa_type: "OPT",
      applicationDate: "2024-09-01",
      status: "Under Review",
      expectedDecisionDate: "2024-12-15",
      notes: "Applied for OPT following F-1 graduation. Awaiting USCIS review.",
      filed_by: "Self-Petition"
    },
    salary_history: [
      {
        effectiveDate: "2023-08-15",
        amount: 52000,
        position: "Junior Financial Analyst",
        changeReason: "Initial hire"
      },
      {
        effectiveDate: "2024-08-15",
        amount: 58000,
        position: "Financial Analyst",
        changeReason: "Annual performance review and promotion"
      }
    ]
  },
  {
    id: 7,
    employeeName: "Chen Wei",
    firstName: "Chen",
    lastName: "Wei",
    department: "Engineering",
    visa_type: "OPT",
    status: "Expired",
    expiration_date: "2024-10-15",
    visa_start_date: "2023-05-20",
    email: "chen.wei@umbc.edu",
    phone: "+1-555-0102",
    address: "456 Oak Ave, Baltimore, MD 21250",
    nationality: "China",
    dateOfBirth: "1997-07-22",
    passportNumber: "CN987654",
   i94_number: "12345678901",
    sevis_id: "N2345678901",
    start_date: "2023-05-20",
    visaFiledBy: "UMBC Administrator",
    number_of_dependents: 1,
    number_of_dependentsDetails: [
      {
        id: "d7-1",
        name: "Li Wei",
        relationship: "Spouse",
        dateOfBirth: "1997-11-14",
        nationality: "China",
        passportNumber: "CN987655"
      }
    ],
    pendingVisaApplication: {
      targetvisa_type: "H-1B",
      applicationDate: "2024-04-01",
      status: "Awaiting Decision",
      expectedDecisionDate: "2025-03-31",
      notes: "H-1B cap petition filed in FY2025 lottery. Awaiting selection results and approval.",
      filed_by: "Attorney"
    },
    salary_history: [
      {
        effectiveDate: "2023-05-20",
        amount: 68000,
        position: "Software Engineer I",
        changeReason: "Initial hire"
      },
      {
        effectiveDate: "2024-05-20",
        amount: 76000,
        position: "Software Engineer II",
        changeReason: "Annual review and promotion"
      }
    ]
  },
  {
    id: 8,
    employeeName: "Maria Gonzalez",
    firstName: "Maria",
    lastName: "Gonzalez",
    department: "Marketing",
    visa_type: "H-1B",
    status: "Active",
    expiration_date: "2024-11-15",
    visa_start_date: "2022-01-10",
    email: "maria.gonzalez@umbc.edu",
    phone: "+1-555-0103",
    address: "789 Pine Rd, Baltimore, MD 21250",
    nationality: "Mexico",
    dateOfBirth: "1995-11-08",
    passportNumber: "MX456789",
   i94_number: "N/A",
    sevis_id: "N/A",
    start_date: "2022-01-10",
    visaFiledBy: "Attorney",
    number_of_dependents: 2,
    number_of_dependentsDetails: [
      {
        id: "d8-1",
        name: "Carlos Gonzalez",
        relationship: "Spouse",
        dateOfBirth: "1994-05-22",
        nationality: "Mexico",
        passportNumber: "MX456790"
      },
      {
        id: "d8-2",
        name: "Sofia Gonzalez",
        relationship: "Child",
        dateOfBirth: "2020-08-15",
        nationality: "United States",
        passportNumber: "US789012"
      }
    ],
    pendingVisaApplication: {
      targetvisa_type: "Permanent Resident",
      applicationDate: "2023-06-15",
      status: "Under Review",
      expectedDecisionDate: "2025-06-15",
      notes: "EB-2 Green Card application filed. PERM Labor Certification approved. I-140 petition under review.",
      filed_by: "Attorney"
    },
    salary_history: [
      {
        effectiveDate: "2022-01-10",
        amount: 62000,
        position: "Marketing Coordinator",
        changeReason: "Initial hire"
      },
      {
        effectiveDate: "2023-01-10",
        amount: 68000,
        position: "Marketing Specialist",
        changeReason: "Annual review and promotion"
      },
      {
        effectiveDate: "2024-01-10",
        amount: 78000,
        position: "Senior Marketing Specialist",
        changeReason: "Promotion and increased responsibilities"
      }
    ]
  },
  {
    id: 9,
    employeeName: "Raj Patel",
    firstName: "Raj",
    lastName: "Patel",
    department: "Sales",
    visa_type: "OPT STEM",
    status: "Active",
    expiration_date: "2024-11-25",
    visa_start_date: "2023-02-14",
    email: "raj.patel@umbc.edu",
    phone: "+1-555-0104",
    address: "321 Elm St, Baltimore, MD 21250",
    nationality: "India",
    dateOfBirth: "1996-05-30",
    passportNumber: "IN654321",
   i94_number: "23456789012",
    sevis_id: "N3456789012",
    start_date: "2023-02-14",
    visaFiledBy: "Attorney",
    number_of_dependents: 1,
    number_of_dependentsDetails: [
      {
        id: "d9-1",
        name: "Priya Patel",
        relationship: "Spouse",
        dateOfBirth: "1997-03-18",
        nationality: "India",
        passportNumber: "IN654322"
      }
    ],
    pendingVisaApplication: {
      targetvisa_type: "H-1B",
      applicationDate: "2024-04-01",
      status: "Approved",
      expectedDecisionDate: "2024-10-01",
      notes: "H-1B petition approved. Transition from OPT STEM to H-1B status effective October 1, 2024.",
      filed_by: "Attorney"
    },
    salary_history: [
      {
        effectiveDate: "2023-02-14",
        amount: 55000,
        position: "Sales Associate",
        changeReason: "Initial hire"
      },
      {
        effectiveDate: "2024-02-14",
        amount: 65000,
        position: "Sales Representative",
        changeReason: "Performance-based promotion"
      }
    ]
  },
  {
    id: 10,
    employeeName: "Olumide Adebayo",
    firstName: "Olumide",
    lastName: "Adebayo",
    department: "HR",
    visa_type: "F-1",
    status: "Processing",
    expiration_date: "2024-11-30",
    visa_start_date: "2024-01-05",
    email: "olumide.adebayo@umbc.edu",
    phone: "+1-555-0105",
    address: "654 Maple Dr, Baltimore, MD 21250",
    nationality: "Nigeria",
    dateOfBirth: "1999-09-12",
    passportNumber: "NG789012",
   i94_number: "N/A",
    sevis_id: "N4567890123",
    start_date: "2024-01-05",
    visaFiledBy: "Self-Petition",
    number_of_dependents: 0,
    number_of_dependentsDetails: [],
    salary_history: [
      {
        effectiveDate: "2024-01-05",
        amount: 48000,
        position: "HR Coordinator",
        changeReason: "Initial hire"
      }
    ]
  },
  {
    id: 11,
    employeeName: "Sofia Petrov",
    firstName: "Sofia",
    lastName: "Petrov",
    department: "Engineering",
    visa_type: "H-1B",
    status: "Active",
    expiration_date: "2024-12-20",
    visa_start_date: "2021-06-15",
    email: "sofia.petrov@umbc.edu",
    phone: "+1-555-0106",
    address: "987 Birch Ln, Baltimore, MD 21250",
    nationality: "Russia",
    dateOfBirth: "1994-02-18",
    passportNumber: "RU345678",
   i94_number: "N/A",
    sevis_id: "N/A",
    start_date: "2021-06-15",
    visaFiledBy: "Attorney",
    number_of_dependents: 1,
    number_of_dependentsDetails: [
      {
        id: "d11-1",
        name: "Alexei Petrov",
        relationship: "Child",
        dateOfBirth: "2019-03-10",
        nationality: "Russia",
        passportNumber: "RU345679"
      }
    ],
    pendingVisaApplication: {
      targetvisa_type: "Permanent Resident",
      applicationDate: "2022-09-20",
      status: "Awaiting Decision",
      expectedDecisionDate: "2025-09-20",
      notes: "EB-3 Green Card application in progress. I-140 approved, I-485 Adjustment of Status pending.",
      filed_by: "Attorney"
    },
    salary_history: [
      {
        effectiveDate: "2021-06-15",
        amount: 72000,
        position: "Software Engineer II",
        changeReason: "Initial hire"
      },
      {
        effectiveDate: "2022-06-15",
        amount: 82000,
        position: "Senior Software Engineer",
        changeReason: "Annual review and promotion"
      },
      {
        effectiveDate: "2023-06-15",
        amount: 95000,
        position: "Senior Software Engineer",
        changeReason: "Market adjustment and retention"
      },
      {
        effectiveDate: "2024-06-15",
        amount: 105000,
        position: "Lead Software Engineer",
        changeReason: "Promotion to team lead"
      }
    ]
  },
  {
    id: 12,
    employeeName: "Kenji Nakamura",
    firstName: "Kenji",
    lastName: "Nakamura",
    department: "Finance",
    visa_type: "OPT",
    status: "Active",
    expiration_date: "2025-01-15",
    visa_start_date: "2023-07-22",
    email: "kenji.nakamura@umbc.edu",
    phone: "+1-555-0107",
    address: "147 Cedar Ct, Baltimore, MD 21250",
    nationality: "Japan",
    dateOfBirth: "1998-12-05",
    passportNumber: "JP901234",
   i94_number: "34567890123",
    sevis_id: "N5678901234",
    start_date: "2023-07-22",
    visaFiledBy: "UMBC Administrator",
    number_of_dependents: 0,
    number_of_dependentsDetails: [],
    salary_history: [
      {
        effectiveDate: "2023-07-22",
        amount: 54000,
        position: "Financial Analyst",
        changeReason: "Initial hire"
      },
      {
        effectiveDate: "2024-07-22",
        amount: 61000,
        position: "Financial Analyst",
        changeReason: "Annual performance increase"
      }
    ]
  },
  {
    id: 13,
    employeeName: "Aisha Okonkwo",
    firstName: "Aisha",
    lastName: "Okonkwo",
    department: "Marketing",
    visa_type: "F-1",
    status: "Active",
    expiration_date: "2025-03-10",
    visa_start_date: "2024-03-01",
    email: "aisha.okonkwo@umbc.edu",
    phone: "+1-555-0108",
    address: "258 Spruce Way, Baltimore, MD 21250",
    nationality: "Nigeria",
    dateOfBirth: "1999-06-25",
    passportNumber: "NG567890",
   i94_number: "N/A",
    sevis_id: "N6789012345",
    start_date: "2024-03-01",
    visaFiledBy: "Self-Petition",
    number_of_dependents: 0,
    number_of_dependentsDetails: [],
    salary_history: [
      {
        effectiveDate: "2024-03-01",
        amount: 46000,
        position: "Marketing Assistant",
        changeReason: "Initial hire"
      }
    ]
  },
  {
    id: 14,
    employeeName: "Viktor Kozlov",
    firstName: "Viktor",
    lastName: "Kozlov",
    department: "Sales",
    visa_type: "OPT STEM",
    status: "Active",
    expiration_date: "2025-04-05",
    visa_start_date: "2023-04-10",
    email: "viktor.kozlov@umbc.edu",
    phone: "+1-555-0109",
    address: "369 Willow St, Baltimore, MD 21250",
    nationality: "Ukraine",
    dateOfBirth: "1997-10-14",
    passportNumber: "UA234567",
   i94_number: "45678901234",
    sevis_id: "N7890123456",
    start_date: "2023-04-10",
    visaFiledBy: "Attorney",
    number_of_dependents: 1,
    number_of_dependentsDetails: [
      {
        id: "d14-1",
        name: "Olena Kozlov",
        relationship: "Spouse",
        dateOfBirth: "1998-01-25",
        nationality: "Ukraine",
        passportNumber: "UA234568"
      }
    ],
    salary_history: [
      {
        effectiveDate: "2023-04-10",
        amount: 58000,
        position: "Sales Representative",
        changeReason: "Initial hire"
      },
      {
        effectiveDate: "2024-04-10",
        amount: 68000,
        position: "Senior Sales Representative",
        changeReason: "Exceeded sales targets - promotion"
      }
    ]
  },
  {
    id: 15,
    employeeName: "Isabella Rodriguez",
    firstName: "Isabella",
    lastName: "Rodriguez",
    department: "Engineering",
    visa_type: "H-1B",
    status: "Active",
    expiration_date: "2025-08-15",
    visa_start_date: "2020-08-01",
    email: "isabella.rodriguez@umbc.edu",
    phone: "+1-555-0110",
    address: "741 Ash Blvd, Baltimore, MD 21250",
    nationality: "Colombia",
    dateOfBirth: "1993-08-20",
    passportNumber: "CO890123",
   i94_number: "N/A",
    sevis_id: "N/A",
    start_date: "2020-08-01",
    visaFiledBy: "Attorney",
    number_of_dependents: 2,
    number_of_dependentsDetails: [
      {
        id: "d15-1",
        name: "Miguel Rodriguez",
        relationship: "Spouse",
        dateOfBirth: "1992-06-12",
        nationality: "Colombia",
        passportNumber: "CO890124"
      },
      {
        id: "d15-2",
        name: "Elena Rodriguez",
        relationship: "Child",
        dateOfBirth: "2018-11-20",
        nationality: "United States",
        passportNumber: "US234567"
      }
    ],
    salary_history: [
      {
        effectiveDate: "2020-08-01",
        amount: 70000,
        position: "Software Engineer II",
        changeReason: "Initial hire"
      },
      {
        effectiveDate: "2021-08-01",
        amount: 80000,
        position: "Senior Software Engineer",
        changeReason: "Annual review and promotion"
      },
      {
        effectiveDate: "2022-08-01",
        amount: 92000,
        position: "Senior Software Engineer",
        changeReason: "Annual merit increase"
      },
      {
        effectiveDate: "2023-08-01",
        amount: 105000,
        position: "Staff Software Engineer",
        changeReason: "Promotion for technical leadership"
      },
      {
        effectiveDate: "2024-08-01",
        amount: 118000,
        position: "Staff Software Engineer",
        changeReason: "Market adjustment and performance bonus"
      }
    ]
  },
  {
    id: 16,
    employeeName: "Samuel Okafor",
    firstName: "Samuel",
    lastName: "Okafor",
    department: "HR",
    visa_type: "Permanent Resident",
    status: "Active",
    expiration_date: "2026-11-30",
    visa_start_date: "2019-11-15",
    email: "samuel.okafor@umbc.edu",
    phone: "+1-555-0111",
    address: "852 Poplar Ave, Baltimore, MD 21250",
    nationality: "Nigeria",
    dateOfBirth: "1990-04-03",
    passportNumber: "NG123789",
   i94_number: "N/A",
    sevis_id: "N/A",
    start_date: "2019-11-15",
    visaFiledBy: "Attorney",
    number_of_dependents: 3,
    number_of_dependentsDetails: [
      {
        id: "d16-1",
        name: "Grace Okafor",
        relationship: "Spouse",
        dateOfBirth: "1991-08-17",
        nationality: "Nigeria",
        passportNumber: "NG123790"
      },
      {
        id: "d16-2",
        name: "David Okafor",
        relationship: "Child",
        dateOfBirth: "2015-02-14",
        nationality: "United States",
        passportNumber: "US345678"
      },
      {
        id: "d16-3",
        name: "Sarah Okafor",
        relationship: "Child",
        dateOfBirth: "2017-09-22",
        nationality: "United States",
        passportNumber: "US456789"
      }
    ],
    salary_history: [
      {
        effectiveDate: "2019-11-15",
        amount: 55000,
        position: "HR Coordinator",
        changeReason: "Initial hire"
      },
      {
        effectiveDate: "2020-11-15",
        amount: 62000,
        position: "HR Specialist",
        changeReason: "Annual review and promotion"
      },
      {
        effectiveDate: "2021-11-15",
        amount: 70000,
        position: "Senior HR Specialist",
        changeReason: "Promotion and expanded responsibilities"
      },
      {
        effectiveDate: "2022-11-15",
        amount: 78000,
        position: "HR Manager",
        changeReason: "Promotion to management"
      },
      {
        effectiveDate: "2023-11-15",
        amount: 88000,
        position: "Senior HR Manager",
        changeReason: "Expanded team and budget responsibilities"
      }
    ]
  },
  {
    id: 17,
    employeeName: "Amara Obi",
    firstName: "Amara",
    lastName: "Obi",
    department: "Finance",
    visa_type: "Permanent Resident",
    status: "Active",
    expiration_date: "2027-05-22",
    visa_start_date: "2018-03-10",
    email: "amara.obi@umbc.edu",
    phone: "+1-555-0112",
    address: "963 Oakwood Ct, Baltimore, MD 21250",
    nationality: "Kenya",
    dateOfBirth: "1989-01-28",
    passportNumber: "KE567890",
   i94_number: "N/A",
    sevis_id: "N/A",
    start_date: "2018-03-10",
    visaFiledBy: "Attorney",
    number_of_dependents: 2,
    number_of_dependentsDetails: [
      {
        id: "d17-1",
        name: "James Obi",
        relationship: "Spouse",
        dateOfBirth: "1988-04-14",
        nationality: "Kenya",
        passportNumber: "KE567891"
      },
      {
        id: "d17-2",
        name: "Zara Obi",
        relationship: "Child",
        dateOfBirth: "2016-07-08",
        nationality: "United States",
        passportNumber: "US567890"
      }
    ],
    salary_history: [
      {
        effectiveDate: "2018-03-10",
        amount: 65000,
        position: "Financial Analyst",
        changeReason: "Initial hire"
      },
      {
        effectiveDate: "2019-03-10",
        amount: 72000,
        position: "Senior Financial Analyst",
        changeReason: "Annual performance increase"
      },
      {
        effectiveDate: "2022-03-10",
        amount: 85000,
        position: "Finance Manager",
        changeReason: "Promotion to management"
      },
      {
        effectiveDate: "2023-03-10",
        amount: 95000,
        position: "Finance Manager",
        changeReason: "Annual merit increase"
      },
      {
        effectiveDate: "2024-03-10",
        amount: 108000,
        position: "Senior Finance Manager",
        changeReason: "Expanded team responsibilities"
      }
    ]
  },
  {
    id: 18,
    employeeName: "Diego Morales",
    firstName: "Diego",
    lastName: "Morales",
    department: "Marketing",
    visa_type: "H-1B",
    status: "Active",
    expiration_date: "2025-07-08",
    visa_start_date: "2022-07-01",
    email: "diego.morales@umbc.edu",
    phone: "+1-555-0113",
    address: "159 Walnut Dr, Baltimore, MD 21250",
    nationality: "Argentina",
    dateOfBirth: "1994-07-16",
    passportNumber: "AR678901",
   i94_number: "N/A",
    sevis_id: "N/A",
    start_date: "2022-07-01",
    visaFiledBy: "Attorney",
    number_of_dependents: 1,
    number_of_dependentsDetails: [
      {
        id: "d18-1",
        name: "Lucia Morales",
        relationship: "Spouse",
        dateOfBirth: "1995-02-09",
        nationality: "Argentina",
        passportNumber: "AR678902"
      }
    ],
    salary_history: [
      {
        effectiveDate: "2022-07-01",
        amount: 60000,
        position: "Marketing Coordinator",
        changeReason: "Initial hire"
      },
      {
        effectiveDate: "2023-07-01",
        amount: 68000,
        position: "Marketing Specialist",
        changeReason: "Annual review and promotion"
      },
      {
        effectiveDate: "2024-07-01",
        amount: 78000,
        position: "Marketing Manager",
        changeReason: "Promoted to team lead"
      }
    ]
  },
  {
    id: 19,
    employeeName: "Priya Sharma",
    firstName: "Priya",
    lastName: "Sharma",
    department: "Sales",
    visa_type: "F-1",
    status: "Active",
    expiration_date: "2025-06-12",
    visa_start_date: "2024-06-01",
    email: "priya.sharma@umbc.edu",
    phone: "+1-555-0114",
    address: "357 Chestnut Ln, Baltimore, MD 21250",
    nationality: "India",
    dateOfBirth: "1998-11-09",
    passportNumber: "IN345678",
   i94_number: "N/A",
    sevis_id: "N8901234567",
    start_date: "2024-06-01",
    visaFiledBy: "Self-Petition",
    number_of_dependents: 0,
    number_of_dependentsDetails: [],
    salary_history: [
      {
        effectiveDate: "2024-06-01",
        amount: 47000,
        position: "Sales Coordinator",
        changeReason: "Initial hire"
      }
    ]
  }
];