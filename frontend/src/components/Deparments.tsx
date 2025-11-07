import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Search, ChevronDown, ChevronRight, Building2, GraduationCap } from "lucide-react";
import { collegesData, searchDepartments, getTotalDepartmentCount, College, Department } from "../../utils/departmentData";
import { fetchEmployees, Employee } from "../../utils/dataService";

export function Departments() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedColleges, setExpandedColleges] = useState<Set<string>>(new Set());
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [employeesData, setEmployeesData] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load employee data
  useEffect(() => {
    async function loadEmployees() {
      try {
        const data = await fetchEmployees();
        setEmployeesData(data);
      } catch (error) {
        console.error("Error loading employees:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadEmployees();
  }, []);

  // Calculate employee counts per department
  const departmentEmployeeCounts = Array.isArray(employeesData) 
    ? employeesData.reduce((acc, emp) => {
        acc[emp.department] = (acc[emp.department] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    : {};

  // Filter colleges and departments based on search
  const filteredData = searchQuery
    ? searchDepartments(searchQuery)
    : null;

  const toggleCollege = (collegeId: string) => {
    const newExpanded = new Set(expandedColleges);
    if (newExpanded.has(collegeId)) {
      newExpanded.delete(collegeId);
    } else {
      newExpanded.add(collegeId);
    }
    setExpandedColleges(newExpanded);
  };

  const handleDepartmentClick = (departmentId: string) => {
    setSelectedDepartment(selectedDepartment === departmentId ? null : departmentId);
  };

  // Expand all colleges if searching
  const displayColleges = searchQuery
    ? collegesData.filter(college =>
        filteredData?.some(item => item.college.id === college.id)
      )
    : collegesData;

  const totalDepartments = getTotalDepartmentCount();
  const displayedDepartments = searchQuery && filteredData
    ? filteredData.length
    : totalDepartments;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-7 w-7 text-[#5B8DEF]" />
            <h1 className="text-[#1E1E1E]">
              Departments & Colleges Overview
            </h1>
          </div>
          <p className="text-[#4A4A4A]">
            All UMBC colleges and their academic departments
          </p>
          <div className="mt-6 h-[1px] bg-[#E5E5E5]" />
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-[800px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
            <Input
              type="text"
              placeholder="Search department or college…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-white border-[#E1E1E1] focus-visible:ring-[#5B8DEF]"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-[#6B7280] mt-2">
              {displayedDepartments === 0
                ? "No departments found"
                : `Found ${displayedDepartments} department${displayedDepartments !== 1 ? "s" : ""}`}
            </p>
          )}
        </div>

        {/* Department Groups */}
        <div className="space-y-4 mb-8">
          {displayColleges.map((college) => {
            const isExpanded = searchQuery ? true : expandedColleges.has(college.id);
            const departmentsToShow = searchQuery && filteredData
              ? filteredData
                  .filter(item => item.college.id === college.id)
                  .map(item => item.department)
              : college.departments;

            if (searchQuery && departmentsToShow.length === 0) {
              return null;
            }

            return (
              <Card key={college.id} className="overflow-hidden border-[#E5E5E5]">
                {/* College Header */}
                <button
                  onClick={() => toggleCollege(college.id)}
                  className="w-full bg-[#F1F3F5] px-6 py-4 flex items-center justify-between hover:bg-[#E9ECEF] transition-colors"
                  aria-expanded={isExpanded}
                  aria-label={`Department list for ${college.name}`}
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-5 w-5 text-[#5B8DEF]" />
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <h2 className="text-[#1E1E1E]">
                          {college.abbreviation}
                        </h2>
                        <Badge variant="outline" className="text-xs">
                          {departmentsToShow.length} dept{departmentsToShow.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#6B7280] mt-1">
                        {college.name}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-[#6B7280] transition-transform" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-[#6B7280] transition-transform" />
                  )}
                </button>

                {/* Department List */}
                {isExpanded && (
                  <div className="bg-white divide-y divide-[#E5E5E5]">
                    {departmentsToShow.map((dept) => {
                      const employeeCount = departmentEmployeeCounts[dept.name] || 0;
                      const isSelected = selectedDepartment === dept.id;

                      return (
                        <button
                          key={dept.id}
                          onClick={() => handleDepartmentClick(dept.id)}
                          className={`
                            w-full px-6 py-3 flex items-center justify-between
                            transition-colors text-left
                            hover:bg-[#E9F2FF]
                            ${isSelected 
                              ? "bg-[#E3F2FD] border-l-4 border-l-[#5B8DEF]" 
                              : "border-l-4 border-l-transparent"
                            }
                          `}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-[#222222]">
                                  {dept.name}
                                </span>
                                {dept.code && (
                                  <span className="text-xs text-[#6B7280] font-mono">
                                    {dept.code}
                                  </span>
                                )}
                              </div>
                              {employeeCount > 0 && (
                                <p className="text-xs text-[#6B7280] mt-1">
                                  {employeeCount} employee{employeeCount !== 1 ? "s" : ""}
                                </p>
                              )}
                            </div>
                          </div>
                          {employeeCount > 0 && (
                            <Badge 
                              variant="secondary" 
                              className="bg-[#F1F3F5] text-[#4A4A4A] text-xs"
                            >
                              {employeeCount}
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* No Results */}
        {searchQuery && displayedDepartments === 0 && (
          <Card className="p-12 text-center border-[#E5E5E5]">
            <Building2 className="h-12 w-12 text-[#D1D5DB] mx-auto mb-4" />
            <h3 className="text-[#1E1E1E] mb-2">No departments found</h3>
            <p className="text-sm text-[#6B7280]">
              Try searching with different keywords or browse all departments
            </p>
          </Card>
        )}

        {/* Summary Footer */}
        <Card className="bg-[#F7F8FA] border-t-[#E5E5E5] border-[#E5E5E5] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#4A4A4A]">
              Total Departments: <span className="font-medium text-[#1E1E1E]">{totalDepartments}</span>
            </p>
            <p className="text-sm text-[#4A4A4A]">
              Total Colleges: <span className="font-medium text-[#1E1E1E]">{collegesData.length}</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
