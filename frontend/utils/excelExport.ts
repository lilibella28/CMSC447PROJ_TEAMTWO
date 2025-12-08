/**
 * Excel Export Utility
 * Generates Excel files for employee visa data
 */

import * as XLSX from 'xlsx';
import { Employee } from '../utils/dataService';

/**
 * Export employees data to Excel format
 * Uses the xlsx library to generate Excel files
 */
export async function exportEmployeesToExcel(employees: Employee[], filename: string = 'visa_employees.xlsx'): Promise<void> {
  try {
    // Transform employee data to match Excel column structure
    const excelData = employees.map((emp) => ({
      // Personal Information
      'Employee ID': emp.id,
      'First Name': emp.first_name || '',
      'Last Name': emp.last_name || '',
      'Employee Name': emp.employeeName || `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
      'UMBC Email': emp.umbcEmail || emp.email || '',
      'Personal Email': emp.personalEmail || '',
      'Gender': emp.gender || '',
      'Country of Birth': emp.countryOfBirth || '',
      'Citizenship(s)': Array.isArray(emp.citizenships) 
        ? emp.citizenships.join(', ') 
        : emp.citizenships || '',
      
      // Employment Information
      'Department': emp.department || '',
      'Employee Title': emp.employeeTitle || '',
      'Department Admin': emp.departmentAdmin || '',
      'Department Advisor': emp.departmentAdvisor || '',
      'Annual Salary': emp.annualSalary || '',
      
      // Visa Information
      'Visa Type': emp.visaType || '',
      'Visa Status': emp.visaStatus || '',
      'Expiration Date': emp.expirationDate || '',
      'Visa Start Date': emp.visaStartDate || '',
      'Initial H-1B Start Date': emp.initialH1BStartDate || '',
      'Prep Extension Date': emp.prepExtensionDate || '',
      'Max H Period': emp.maxHPeriod || '',
      'I-94 Expiry Date': emp.i94ExpiryDate || '',
      'PR Filing Date': emp.prFilingDate || '',
      'Number of Dependents': emp.numberOfDependents || 0,
      
      // Attorney Information
      'Attorney Name': emp.attorneyName || '',
      'Attorney Email': emp.attorneyEmail || '',
      'Attorney Phone': emp.attorneyPhone || '',
      'Attorney Firm': emp.attorneyFirm || '',
      
      // Education
      'Highest Education': emp.highestEducation || '',
      'Field of Study': emp.fieldOfStudy || '',
      
      // Administrative
      'SOC Code': emp.socCode || '',
      'SOC Code Description': emp.socCodeDescription || '',
      'General Notes': emp.generalNotes || '',
    }));

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Visa Employees');

    // Set column widths for better readability
    const columnWidths = [
      { wch: 12 }, // Employee ID
      { wch: 15 }, // First Name
      { wch: 15 }, // Last Name
      { wch: 25 }, // Employee Name
      { wch: 25 }, // UMBC Email
      { wch: 25 }, // Personal Email
      { wch: 10 }, // Gender
      { wch: 18 }, // Country of Birth
      { wch: 20 }, // Citizenship(s)
      { wch: 20 }, // Department
      { wch: 25 }, // Employee Title
      { wch: 20 }, // Department Admin
      { wch: 20 }, // Department Advisor
      { wch: 15 }, // Annual Salary
      { wch: 15 }, // Visa Type
      { wch: 12 }, // Visa Status
      { wch: 15 }, // Expiration Date
      { wch: 15 }, // Visa Start Date
      { wch: 20 }, // Initial H-1B Start Date
      { wch: 18 }, // Prep Extension Date
      { wch: 15 }, // Max H Period
      { wch: 15 }, // I-94 Expiry Date
      { wch: 15 }, // PR Filing Date
      { wch: 18 }, // Number of Dependents
      { wch: 20 }, // Attorney Name
      { wch: 25 }, // Attorney Email
      { wch: 15 }, // Attorney Phone
      { wch: 20 }, // Attorney Firm
      { wch: 18 }, // Highest Education
      { wch: 20 }, // Field of Study
      { wch: 12 }, // SOC Code
      { wch: 25 }, // SOC Code Description
      { wch: 30 }, // General Notes
    ];
    worksheet['!cols'] = columnWidths;

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, filename);

    console.log(`✅ Excel file "${filename}" exported successfully`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export data to Excel');
  }
}

/**
 * Export a single employee to Excel
 */
export async function exportSingleEmployeeToExcel(employee: Employee, filename?: string): Promise<void> {
  const defaultFilename = `employee_${employee.id}_${employee.lastName || 'export'}.xlsx`;
  await exportEmployeesToExcel([employee], filename || defaultFilename);
}

/**
 * Generate timestamp for filename
 */
export function generateTimestampedFilename(prefix: string = 'visa_employees'): string {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);}