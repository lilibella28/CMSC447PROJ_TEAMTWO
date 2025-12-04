// Excel Export Utility
// Uses the xlsx library (SheetJS) to export employee data to Excel format

import * as XLSX from "xlsx";
import { VisaCase } from "./dataService";

/**
 * Exports employee data to Excel file
 * @param data Array of VisaCase objects to export
 * @param filename Name of the file (without extension)
 */
export function exportToExcel(data: VisaCase[], filename: string = "employee_data") {
  // Transform data to flat structure for Excel
  const exportData = data.map((item) => ({
    "Employee Name": item.employee.name,
    "Email": item.employee.email || "N/A",
    "Phone": item.employee.phone || "N/A",
    "Department": item.employee.department,
    "Visa Type": item.visa_type,
    "Status": item.status,
    "Start Date": item.visa_start_date || "N/A",
    "Expiration Date": item.expiration_date,
    "Days Left": item.daysLeft,
    "Filed By": item.visaFiledBy || "Self-Petition",
    "Has Pending Application": item.hasPendingApplication ? "Yes" : "No",
    "Pending Target Visa Type": item.pendingTargetvisa_type || "N/A",
  }));

  // Create a new workbook
  const workbook = XLSX.utils.book_new();

  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Set column widths for better readability
  const columnWidths = [
    { wch: 25 }, // Employee Name
    { wch: 30 }, // Email
    { wch: 15 }, // Phone
    { wch: 25 }, // Department
    { wch: 15 }, // Visa Type
    { wch: 15 }, // Status
    { wch: 12 }, // Start Date
    { wch: 15 }, // Expiration Date
    { wch: 12 }, // Days Left
    { wch: 18 }, // Filed By
    { wch: 22 }, // Has Pending Application
    { wch: 22 }, // Pending Target Visa Type
  ];
  worksheet["!cols"] = columnWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

  // Generate Excel file and trigger download
  const timestamp = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const fullFilename = `${filename}_${timestamp}.xlsx`;
  
  XLSX.writeFile(workbook, fullFilename);
}

/**
 * Exports filtered employee data with custom columns
 * @param data Array of VisaCase objects to export
 * @param columns Array of column names to include
 * @param filename Name of the file (without extension)
 */
export function exportToExcelCustom(
  data: VisaCase[],
  columns: string[],
  filename: string = "employee_data"
) {
  // Define available fields mapping
  const fieldMapping: Record<string, (item: VisaCase) => any> = {
    "Employee Name": (item) => item.employee.name,
    "Email": (item) => item.employee.email || "N/A",
    "Phone": (item) => item.employee.phone || "N/A",
    "Department": (item) => item.employee.department,
    "Visa Type": (item) => item.visa_type,
    "Status": (item) => item.status,
    "Start Date": (item) => item.visa_start_date || "N/A",
    "Expiration Date": (item) => item.expiration_date,
    "Days Left": (item) => item.daysLeft,
    "Filed By": (item) => item.visaFiledBy || "Self-Petition",
    "Has Pending Application": (item) => item.hasPendingApplication ? "Yes" : "No",
    "Pending Target Visa Type": (item) => item.pendingTargetvisa_type || "N/A",
  };

  // Transform data with selected columns only
  const exportData = data.map((item) => {
    const row: Record<string, any> = {};
    columns.forEach((col) => {
      if (fieldMapping[col]) {
        row[col] = fieldMapping[col](item);
      }
    });
    return row;
  });

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");

  // Generate and download
  const timestamp = new Date().toISOString().split("T")[0];
  const fullFilename = `${filename}_${timestamp}.xlsx`;
  
  XLSX.writeFile(workbook, fullFilename);
}

/**
 * Exports summary statistics to Excel
 * @param statistics Object containing visa statistics
 * @param filename Name of the file (without extension)
 */
export function exportStatisticsToExcel(
  statistics: {
    activeVisas: number;
    expiringWithin60Days: number;
    expired: number;
    pending: number;
    totalVisas: number;
  },
  filename: string = "visa_statistics"
) {
  const exportData = [
    { Metric: "Active Visas", Count: statistics.activeVisas },
    { Metric: "Expiring Within 60 Days", Count: statistics.expiringWithin60Days },
    { Metric: "Expired", Count: statistics.expired },
    { Metric: "Pending", Count: statistics.pending },
    { Metric: "Total Visas", Count: statistics.totalVisas },
  ];

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Set column widths
  worksheet["!cols"] = [{ wch: 30 }, { wch: 15 }];

  XLSX.utils.book_append_sheet(workbook, worksheet, "Statistics");

  const timestamp = new Date().toISOString().split("T")[0];
  const fullFilename = `${filename}_${timestamp}.xlsx`;
  
  XLSX.writeFile(workbook, fullFilename);
}
