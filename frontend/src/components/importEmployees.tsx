// ========================================
// BACKEND INTEGRATION SETUP
// ========================================
// TO USE REAL BACKEND ON YOUR LOCAL COMPUTER:
// 1. Ensure Flask backend is running: `python backend/run.py`
// 2. Backend should be at: http://localhost:5000
// 3. Scroll to line ~115 "processImport" function
// 4. UNCOMMENT "OPTION 1: REAL BACKEND API" block
// 5. COMMENT OUT "OPTION 2: MOCK DATA" block
// ========================================

import { useState, useCallback, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle, ArrowRight, FileText } from "lucide-react";
import { EmployeeData } from "../../utils/employeeData";
import { fetchEmployees, Employee } from "../../utils/dataService";
import { toast } from "sonner";

interface ImportSummary {
  newRecords: number;
  updatedRecords: number;
  skippedRecords: number;
  errors: string[];
  warnings?: string[]; // Add warnings for missing/invalid dates
  timestamp: Date;
}

// Backend API Response Interface
interface BackendImportResponse {
  success: boolean;
  newRecords?: number;
  updatedRecords?: number;
  skippedRecords?: number;
  visasAdded?: number;
  message?: string;
  error?: string;
}

type ImportStatus = "idle" | "uploading" | "processing" | "validating" | "complete" | "error";

