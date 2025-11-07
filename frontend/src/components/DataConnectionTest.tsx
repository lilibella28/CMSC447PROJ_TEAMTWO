import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { CheckCircle2, XCircle, AlertCircle, Database } from "lucide-react";
import { fetchEmployees, fetchVisaCases, fetchStatistics } from "../../utils/dataService";

/**
 * Data Connection Test Component
 * This component verifies that employees.json is properly connected and loading
 * Use this component to diagnose any data loading issues
 */
export function DataConnectionTest() {
  const [testResults, setTestResults] = useState({
    jsonImport: { status: "pending", message: "", data: null as any },
    employeesFetch: { status: "pending", message: "", count: 0 },
    visaCasesFetch: { status: "pending", message: "", count: 0 },
    statisticsFetch: { status: "pending", message: "", data: null as any },
  });

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    // Test 1: Direct JSON import check
    try {
      const employeesData = await import("../public/data/employees.json");
      const isArray = Array.isArray(employeesData.default);
      setTestResults(prev => ({
        ...prev,
        jsonImport: {
          status: isArray ? "success" : "warning",
          message: isArray 
            ? `JSON file loaded successfully with ${employeesData.default.length} employees`
            : "JSON file loaded but not an array",
          data: employeesData.default,
        },
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        jsonImport: {
          status: "error",
          message: `Failed to load JSON: ${error}`,
          data: null,
        },
      }));
    }

    // Test 2: fetchEmployees() function
    try {
      const employees = await fetchEmployees();
      const isArray = Array.isArray(employees);
      setTestResults(prev => ({
        ...prev,
        employeesFetch: {
          status: isArray && employees.length > 0 ? "success" : "warning",
          message: isArray 
            ? `fetchEmployees() returned ${employees.length} employees`
            : "fetchEmployees() did not return an array",
          count: employees.length,
        },
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        employeesFetch: {
          status: "error",
          message: `fetchEmployees() failed: ${error}`,
          count: 0,
        },
      }));
    }

    // Test 3: fetchVisaCases() function
    try {
      const visaCases = await fetchVisaCases();
      const isArray = Array.isArray(visaCases);
      setTestResults(prev => ({
        ...prev,
        visaCasesFetch: {
          status: isArray && visaCases.length > 0 ? "success" : "warning",
          message: isArray 
            ? `fetchVisaCases() returned ${visaCases.length} visa cases`
            : "fetchVisaCases() did not return an array",
          count: visaCases.length,
        },
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        visaCasesFetch: {
          status: "error",
          message: `fetchVisaCases() failed: ${error}`,
          count: 0,
        },
      }));
    }

    // Test 4: fetchStatistics() function
    try {
      const statistics = await fetchStatistics();
      setTestResults(prev => ({
        ...prev,
        statisticsFetch: {
          status: statistics ? "success" : "warning",
          message: statistics 
            ? `Statistics calculated: ${statistics.totalVisas} total visas`
            : "Statistics returned null",
          data: statistics,
        },
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        statisticsFetch: {
          status: "error",
          message: `fetchStatistics() failed: ${error}`,
          data: null,
        },
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-[#10B981]" />;
      case "error":
        return <XCircle className="h-5 w-5 text-[#EF4444]" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-[#F59E0B]" />;
      default:
        return <Database className="h-5 w-5 text-[#6B7280] animate-pulse" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "border-[#10B981] bg-[#ECFDF5]";
      case "error":
        return "border-[#EF4444] bg-[#FEF2F2]";
      case "warning":
        return "border-[#F59E0B] bg-[#FFF7E6]";
      default:
        return "border-[#E5E5E5] bg-white";
    }
  };

  const allTestsPassed = Object.values(testResults).every(
    test => test.status === "success"
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Database className="h-7 w-7 text-[#5B8DEF]" />
            <h1 className="text-[#1E1E1E]">Data Connection Test</h1>
          </div>
          <p className="text-[#4A4A4A]">
            Verifying that employees.json is properly connected and loading
          </p>
          <div className="h-[1px] bg-[#E5E5E5] mt-4" />
        </div>

        {/* Overall Status */}
        {allTestsPassed ? (
          <Alert className="mb-6 border-[#10B981] bg-[#ECFDF5]">
            <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
            <AlertDescription className="text-[#065F46]">
              <strong>All tests passed!</strong> The employees.json file is properly connected and all {testResults.employeesFetch.count} employees are loading correctly.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="mb-6 border-[#F59E0B] bg-[#FFF7E6]">
            <AlertCircle className="h-4 w-4 text-[#F59E0B]" />
            <AlertDescription className="text-[#92400E]">
              Some tests did not pass. Please review the details below.
            </AlertDescription>
          </Alert>
        )}

        {/* Test Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Test 1: JSON Import */}
          <Card className={`p-6 border-2 ${getStatusColor(testResults.jsonImport.status)}`}>
            <div className="flex items-start gap-3 mb-3">
              {getStatusIcon(testResults.jsonImport.status)}
              <div className="flex-1">
                <h3 className="text-[#1E1E1E] mb-1">JSON File Import</h3>
                <p className="text-sm text-[#4A4A4A]">{testResults.jsonImport.message}</p>
              </div>
            </div>
            {testResults.jsonImport.status === "success" && (
              <div className="mt-4 pt-4 border-t border-[#E5E5E5]">
                <Badge className="bg-[#5B8DEF] text-white">
                  {testResults.jsonImport.data?.length || 0} employees loaded
                </Badge>
              </div>
            )}
          </Card>

          {/* Test 2: fetchEmployees() */}
          <Card className={`p-6 border-2 ${getStatusColor(testResults.employeesFetch.status)}`}>
            <div className="flex items-start gap-3 mb-3">
              {getStatusIcon(testResults.employeesFetch.status)}
              <div className="flex-1">
                <h3 className="text-[#1E1E1E] mb-1">fetchEmployees() Function</h3>
                <p className="text-sm text-[#4A4A4A]">{testResults.employeesFetch.message}</p>
              </div>
            </div>
            {testResults.employeesFetch.status === "success" && (
              <div className="mt-4 pt-4 border-t border-[#E5E5E5]">
                <Badge className="bg-[#5B8DEF] text-white">
                  {testResults.employeesFetch.count} employees
                </Badge>
              </div>
            )}
          </Card>

          {/* Test 3: fetchVisaCases() */}
          <Card className={`p-6 border-2 ${getStatusColor(testResults.visaCasesFetch.status)}`}>
            <div className="flex items-start gap-3 mb-3">
              {getStatusIcon(testResults.visaCasesFetch.status)}
              <div className="flex-1">
                <h3 className="text-[#1E1E1E] mb-1">fetchVisaCases() Function</h3>
                <p className="text-sm text-[#4A4A4A]">{testResults.visaCasesFetch.message}</p>
              </div>
            </div>
            {testResults.visaCasesFetch.status === "success" && (
              <div className="mt-4 pt-4 border-t border-[#E5E5E5]">
                <Badge className="bg-[#5B8DEF] text-white">
                  {testResults.visaCasesFetch.count} visa cases
                </Badge>
              </div>
            )}
          </Card>

          {/* Test 4: fetchStatistics() */}
          <Card className={`p-6 border-2 ${getStatusColor(testResults.statisticsFetch.status)}`}>
            <div className="flex items-start gap-3 mb-3">
              {getStatusIcon(testResults.statisticsFetch.status)}
              <div className="flex-1">
                <h3 className="text-[#1E1E1E] mb-1">fetchStatistics() Function</h3>
                <p className="text-sm text-[#4A4A4A]">{testResults.statisticsFetch.message}</p>
              </div>
            </div>
            {testResults.statisticsFetch.status === "success" && testResults.statisticsFetch.data && (
              <div className="mt-4 pt-4 border-t border-[#E5E5E5]">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Active</p>
                    <Badge className="bg-[#5BB974] text-white">
                      {testResults.statisticsFetch.data.activeVisas}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Expiring</p>
                    <Badge className="bg-[#EFB74A] text-white">
                      {testResults.statisticsFetch.data.expiringWithin60Days}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Expired</p>
                    <Badge className="bg-[#D86464] text-white">
                      {testResults.statisticsFetch.data.expired}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7280] mb-1">Pending</p>
                    <Badge className="bg-[#9E9E9E] text-white">
                      {testResults.statisticsFetch.data.pending}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Detailed Information */}
        {allTestsPassed && testResults.jsonImport.data && (
          <Card className="p-6 border-[#E5E5E5]">
            <h3 className="text-[#1E1E1E] mb-4">Employee Data Sample</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E5E5E5]">
                    <th className="text-left py-2 px-3 text-[#6B7280]">ID</th>
                    <th className="text-left py-2 px-3 text-[#6B7280]">Name</th>
                    <th className="text-left py-2 px-3 text-[#6B7280]">Department</th>
                    <th className="text-left py-2 px-3 text-[#6B7280]">Visa Type</th>
                    <th className="text-left py-2 px-3 text-[#6B7280]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.jsonImport.data.slice(0, 5).map((emp: any) => (
                    <tr key={emp.id} className="border-b border-[#F1F3F5]">
                      <td className="py-2 px-3 text-[#4A4A4A]">{emp.id}</td>
                      <td className="py-2 px-3 text-[#1E1E1E]">{emp.employeeName}</td>
                      <td className="py-2 px-3 text-[#4A4A4A]">{emp.department}</td>
                      <td className="py-2 px-3 text-[#4A4A4A]">{emp.visaType}</td>
                      <td className="py-2 px-3">
                        <Badge className="bg-[#5BB974] text-white text-xs">
                          {emp.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-[#6B7280] mt-3">
                Showing first 5 of {testResults.jsonImport.data.length} employees
              </p>
            </div>
          </Card>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-[#E5E5E5]">
          <p className="text-xs text-[#6B7280] text-center">
            Data Connection Test — UMBC Visa Management System
          </p>
        </div>
      </div>
    </div>
  );
}