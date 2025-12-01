import { useState } from "react";
import { AppShell } from "./components/AppShell";
import { Dashboard } from "./components/Dashboard";
import { Login } from "./components/Login";
import { AddEmployee } from "./components/AddEmployee";
import { EditEmployee } from "./components/EditEmployee";
import { Employees } from "./components/Employees";
import { EmployeeProfile } from "./components/EmployeeProfile";
import { Departments } from "./components/Deparments";
import { ImportEmployees } from "./components/importEmployees";
import { Reports } from "./components/Reports";
import { Settings } from "./components/Settings";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { VisaCase } from "../utils/dataService";

type Page = "dashboard" | "add-employee" | "edit-employee" | "employees" | "employee-profile" | "reports" | "departments" | "import" | "settings";

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

  const handleNavigateToImport = () => {
    setCurrentPage("import");
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

  const handleEditEmployee = (employee: VisaCase) => {
    setSelectedEmployee(employee);
    setCurrentPage("edit-employee");
  };

  const handleSaveEmployee = (employeeData: any) => {
    console.log("Employee data saved:", employeeData);
    // Here you would typically save to a backend/database
    // For now, we'll just navigate back to dashboard
    setCurrentPage("dashboard");
    
    // Show success toast notification
    toast.success("Employee added successfully!", {
      description: `${employeeData.first_name} ${employeeData.last_name} has been added to the system.`,
      duration: 4000,
    });
  };

  const handleUpdateEmployee = () => {
    // Navigate back to profile after successful update
    setCurrentPage("employee-profile");
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
      case "edit-employee":
        if (!selectedEmployee) return <Employees onViewEmployee={handleViewEmployee} />;
        return (
          <EditEmployee 
            employee={selectedEmployee}
            onCancel={() => setCurrentPage("employee-profile")}
            onSave={handleUpdateEmployee}
          />
        );
      case "employees":
        return (
          <Employees 
            onViewEmployee={handleViewEmployee}
            onNavigateToAddEmployee={handleNavigateToAddEmployee}
            onNavigateToImport={handleNavigateToImport}
            onEditEmployee={handleEditEmployee}
          />
        );
      case "employee-profile":
        if (!selectedEmployee) return <Employees onViewEmployee={handleViewEmployee} />;
        return (
          <EmployeeProfile 
            employee={selectedEmployee}
            onBack={handleBackFromProfile}
            onEdit={() => handleEditEmployee(selectedEmployee)}
          />
        );
      case "departments":
        return <Departments />;
      case "import":
        return <ImportEmployees />;
      case "reports":
        return <Reports />;
      case "settings":
        return <Settings />;
      case "dashboard":
      default:
        return (
          <Dashboard 
            onNavigateToAddEmployee={handleNavigateToAddEmployee}
            onNavigateToImport={handleNavigateToImport}
            onViewEmployee={handleViewEmployee}
            onEditEmployee={handleEditEmployee}
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