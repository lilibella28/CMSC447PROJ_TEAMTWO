/**
 * Missing Dates Context
 * Tracks employees with missing/invalid visa dates across the application
 * Allows warning banners to be displayed on any page showing employee data
 */

import { createContext, useContext, useState, ReactNode } from 'react';

export interface EmployeeWithMissingDates {
  employeeId: string;
  employeeName: string;
  email: string;
  missingFields: string[]; // e.g., ["Start Date", "Expiration Date"]
  importedAt?: Date;
}

interface MissingDatesContextType {
  employeesWithMissingDates: EmployeeWithMissingDates[];
  addEmployeeWithMissingDates: (employee: EmployeeWithMissingDates) => void;
  addMultipleEmployeesWithMissingDates: (employees: EmployeeWithMissingDates[]) => void;
  removeEmployeeFromWarnings: (employeeId: string) => void;
  clearAllWarnings: () => void;
  hasWarnings: boolean;
  getWarningsCount: () => number;
}

const MissingDatesContext = createContext<MissingDatesContextType | undefined>(undefined);

export function MissingDatesProvider({ children }: { children: ReactNode }) {
  const [employeesWithMissingDates, setEmployeesWithMissingDates] = useState<EmployeeWithMissingDates[]>([]);

  const addEmployeeWithMissingDates = (employee: EmployeeWithMissingDates) => {
    setEmployeesWithMissingDates(prev => {
      // Check if employee already exists
      const exists = prev.find(emp => emp.employeeId === employee.employeeId);
      if (exists) {
        // Update existing entry
        return prev.map(emp => 
          emp.employeeId === employee.employeeId ? employee : emp
        );
      }
      // Add new entry
      return [...prev, employee];
    });
  };

  const addMultipleEmployeesWithMissingDates = (employees: EmployeeWithMissingDates[]) => {
    setEmployeesWithMissingDates(prev => {
      const newEmployees = [...prev];
      employees.forEach(employee => {
        const existingIndex = newEmployees.findIndex(emp => emp.employeeId === employee.employeeId);
        if (existingIndex >= 0) {
          // Update existing
          newEmployees[existingIndex] = employee;
        } else {
          // Add new
          newEmployees.push(employee);
        }
      });
      return newEmployees;
    });
  };

  const removeEmployeeFromWarnings = (employeeId: string) => {
    setEmployeesWithMissingDates(prev => 
      prev.filter(emp => emp.employeeId !== employeeId)
    );
  };

  const clearAllWarnings = () => {
    setEmployeesWithMissingDates([]);
  };

  const hasWarnings = employeesWithMissingDates.length > 0;

  const getWarningsCount = () => employeesWithMissingDates.length;

  return (
    <MissingDatesContext.Provider
      value={{
        employeesWithMissingDates,
        addEmployeeWithMissingDates,
        addMultipleEmployeesWithMissingDates,
        removeEmployeeFromWarnings,
        clearAllWarnings,
        hasWarnings,
        getWarningsCount,
      }}
    >
      {children}
    </MissingDatesContext.Provider>
  );
}

export function useMissingDates() {
  const context = useContext(MissingDatesContext);
  if (context === undefined) {
    throw new Error('useMissingDates must be used within a MissingDatesProvider');
  }
  return context;
}