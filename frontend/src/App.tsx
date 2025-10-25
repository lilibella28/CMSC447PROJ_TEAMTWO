import { useState } from "react";
import { AppShell } from "./components/AppShell";
import { Dashboard } from "./components/Dashboard";
import { Login } from "./components/Login";
import { AddEmployee } from "./components/AddEmployee";
import { Employees } from "./components/Employees";
import { EmployeeProfile } from "./components/EmployeeProfile";
import { Reports } from "./components/Reports";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { VisaCase } from "./components/DataTable";

type Page = "dashboard" | "add-employee" | "employees" | "employee-profile" | "reports" | "departments" | "settings";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [selectedEmployee, setSelectedEmployee] = useState<VisaCase | null>(null);

  const handleLogin = (success: boolean) => {
    if (success) {
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage("dashboard");
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  const handleNavigateToAddEmployee = () => {
    setCurrentPage("add-employee");
  };

  const handleNavigateToDashboard = () => {
    setCurrentPage("dashboard");
  };

  const handleViewEmployee = (employee: VisaCase) => {
    setSelectedEmployee(employee);
    setCurrentPage("employee-profile");
  };

  const handleBackFromProfile = () => {
    setSelectedEmployee(null);
    setCurrentPage("employees");
  };

  const handleSaveEmployee = (employeeData: any) => {
    console.log("Employee data saved:", employeeData);
    // Here you would typically save to a backend/database
    // For now, we'll just navigate back to dashboard
    setCurrentPage("dashboard");
    
    // Show success toast notification
    toast.success("Employee added successfully!", {
      description: `${employeeData.firstName} ${employeeData.lastName} has been added to the system.`,
      duration: 4000,
    });
  };

  if (!isAuthenticated) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster />
      </>
    );
  }

  // Render content based on current page
  const renderPage = () => {
    switch (currentPage) {
      case "add-employee":
        return (
          <AddEmployee 
            onCancel={handleNavigateToDashboard}
            onSave={handleSaveEmployee}
          />
        );
      case "employees":
        return <Employees onViewEmployee={handleViewEmployee} />;
      case "employee-profile":
        if (!selectedEmployee) return <Employees onViewEmployee={handleViewEmployee} />;
        return (
          <EmployeeProfile 
            employee={selectedEmployee}
            onBack={handleBackFromProfile}
          />
        );
      case "reports":
        return <Reports />;
      case "dashboard":
      default:
        return (
          <Dashboard 
            onNavigateToAddEmployee={handleNavigateToAddEmployee}
            onViewEmployee={handleViewEmployee}
          />
        );
    }
  };

  return (
    <>
      <AppShell 
        onLogout={handleLogout}
        currentPage={currentPage}
        onNavigate={handleNavigate}
      >
        {renderPage()}
      </AppShell>
      <Toaster />
    </>
  );
}