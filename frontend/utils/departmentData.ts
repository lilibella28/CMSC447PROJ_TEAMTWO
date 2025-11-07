// UMBC Colleges and Departments Data
// Based on actual UMBC organizational structure

export interface Department {
    id: string;
    name: string;
    code?: string;
    employeeCount?: number;
  }
  
  export interface College {
    id: string;
    name: string;
    abbreviation: string;
    departments: Department[];
  }
  
  export const collegesData: College[] = [
    {
      id: "cahss",
      name: "College of Arts, Humanities, and Social Sciences",
      abbreviation: "CAHSS",
      departments: [
        { id: "cahss-africana", name: "Africana Studies", code: "AFST" },
        { id: "cahss-american", name: "American Studies", code: "AMST" },
        { id: "cahss-ancient", name: "Ancient Studies", code: "ANCS" },
        { id: "cahss-asian", name: "Asian Studies", code: "ASIA" },
        { id: "cahss-dance", name: "Dance", code: "DANC" },
        { id: "cahss-economics", name: "Economics", code: "ECON" },
        { id: "cahss-education", name: "Education", code: "EDUC" },
        { id: "cahss-english", name: "English", code: "ENGL" },
        { id: "cahss-gender", name: "Gender, Women's + Sexuality Studies", code: "GWST" },
        { id: "cahss-geography", name: "Geography and Environmental Systems", code: "GES" },
        { id: "cahss-global", name: "Global Studies", code: "GLBL" },
        { id: "cahss-history", name: "History", code: "HIST" },
        { id: "cahss-interdisciplinary", name: "Interdisciplinary Studies", code: "INDS" },
        { id: "cahss-language", name: "Language, Literacy, and Culture", code: "LLC" },
        { id: "cahss-media", name: "Media and Communication Studies", code: "MCS" },
        { id: "cahss-modern", name: "Modern Languages, Linguistics and Intercultural Communication", code: "MLLI" },
        { id: "cahss-music", name: "Music", code: "MUS" },
        { id: "cahss-philosophy", name: "Philosophy", code: "PHIL" },
        { id: "cahss-political", name: "Political Science", code: "POLI" },
        { id: "cahss-psychology", name: "Psychology", code: "PSYC" },
        { id: "cahss-social", name: "Social Work", code: "SOWK" },
        { id: "cahss-sociology", name: "Sociology and Anthropology", code: "SOCY" },
        { id: "cahss-theatre", name: "Theatre", code: "THTR" },
        { id: "cahss-visual", name: "Visual Arts", code: "VAHS" },
      ],
    },
    {
      id: "coeit",
      name: "College of Engineering and Information Technology",
      abbreviation: "COEIT",
      departments: [
        { id: "coeit-chemical", name: "Chemical, Biochemical and Environmental Engineering", code: "ENCH" },
        { id: "coeit-computer", name: "Computer Science and Electrical Engineering", code: "CSEE" },
        { id: "coeit-information", name: "Information Systems", code: "IS" },
        { id: "coeit-mechanical", name: "Mechanical Engineering", code: "ENME" },
      ],
    },
    {
      id: "cnms",
      name: "College of Natural and Mathematical Sciences",
      abbreviation: "CNMS",
      departments: [
        { id: "cnms-biological", name: "Biological Sciences", code: "BIOL" },
        { id: "cnms-chemistry", name: "Chemistry and Biochemistry", code: "CHEM" },
        { id: "cnms-mathematics", name: "Mathematics and Statistics", code: "MATH" },
        { id: "cnms-physics", name: "Physics", code: "PHYS" },
      ],
    },
    {
      id: "cph",
      name: "College of Public Health",
      abbreviation: "CPH",
      departments: [
        { id: "cph-emergency", name: "Emergency Health Services", code: "EHS" },
        { id: "cph-health", name: "Health Administration and Policy", code: "HAP" },
      ],
    },
    {
      id: "administration",
      name: "Administration and Student Affairs",
      abbreviation: "ADMIN",
      departments: [
        { id: "admin-hr", name: "Human Resources", code: "HR" },
        { id: "admin-finance", name: "Finance", code: "FIN" },
        { id: "admin-enrollment", name: "Enrollment Management", code: "EM" },
        { id: "admin-student", name: "Student Affairs", code: "SA" },
        { id: "admin-facilities", name: "Facilities Management", code: "FM" },
        { id: "admin-it", name: "Information Technology", code: "IT" },
        { id: "admin-library", name: "Library", code: "LIB" },
        { id: "admin-marketing", name: "Marketing and Communications", code: "MARCOM" },
        { id: "admin-research", name: "Research Administration", code: "RA" },
      ],
    },
  ];
  
  /**
   * Get all departments across all colleges
   */
  export function getAllDepartments(): Department[] {
    return collegesData.flatMap(college => college.departments);
  }
  
  /**
   * Get department by ID
   */
  export function getDepartmentById(id: string): Department | undefined {
    for (const college of collegesData) {
      const dept = college.departments.find(d => d.id === id);
      if (dept) return dept;
    }
    return undefined;
  }
  
  /**
   * Get college by department ID
   */
  export function getCollegeByDepartmentId(departmentId: string): College | undefined {
    return collegesData.find(college => 
      college.departments.some(dept => dept.id === departmentId)
    );
  }
  
  /**
   * Search departments by query
   */
  export function searchDepartments(query: string): { college: College; department: Department }[] {
    const results: { college: College; department: Department }[] = [];
    const lowerQuery = query.toLowerCase();
    
    for (const college of collegesData) {
      for (const department of college.departments) {
        if (
          department.name.toLowerCase().includes(lowerQuery) ||
          department.code?.toLowerCase().includes(lowerQuery) ||
          college.name.toLowerCase().includes(lowerQuery) ||
          college.abbreviation.toLowerCase().includes(lowerQuery)
        ) {
          results.push({ college, department });
        }
      }
    }
    
    return results;
  }
  
  /**
   * Get total department count
   */
  export function getTotalDepartmentCount(): number {
    return collegesData.reduce((sum, college) => sum + college.departments.length, 0);
  }
  
  /**
   * Get employee count by department (mock data for now)
   * TODO: Replace with actual employee counts from employee data
   */
  export function getDepartmentEmployeeCount(departmentName: string): number {
    // Mock data - this should be calculated from actual employee data
    const mockCounts: Record<string, number> = {
      "Philosophy": 12,
      "Engineering": 22,
      "Physics": 14,
      "Computer Science and Electrical Engineering": 18,
      "Administration": 9,
      "Finance": 8,
      "Marketing": 5,
      "Sales": 7,
      "HR": 4,
    };
    
    return mockCounts[departmentName] || 0;
  }