export function ImportEmployees() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<ImportStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [employeesData, setEmployeesData] = useState<Employee[]>([]);

  // Load employee data for duplicate detection
  useEffect(() => {
    async function loadEmployees() {
      try {
        const data = await fetchEmployees();
        setEmployeesData(data);
      } catch (error) {
        console.error("Error loading employees:", error);
      }
    }
    loadEmployees();
  }, []);

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  // Validate file type
  const validateFile = (file: File): boolean => {
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
    ];

    const validExtensions = [".xlsx", ".xls", ".csv"];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf("."));

    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      setErrorMessage("File must be Excel (.xlsx, .xls) or CSV (.csv) format.");
      return false;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setErrorMessage("File size must be less than 10MB.");
      return false;
    }

    setErrorMessage(null);
    return true;
  };

  // Handle file selection
  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
      setImportStatus("idle");
      setImportSummary(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // ========================================
  // BACKEND INTEGRATION - UNCOMMENT WHEN ON LOCAL COMPUTER
  // ========================================
  
  // OPTION 1: REAL BACKEND API (Uncomment this when your Flask backend is running)
  
  const processImport = async () => {
    if (!selectedFile) return;

    try {
      setImportStatus("uploading");
      setUploadProgress(0);
      setErrorMessage(null);

      // Create FormData with the file
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("sheet_name", "Current H-1B cases"); // Change sheet name if needed

      // Call your Flask backend API
      // IMPORTANT: Update the URL to match your backend server
      // Default: http://localhost:5000/api/excel/import-excel
      const response = await fetch("http://localhost:5000/api/excel/import-excel", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Import failed");
      }

      // Update progress to 100%
      setUploadProgress(100);

      // Set import summary from backend response
      const summary: ImportSummary = {
        newRecords: result.newRecords || 0,
        updatedRecords: result.updatedRecords || 0,
        skippedRecords: result.skippedRecords || 0,
        errors: [],
        timestamp: new Date(),
      };

      setImportSummary(summary);
      setImportStatus("complete");

      // Show success toast
      toast.success("Import Complete!", {
        description: `${summary.newRecords} new employees, ${summary.updatedRecords} updated, ${result.visasAdded || 0} visas added.`,
        duration: 5000,
      });

    } catch (error) {
      setImportStatus("error");
      const errorMsg = error instanceof Error ? error.message : "Failed to import file. Please try again.";
      setErrorMessage(errorMsg);
      toast.error("Import Failed", {
        description: errorMsg,
      });
    }
  };
  

  // OPTION 2: MOCK DATA (Currently active - comment this out when using real backend)
  /*
  const processImport = async () => {
    if (!selectedFile) return;

    try {
      setImportStatus("uploading");
      setUploadProgress(0);

      // Simulate upload progress
      await simulateProgress(0, 30, "uploading");

      setImportStatus("processing");
      await simulateProgress(30, 60, "processing");

      setImportStatus("validating");
      await simulateProgress(60, 90, "validating");

      // Simulate API call to backend
      const mockResults = await simulateImportProcess();

      setUploadProgress(100);
      setImportSummary(mockResults);
      setImportStatus("complete");

      // Show success toast
      toast.success("Import Complete!", {
        description: `${mockResults.newRecords} new cases added, ${mockResults.updatedRecords} records updated, ${mockResults.skippedRecords} duplicates skipped.`,
        duration: 5000,
      });

    } catch (error) {
      setImportStatus("error");
      setErrorMessage("Failed to import file. Please try again.");
      toast.error("Import Failed", {
        description: "There was an error processing your file.",
      });
    }
  };
  */

  // Simulate progress updates
  const simulateProgress = (start: number, end: number, status: ImportStatus): Promise<void> => {
    return new Promise((resolve) => {
      let current = start;
      const interval = setInterval(() => {
        current += 2;
        setUploadProgress(Math.min(current, end));
        if (current >= end) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
    });
  };

  // Simulate import process with mock data
  // In production, this would be handled by the Flask backend
  const simulateImportProcess = (): Promise<ImportSummary> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock statistics based on current employee data
        const totalRecords = 15; // Simulated records in uploaded file
        const existingEmails = employeesData.map(emp => emp.email);
        
        // Simulate: 5 new, 3 updated, 7 identical
        const summary: ImportSummary = {
          newRecords: 5,
          updatedRecords: 3,
          skippedRecords: 7,
          errors: [],
          warnings: ["2 records have missing or invalid dates."], // Add warnings for missing/invalid dates
          timestamp: new Date(),
        };

        resolve(summary);
      }, 1000);
    });
  };

  // Reset to initial state
  const handleReset = () => {
    setSelectedFile(null);
    setImportStatus("idle");
    setUploadProgress(0);
    setImportSummary(null);
    setErrorMessage(null);
  };

  // Get status text
  const getStatusText = (): string => {
    switch (importStatus) {
      case "uploading":
        return "Uploading file...";
      case "processing":
        return "Processing data...";
      case "validating":
        return "Validating records...";
      case "complete":
        return "Import complete";
      case "error":
        return "Import failed";
      default:
        return "";
    }
  };

  const isProcessing = ["uploading", "processing", "validating"].includes(importStatus);
  const isComplete = importStatus === "complete";
  const hasError = importStatus === "error" || !!errorMessage;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Upload className="h-7 w-7 text-[#5B8DEF]" />
            <h1 className="text-[#1E1E1E]">
              Import Employee Visa Cases
            </h1>
          </div>
          <p className="text-[#4A4A4A]">
            Upload an Excel file to add or update employee visa records automatically.
          </p>
          <div className="mt-6 h-[1px] bg-[#E5E5E5]" />
        </div>

        {/* Upload Section */}
        <Card className="mb-6 border-[#E5E5E5]">
          <div className="p-8">
            <h2 className="text-[#1E1E1E] mb-4">Upload Excel File</h2>
            
            {/* Drag and Drop Area */}
            <div
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-lg p-12 text-center
                transition-all duration-200
                ${isDragging 
                  ? "border-[#5B8DEF] bg-[#E9F2FF]" 
                  : errorMessage 
                    ? "border-[#D86464] bg-[#FDECEA]"
                    : selectedFile
                      ? "border-[#5BB974] bg-[#F0F9F4]"
                      : "border-[#E1E1E1] bg-[#F8F9FA] hover:border-[#5B8DEF] hover:bg-white cursor-pointer"
                }
              `}
            >
              <input
                type="file"
                id="file-upload"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileInputChange}
                disabled={isProcessing || isComplete}
              />

              {selectedFile ? (
                <div className="flex flex-col items-center gap-3">
                  <FileSpreadsheet className="h-12 w-12 text-[#5BB974]" />
                  <div>
                    <p className="text-[#1E1E1E]">{selectedFile.name}</p>
                    <p className="text-sm text-[#6B7280] mt-1">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  {!isProcessing && !isComplete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReset();
                      }}
                      className="mt-2"
                    >
                      Choose Different File
                    </Button>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <Upload className={`h-12 w-12 ${errorMessage ? "text-[#D86464]" : "text-[#9CA3AF]"}`} />
                  <div>
                    <p className="text-[#1E1E1E]">
                      Drop file here or click to upload
                    </p>
                    <p className="text-sm text-[#6B7280] mt-1">
                      Supports .xlsx, .xls, or .csv files (max 10MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && !isProcessing && (
              <Alert className="mt-4 border-[#D86464] bg-[#FDECEA]">
                <XCircle className="h-4 w-4 text-[#D86464]" />
                <AlertDescription className="text-[#D86464]">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* Upload Button */}
            {selectedFile && !isProcessing && !isComplete && !errorMessage && (
              <div className="mt-6 flex justify-center">
                <Button
                  onClick={processImport}
                  className="bg-[#5B8DEF] hover:bg-[#4A7DD8] text-white px-8"
                  size="lg"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Start Import
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Progress Section */}
        {isProcessing && (
          <Card className="mb-6 border-[#E5E5E5]">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#5B8DEF]"></div>
                <h2 className="text-[#1E1E1E]">{getStatusText()}</h2>
              </div>
              
              <Progress value={uploadProgress} className="h-2" />
              
              <p className="text-sm text-[#6B7280] mt-2">
                {uploadProgress}% complete
              </p>
            </div>
          </Card>
        )}

        {/* Import Summary */}
        {isComplete && importSummary && (
          <Card className="mb-6 border-[#E5E5E5] shadow-md">
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <CheckCircle2 className="h-6 w-6 text-[#5BB974]" />
                <h2 className="text-[#1E1E1E]">Import Complete</h2>
              </div>

              {/* Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* New Records */}
                <div className="bg-[#F0F9F4] border border-[#5BB974]/20 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#4A4A4A]">New Employees Created</span>
                    <CheckCircle2 className="h-5 w-5 text-[#5BB974]" />
                  </div>
                  <p className="text-[#5BB974]">{importSummary.newRecords}</p>
                  <p className="text-xs text-[#6B7280] mt-1">Records added to system</p>
                </div>

                {/* Updated Records */}
                <div className="bg-[#FFF9EB] border border-[#EFB74A]/20 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#4A4A4A]">Existing Records Updated</span>
                    <AlertCircle className="h-5 w-5 text-[#EFB74A]" />
                  </div>
                  <p className="text-[#EFB74A]">{importSummary.updatedRecords}</p>
                  <p className="text-xs text-[#6B7280] mt-1">Records with changes</p>
                </div>

                {/* Skipped Records */}
                <div className="bg-[#F5F5F5] border border-[#9E9E9E]/20 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#4A4A4A]">Duplicates Skipped</span>
                    <FileText className="h-5 w-5 text-[#9E9E9E]" />
                  </div>
                  <p className="text-[#9E9E9E]">{importSummary.skippedRecords}</p>
                  <p className="text-xs text-[#6B7280] mt-1">Already up to date</p>
                </div>
              </div>

              {/* Summary Text */}
              <div className="bg-[#F8F9FA] rounded-lg p-4 mb-6">
                <p className="text-sm text-[#4A4A4A]">
                  Import finished successfully on{" "}
                  <span className="font-medium text-[#1E1E1E]">
                    {importSummary.timestamp.toLocaleString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </p>
              </div>

              {/* Warnings Section - Display missing/invalid dates */}
              {importSummary.warnings && importSummary.warnings.length > 0 && (
                <Alert className="mb-6 border-[#EFB74A] bg-[#FFF9EB]">
                  <AlertCircle className="h-4 w-4 text-[#EFB74A]" />
                  <AlertDescription className="text-[#7A4C00]">
                    <p className="font-medium mb-2">Import Warnings:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {importSummary.warnings.map((warning, index) => (
                        <li key={index} className="text-sm">{warning}</li>
                      ))}
                    </ul>
                    <p className="text-xs mt-2">
                      Please review affected employee records and update missing dates manually.
                    </p>
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => window.location.href = "#dashboard"}
                  className="bg-[#5B8DEF] hover:bg-[#4A7DD8] text-white flex-1 sm:flex-none"
                >
                  View All Cases
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="flex-1 sm:flex-none"
                >
                  Import Another File
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Information Card */}
        <Card className="border-[#E5E5E5] bg-[#F8F9FA]">
          <div className="p-6">
            <h3 className="text-[#1E1E1E] mb-3">How Import Works</h3>
            <ul className="space-y-2 text-sm text-[#4A4A4A]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#5BB974] mt-0.5 flex-shrink-0" />
                <span>System identifies existing employees using email or unique ID</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#5BB974] mt-0.5 flex-shrink-0" />
                <span>If employee exists and data has changed, record is updated automatically</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#5BB974] mt-0.5 flex-shrink-0" />
                <span>If employee does not exist, a new record is created</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#5BB974] mt-0.5 flex-shrink-0" />
                <span>If record is identical to existing data, it is skipped (no duplication)</span>
              </li>
            </ul>

            <div className="mt-4 pt-4 border-t border-[#E5E5E5]">
              <p className="text-xs text-[#6B7280] mb-2">
                <strong>Developer Note:</strong> This feature connects to a Flask API endpoint at{" "}
                <code className="bg-[#E5E5E5] px-1 py-0.5 rounded">http://localhost:5000/api/excel/import-excel</code>
              </p>
              <p className="text-xs text-[#6B7280]">
                <strong>To activate backend:</strong> Uncomment "OPTION 1: REAL BACKEND API" in the{" "}
                <code className="bg-[#E5E5E5] px-1 py-0.5 rounded">processImport</code> function (line ~115).
                Comment out "OPTION 2: MOCK DATA". Ensure Flask server is running with{" "}
                <code className="bg-[#E5E5E5] px-1 py-0.5 rounded">python backend/run.py</code>
              </p>
            </div>
          </div>
        </Card>
        </div>
    </div>
  );
}