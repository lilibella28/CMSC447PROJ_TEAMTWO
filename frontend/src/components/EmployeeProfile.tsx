
import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { ArrowLeft, Edit, Plus, Calendar, Mail, Phone, User, Briefcase, DollarSign, TrendingUp, Users, FileText, AlertCircle, CheckCircle, Clock, Globe, GraduationCap, FileCheck, ChevronDown, ChevronUp, HelpCircle, History } from "lucide-react";
import { VisaCase, Employee, fetchEmployeeById, Dependent, PendingVisaApplication } from "../../utils/dataService";
import { AddVisa, VisaHistoryRecord } from "./AddVisa";
import { format } from "date-fns";

interface VisaHistory {
  id: string;
  visaType: string;
  status: "Active" | "Expired" | "Processing";
  startDate: string;
  expirationDate: string;
  comments?: string;
  addedDate?: string;
  addedBy?: string;
}

interface CaseNote {
  id: string;
  date: string;
  author: string;
  note: string;
}

interface EmployeeProfileProps {
  employee: VisaCase;
  onBack: () => void;
  onEdit?: () => void;
}

export function EmployeeProfile({ employee, onBack, onEdit }: EmployeeProfileProps) {
  const [fullEmployeeData, setFullEmployeeData] = useState<Employee | null>(null);
  const [notes, setNotes] = useState<CaseNote[]>([
    {
      id: "1",
      date: "2024-10-15 10:30 AM",
      author: "Sarah Johnson",
      note: "Initial visa application submitted. Awaiting approval from immigration office.",
    },
    {
      id: "2",
      date: "2024-09-20 2:15 PM",
      author: "Michael Chen",
      note: "Documents verified and sent to legal team for review.",
    },
  ]);

  const [showNoteInput, setShowNoteInput] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [showAddVisaDialog, setShowAddVisaDialog] = useState(false);
  const [openSections, setOpenSections] = useState({
    personal: true,
    employment: true,
    visa: true,
    education: true,
    administrative: true,
  });

  // Fetch full employee data including salary history
  useEffect(() => {
    const loadEmployeeData = async () => {
      try {
        const data = await fetchEmployeeById(employee.id);
        setFullEmployeeData(data);
      } catch (error) {
        console.error("Error loading employee data:", error);
      }
    };
    loadEmployeeData();
  }, [employee.id]);

  // Visa history state - in real app, this would come from backend
  const [visaHistory, setVisaHistory] = useState<VisaHistory[]>([
    {
      id: "1",
      visaType: employee.visaType,
      status: employee.status,
      startDate: "2022-01-15",
      expirationDate: employee.expirationDate,
      comments: "Current active visa",
      addedDate: "2022-01-10T10:30:00Z",
      addedBy: "Sarah Johnson",
    },
    {
      id: "2",
      visaType: "F-1",
      status: "Expired",
      startDate: "2020-08-20",
      expirationDate: "2022-01-14",
      comments: "Previous student visa - transitioned to work authorization",
      addedDate: "2020-08-15T14:20:00Z",
      addedBy: "Michael Chen",
    },
  ]);

  const handleAddNote = () => {
    if (newNote.trim()) {
      const note: CaseNote = {
        id: Date.now().toString(),
        date: new Date().toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
        author: "Current Admin",
        note: newNote,
      };
      setNotes([note, ...notes]);
      setNewNote("");
      setShowNoteInput(false);
    }
  };

  const handleSaveVisa = (visaData: VisaHistoryRecord) => {
    const newVisaHistory: VisaHistory = {
      id: visaData.id,
      visaType: visaData.visaType,
      status: visaData.status,
      startDate: visaData.startDate,
      expirationDate: visaData.expirationDate,
      comments: visaData.comments,
      addedDate: visaData.addedDate,
      addedBy: visaData.addedBy,
    };
    
    // Add to beginning of visa history (most recent first)
    setVisaHistory([newVisaHistory, ...visaHistory]);
    
    // In production, you would also update the backend here
    console.log("New visa record saved:", visaData);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default";
      case "Expired":
        return "destructive";
      case "Processing":
        return "secondary";
      case "Expiring Soon":
        return "outline";
      default:
        return "default";
    }
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const HelpTooltip = ({ text }: { text: string }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <HelpCircle className="h-4 w-4 text-[#6B7280] cursor-help" />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  // Mock additional employee data
  const employeeDetails = {
    email: fullEmployeeData?.email || `${employee.employee.name.toLowerCase().replace(/\s+/g, ".")}@umbc.edu`,
    employeeId: `EMP-${employee.id.padStart(5, "0")}`,
    jobTitle: fullEmployeeData?.employeeTitle || "Software Engineer",
    startDate: fullEmployeeData?.startDate || "2022-01-15",
    manager: fullEmployeeData?.departmentAdvisor || "Dr. Robert Smith",
    phone: fullEmployeeData?.phone || "+1 (410) 555-0123",
  };

  return (
    <div className="max-w-[960px] mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-sm">
        <button
          onClick={onBack}
          className="text-[#6B7280] hover:text-black transition-colors flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Employees
        </button>
        <span className="text-[#6B7280]">/</span>
        <span className="text-black font-medium">{employee.employee.name}</span>
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-black">{employee.employee.name}</h1>
          <p className="text-neutral-gray-500 mt-1">
            {employeeDetails.jobTitle} — {employee.employee.department} Department
          </p>
          {fullEmployeeData && fullEmployeeData.dependents > 0 && (
            <p className="text-sm text-[#6B7280] mt-1 flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {fullEmployeeData.dependents} {fullEmployeeData.dependents === 1 ? 'Dependent' : 'Dependents'}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Info
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-[#FFCC00] text-black hover:bg-[#FFCC00]/10"
            onClick={() => setShowAddVisaDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Visa
          </Button>
          <Button
            size="sm"
            className="bg-[#FFCC00] text-black hover:bg-[#FFCC00]/90"
            onClick={() => setShowNoteInput(!showNoteInput)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
        </div>
      </div>

      {/* Pending Visa Application Alert */}
      {fullEmployeeData?.pendingVisaApplication && (
        <Card className={`p-6 border-2 ${
          fullEmployeeData.pendingVisaApplication.status === "Approved" 
            ? "border-green-500 bg-green-50" 
            : fullEmployeeData.pendingVisaApplication.status === "Denied"
            ? "border-red-500 bg-red-50"
            : "border-[#FFCC00] bg-yellow-50"
        }`}>
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full ${
              fullEmployeeData.pendingVisaApplication.status === "Approved"
                ? "bg-green-500"
                : fullEmployeeData.pendingVisaApplication.status === "Denied"
                ? "bg-red-500"
                : "bg-[#FFCC00]"
            }`}>
              {fullEmployeeData.pendingVisaApplication.status === "Approved" ? (
                <CheckCircle className="h-5 w-5 text-white" />
              ) : fullEmployeeData.pendingVisaApplication.status === "Denied" ? (
                <AlertCircle className="h-5 w-5 text-white" />
              ) : (
                <Clock className="h-5 w-5 text-black" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-black">
                    Pending Visa Application
                  </h3>
                  <p className="text-sm text-[#6B7280] mt-1">
                    Transitioning from {employee.visaType} to{" "}
                    <span className="font-medium text-black">
                      {fullEmployeeData.pendingVisaApplication.targetVisaType}
                    </span>
                  </p>
                </div>
                <Badge 
                  variant={
                    fullEmployeeData.pendingVisaApplication.status === "Approved"
                      ? "default"
                      : fullEmployeeData.pendingVisaApplication.status === "Denied"
                      ? "destructive"
                      : "secondary"
                  }
                  className={
                    fullEmployeeData.pendingVisaApplication.status === "Approved"
                      ? "bg-green-500"
                      : fullEmployeeData.pendingVisaApplication.status === "Under Review"
                      ? "bg-blue-500 text-white"
                      : ""
                  }
                >
                  {fullEmployeeData.pendingVisaApplication.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="text-xs text-[#6B7280]">Application Filed</label>
                  <p className="text-sm text-black mt-1 font-medium">
                    {new Date(fullEmployeeData.pendingVisaApplication.applicationDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                {fullEmployeeData.pendingVisaApplication.expectedDecisionDate && (
                  <div>
                    <label className="text-xs text-[#6B7280]">Expected Decision</label>
                    <p className="text-sm text-black mt-1 font-medium">
                      {new Date(fullEmployeeData.pendingVisaApplication.expectedDecisionDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-xs text-[#6B7280]">Filed By</label>
                  <p className="text-sm text-black mt-1 font-medium">
                    {fullEmployeeData.pendingVisaApplication.filedBy}
                  </p>
                </div>
              </div>

              {fullEmployeeData.pendingVisaApplication.notes && (
                <div className="mt-4 p-3 bg-white rounded-md border border-[#E5E7EB]">
                  <div className="flex items-start gap-2">
                    <FileText className="h-4 w-4 text-[#6B7280] mt-0.5" />
                    <div>
                      <label className="text-xs text-[#6B7280]">Application Notes</label>
                      <p className="text-sm text-black mt-1">
                        {fullEmployeeData.pendingVisaApplication.notes}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Personal Information Section */}
      <Collapsible
        open={openSections.personal}
        onOpenChange={() => toggleSection("personal")}
      >
        <Card className="border border-[#E5E7EB]">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-6 hover:bg-[#F9FAFB] transition-colors">
            <h2 className="text-lg font-semibold text-black flex items-center">
              <User className="h-5 w-5 mr-2 text-[#FFCC00]" />
              Personal Information
            </h2>
            {openSections.personal ? (
              <ChevronUp className="h-5 w-5 text-[#6B7280]" />
            ) : (
              <ChevronDown className="h-5 w-5 text-[#6B7280]" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <label className="text-sm text-[#6B7280]">Full Name</label>
                  <p className="text-black mt-1">{employee.employee.name}</p>
                </div>
                <div>
                  <label className="text-sm text-[#6B7280]">UMBC Email Address</label>
                  <p className="text-black mt-1 flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-[#6B7280]" />
                    {employeeDetails.email}
                  </p>
                </div>
                {fullEmployeeData?.personalEmail && (
                  <div>
                    <label className="text-sm text-[#6B7280]">Personal Email</label>
                    <p className="text-black mt-1 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-[#6B7280]" />
                      {fullEmployeeData.personalEmail}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm text-[#6B7280]">Employee ID</label>
                  <p className="text-black mt-1">{employeeDetails.employeeId}</p>
                </div>
                <div>
                  <label className="text-sm text-[#6B7280]">Phone Number</label>
                  <p className="text-black mt-1 flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-[#6B7280]" />
                    {employeeDetails.phone}
                  </p>
                </div>
                {fullEmployeeData?.gender && (
                  <div>
                    <label className="text-sm text-[#6B7280]">Gender</label>
                    <p className="text-black mt-1">{fullEmployeeData.gender}</p>
                  </div>
                )}
                {fullEmployeeData?.countryOfBirth && (
                  <div>
                    <label className="text-sm text-[#6B7280]">Country of Birth</label>
                    <p className="text-black mt-1 flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-[#6B7280]" />
                      {fullEmployeeData.countryOfBirth}
                    </p>
                  </div>
                )}
                {fullEmployeeData?.nationality && (
                  <div>
                    <label className="text-sm text-[#6B7280]">Nationality</label>
                    <p className="text-black mt-1">{fullEmployeeData.nationality}</p>
                  </div>
                )}
                {fullEmployeeData?.citizenships && fullEmployeeData.citizenships.length > 0 && (
                  <div>
                    <label className="text-sm text-[#6B7280]">Citizenship(s)</label>
                    <p className="text-black mt-1">{fullEmployeeData.citizenships.join(", ")}</p>
                  </div>
                )}
                {fullEmployeeData?.dateOfBirth && (
                  <div>
                    <label className="text-sm text-[#6B7280]">Date of Birth</label>
                    <p className="text-black mt-1">
                      {new Date(fullEmployeeData.dateOfBirth).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
                {fullEmployeeData?.passportNumber && (
                  <div>
                    <label className="text-sm text-[#6B7280]">Passport Number</label>
                    <p className="text-black mt-1">{fullEmployeeData.passportNumber}</p>
                  </div>
                )}
                {fullEmployeeData?.address && (
                  <div className="md:col-span-2">
                    <label className="text-sm text-[#6B7280]">Address</label>
                    <p className="text-black mt-1">{fullEmployeeData.address}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm text-[#6B7280]">Current Status</label>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant={getStatusVariant(employee.status)}>
                      {employee.status}
                    </Badge>
                    {employee.status === "Expired" && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge className="bg-[#DC2626] text-white border-[#DC2626] hover:bg-[#DC2626]/90 flex items-center gap-1 cursor-help">
                              <AlertCircle className="h-3 w-3" />
                              Highest Priority
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>This employee's visa has expired and needs action.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Employment Information Section */}
      <Collapsible
        open={openSections.employment}
        onOpenChange={() => toggleSection("employment")}
      >
        <Card className="border border-[#E5E7EB]">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-6 hover:bg-[#F9FAFB] transition-colors">
            <h2 className="text-lg font-semibold text-black flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-[#FFCC00]" />
              Employment Information
            </h2>
            {openSections.employment ? (
              <ChevronUp className="h-5 w-5 text-[#6B7280]" />
            ) : (
              <ChevronDown className="h-5 w-5 text-[#6B7280]" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <label className="text-sm text-[#6B7280]">Department</label>
                  <p className="text-black mt-1">{employee.employee.department}</p>
                </div>
                <div>
                  <label className="text-sm text-[#6B7280]">Job Title / Position</label>
                  <p className="text-black mt-1">{employeeDetails.jobTitle}</p>
                </div>
                {fullEmployeeData?.departmentAdmin && (
                  <div>
                    <label className="text-sm text-[#6B7280]">Department Admin</label>
                    <p className="text-black mt-1">{fullEmployeeData.departmentAdmin}</p>
                  </div>
                )}
                {fullEmployeeData?.departmentAdvisor && (
                  <div>
                    <label className="text-sm text-[#6B7280]">Department Advisor / PI / Chair</label>
                    <p className="text-black mt-1">{fullEmployeeData.departmentAdvisor}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm text-[#6B7280]">Start Date</label>
                  <p className="text-black mt-1 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-[#6B7280]" />
                    {employeeDetails.startDate}
                  </p>
                </div>
                {fullEmployeeData?.annualSalary && (
                  <div>
                    <label className="text-sm text-[#6B7280]">Annual Salary</label>
                    <p className="text-black mt-1 flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-[#6B7280]" />
                      ${fullEmployeeData.annualSalary.toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Visa & Immigration Section */}
      <Collapsible
        open={openSections.visa}
        onOpenChange={() => toggleSection("visa")}
      >
        <Card className="border border-[#E5E7EB]">
          <CollapsibleTrigger className="flex items-center justify-between w-full p-6 hover:bg-[#F9FAFB] transition-colors">
            <h2 className="text-lg font-semibold text-black flex items-center">
              <FileText className="h-5 w-5 mr-2 text-[#FFCC00]" />
              Visa & Immigration
            </h2>
            {openSections.visa ? (
              <ChevronUp className="h-5 w-5 text-[#6B7280]" />
            ) : (
              <ChevronDown className="h-5 w-5 text-[#6B7280]" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-6 pb-6 space-y-6">
              {/* Current Visa Details */}
              <div>
                <h3 className="text-base font-medium text-black mb-3">Current Visa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <label className="text-sm text-[#6B7280]">Visa Type</label>
                    <p className="text-black mt-1 font-medium">{employee.visaType}</p>
                  </div>
                  <div>
                    <label className="text-sm text-[#6B7280]">Filed By</label>
                    <p className="text-black mt-1">{fullEmployeeData?.visaFiledBy || employee.visaFiledBy}</p>
                  </div>
                  {fullEmployeeData?.caseType && (
                    <div>
                      <label className="text-sm text-[#6B7280]">Case Type</label>
                      <p className="text-black mt-1">{fullEmployeeData.caseType}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-[#6B7280]">Start Date</label>
                    <p className="text-black mt-1">{employee.visaStartDate}</p>
                  </div>
                  <div>
                    <label className="text-sm text-[#6B7280]">Expiration Date</label>
                    <p className="text-black mt-1">{employee.expirationDate}</p>
                  </div>
                  {fullEmployeeData?.initialH1BStartDate && (
                    <div>
                      <label className="text-sm text-[#6B7280]">Initial H-1B Start Date</label>
                      <p className="text-black mt-1">{fullEmployeeData.initialH1BStartDate}</p>
                    </div>
                  )}
                  {fullEmployeeData?.prepExtensionDate && (
                    <div>
                      <label className="text-sm text-[#6B7280] flex items-center gap-1">
                        Prep Extension Date
                        <HelpTooltip text="Reminder date for when to begin preparing visa extension" />
                      </label>
                      <p className="text-black mt-1">{fullEmployeeData.prepExtensionDate}</p>
                    </div>
                  )}
                  {fullEmployeeData?.maxHPeriod && (
                    <div>
                      <label className="text-sm text-[#6B7280] flex items-center gap-1">
                        Max H Period End Date
                        <HelpTooltip text="The maximum period end date for H-1B visa" />
                      </label>
                      <p className="text-black mt-1">{fullEmployeeData.maxHPeriod}</p>
                    </div>
                  )}
                  {fullEmployeeData?.i94Number && (
                    <div>
                      <label className="text-sm text-[#6B7280] flex items-center gap-1">
                        I-94 Number
                        <HelpTooltip text="The I-94 Arrival/Departure Record number" />
                      </label>
                      <p className="text-black mt-1">{fullEmployeeData.i94Number}</p>
                    </div>
                  )}
                  {fullEmployeeData?.i94ExpiryDate && (
                    <div>
                      <label className="text-sm text-[#6B7280] flex items-center gap-1">
                        I-94 Expiry Date
                        <HelpTooltip text="The expiration date shown on the I-94 record" />
                      </label>
                      <p className="text-black mt-1">{fullEmployeeData.i94ExpiryDate}</p>
                    </div>
                  )}
                  {fullEmployeeData?.sevisId && (
                    <div>
                      <label className="text-sm text-[#6B7280]">SEVIS ID</label>
                      <p className="text-black mt-1">{fullEmployeeData.sevisId}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Permanent Residency Information */}
              {fullEmployeeData?.permanentResidency && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-base font-medium text-black mb-3">Permanent Residency Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      {fullEmployeeData.permanentResidency.filingDate && (
                        <div>
                          <label className="text-sm text-[#6B7280]">Filing Date</label>
                          <p className="text-black mt-1">{fullEmployeeData.permanentResidency.filingDate}</p>
                        </div>
                      )}
                      {fullEmployeeData.permanentResidency.currentStatus && (
                        <div>
                          <label className="text-sm text-[#6B7280]">Current Status</label>
                          <div className="mt-1">
                            <Badge
                              variant={
                                fullEmployeeData.permanentResidency.currentStatus === "Approved"
                                  ? "default"
                                  : fullEmployeeData.permanentResidency.currentStatus === "Denied"
                                  ? "destructive"
                                  : "secondary"
                              }
                              className={
                                fullEmployeeData.permanentResidency.currentStatus === "Approved"
                                  ? "bg-green-500"
                                  : ""
                              }
                            >
                              {fullEmployeeData.permanentResidency.currentStatus}
                            </Badge>
                          </div>
                        </div>
                      )}
                      {fullEmployeeData.permanentResidency.notes && (
                        <div className="md:col-span-2">
                          <label className="text-sm text-[#6B7280]">Notes</label>
                          <p className="text-black mt-1">{fullEmployeeData.permanentResidency.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Visa History */}
              <Separator />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-medium text-black flex items-center">
                    <History className="h-5 w-5 mr-2 text-[#6B7280]" />
                    Visa History
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-[#FFCC00] text-black hover:bg-[#FFCC00]/90 border-[#FFCC00]"
                    onClick={() => setShowAddVisaDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Visa
                  </Button>
                </div>
                <div className="space-y-4">
                  {visaHistory.length === 0 ? (
                    <div className="text-center py-8 text-[#6B7280]">
                      <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No visa history records yet</p>
                      <p className="text-sm mt-1">Click "Add Visa" to create the first record</p>
                    </div>
                  ) : (
                    visaHistory.map((visa, index) => (
                      <div key={visa.id}>
                        {index > 0 && <Separator className="my-4" />}
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium text-black">{visa.visaType}</h3>
                              <Badge variant={getStatusVariant(visa.status)} className="mt-1">
                                {visa.status}
                              </Badge>
                            </div>
                            {visa.addedDate && visa.addedBy && (
                              <div className="text-right text-xs text-[#6B7280]">
                                <p>Added: {format(new Date(visa.addedDate), "MMM dd, yyyy")}</p>
                                <p className="mt-0.5">By: {visa.addedBy}</p>
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <label className="text-[#6B7280]">Start Date</label>
                              <p className="text-black mt-1">{format(new Date(visa.startDate), "MMM dd, yyyy")}</p>
                            </div>
                            <div>
                              <label className="text-[#6B7280]">Expiration Date</label>
                              <p className="text-black mt-1">{format(new Date(visa.expirationDate), "MMM dd, yyyy")}</p>
                            </div>
                            {visa.comments && (
                              <div className="md:col-span-2">
                                <label className="text-[#6B7280]">Comments</label>
                                <p className="text-black mt-1">{visa.comments}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Education Section */}
      {(fullEmployeeData?.highestEducation || fullEmployeeData?.fieldOfStudy) && (
        <Collapsible
          open={openSections.education}
          onOpenChange={() => toggleSection("education")}
        >
          <Card className="border border-[#E5E7EB]">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-6 hover:bg-[#F9FAFB] transition-colors">
              <h2 className="text-lg font-semibold text-black flex items-center">
                <GraduationCap className="h-5 w-5 mr-2 text-[#FFCC00]" />
                Education
              </h2>
              {openSections.education ? (
                <ChevronUp className="h-5 w-5 text-[#6B7280]" />
              ) : (
                <ChevronDown className="h-5 w-5 text-[#6B7280]" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {fullEmployeeData.highestEducation && (
                    <div>
                      <label className="text-sm text-[#6B7280]">Highest Educational Level</label>
                      <p className="text-black mt-1">{fullEmployeeData.highestEducation}</p>
                    </div>
                  )}
                  {fullEmployeeData.fieldOfStudy && (
                    <div>
                      <label className="text-sm text-[#6B7280]">Field of Study</label>
                      <p className="text-black mt-1">{fullEmployeeData.fieldOfStudy}</p>
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Administrative Fields Section */}
      {(fullEmployeeData?.socCode || fullEmployeeData?.socCodeDescription || fullEmployeeData?.generalNotes) && (
        <Collapsible
          open={openSections.administrative}
          onOpenChange={() => toggleSection("administrative")}
        >
          <Card className="border border-[#E5E7EB]">
            <CollapsibleTrigger className="flex items-center justify-between w-full p-6 hover:bg-[#F9FAFB] transition-colors">
              <h2 className="text-lg font-semibold text-black flex items-center">
                <FileCheck className="h-5 w-5 mr-2 text-[#FFCC00]" />
                Administrative Fields
              </h2>
              {openSections.administrative ? (
                <ChevronUp className="h-5 w-5 text-[#6B7280]" />
              ) : (
                <ChevronDown className="h-5 w-5 text-[#6B7280]" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {fullEmployeeData.socCode && (
                    <div>
                      <label className="text-sm text-[#6B7280] flex items-center gap-1">
                        SOC Code
                        <HelpTooltip text="Standard Occupational Classification code for USCIS reporting" />
                      </label>
                      <p className="text-black mt-1">{fullEmployeeData.socCode}</p>
                    </div>
                  )}
                  {fullEmployeeData.socCodeDescription && (
                    <div>
                      <label className="text-sm text-[#6B7280]">SOC Code Description</label>
                      <p className="text-black mt-1">{fullEmployeeData.socCodeDescription}</p>
                    </div>
                  )}
                  {fullEmployeeData.generalNotes && (
                    <div className="md:col-span-2">
                      <label className="text-sm text-[#6B7280]">General Notes</label>
                      <p className="text-black mt-1">{fullEmployeeData.generalNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Dependents Information */}
      {fullEmployeeData && fullEmployeeData.dependentsDetails && fullEmployeeData.dependentsDetails.length > 0 && (
        <Card className="p-6 border border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-black flex items-center">
              <Users className="h-5 w-5 mr-2 text-[#FFCC00]" />
              Dependents ({fullEmployeeData.dependentsDetails.length})
            </h2>
            <Button
              variant="outline"
              size="sm"
              className="bg-[#FFCC00] text-black hover:bg-[#FFCC00]/90 border-[#FFCC00]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Dependent
            </Button>
          </div>

          <div className="space-y-4">
            {fullEmployeeData.dependentsDetails.map((dependent, index) => (
              <div key={dependent.id}>
                {index > 0 && <Separator className="my-4" />}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-black">{dependent.name}</h3>
                      <Badge variant="secondary" className="mt-1">
                        {dependent.relationship}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <label className="text-[#6B7280]">Date of Birth</label>
                      <p className="text-black mt-1">{new Date(dependent.dateOfBirth).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</p>
                    </div>
                    <div>
                      <label className="text-[#6B7280]">Nationality</label>
                      <p className="text-black mt-1">{dependent.nationality}</p>
                    </div>
                    {dependent.passportNumber && (
                      <div>
                        <label className="text-[#6B7280]">Passport Number</label>
                        <p className="text-black mt-1">{dependent.passportNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Salary Progression */}
      {fullEmployeeData && fullEmployeeData.salaryHistory && fullEmployeeData.salaryHistory.length > 0 && (
        <Card className="p-6 border border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-black flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-[#FFCC00]" />
              Salary Progression
            </h2>
            <div className="text-right">
              <p className="text-sm text-[#6B7280]">Current Salary</p>
              <p className="text-xl font-semibold text-black">
                ${fullEmployeeData.salaryHistory[fullEmployeeData.salaryHistory.length - 1].amount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {fullEmployeeData.salaryHistory
              .slice()
              .reverse()
              .map((record, index) => {
                const isLatest = index === 0;
                const previousSalary = index < fullEmployeeData.salaryHistory.length - 1 
                  ? fullEmployeeData.salaryHistory[fullEmployeeData.salaryHistory.length - 1 - index - 1].amount 
                  : null;
                const salaryIncrease = previousSalary ? record.amount - previousSalary : null;
                const percentageIncrease = previousSalary ? ((salaryIncrease! / previousSalary) * 100).toFixed(1) : null;

                return (
                  <div key={index}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium text-black">{record.position}</h3>
                          {isLatest && (
                            <Badge className="bg-[#FFCC00] text-black border-[#FFCC00] hover:bg-[#FFCC00]/90">
                              Current
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center text-[#6B7280]">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(record.effectiveDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          {salaryIncrease !== null && salaryIncrease > 0 && (
                            <div className="flex items-center text-[#10B981]">
                              <TrendingUp className="h-4 w-4 mr-1" />
                              +${salaryIncrease.toLocaleString()} ({percentageIncrease}%)
                            </div>
                          )}
                        </div>
                        {record.changeReason && (
                          <p className="text-sm text-[#6B7280] italic">{record.changeReason}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-semibold text-black">
                          ${record.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-[#6B7280] mt-1">Annual</p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Summary Stats */}
          {fullEmployeeData.salaryHistory.length > 1 && (
            <>
              <Separator className="my-6" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[#F9FAFB] rounded-lg">
                <div>
                  <label className="text-xs text-[#6B7280]">Starting Salary</label>
                  <p className="text-lg font-semibold text-black">
                    ${fullEmployeeData.salaryHistory[0].amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-[#6B7280]">Total Increase</label>
                  <p className="text-lg font-semibold text-[#10B981]">
                    ${(fullEmployeeData.salaryHistory[fullEmployeeData.salaryHistory.length - 1].amount - 
                       fullEmployeeData.salaryHistory[0].amount).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-[#6B7280]">Total Growth</label>
                  <p className="text-lg font-semibold text-[#10B981]">
                    {(((fullEmployeeData.salaryHistory[fullEmployeeData.salaryHistory.length - 1].amount - 
                        fullEmployeeData.salaryHistory[0].amount) / 
                       fullEmployeeData.salaryHistory[0].amount) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </>
          )}
        </Card>
      )}

      {/* Case Notes */}
      <Card className="p-6 border border-[#E5E7EB]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-black">Case Notes</h2>
        </div>

        {/* Add Note Input */}
        {showNoteInput && (
          <div className="mb-4 p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
            <Textarea
              placeholder="Enter your note here..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="mb-2 bg-white"
              rows={4}
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                className="bg-[#FFCC00] text-black hover:bg-[#FFCC00]/90"
                onClick={handleAddNote}
              >
                Save Note
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowNoteInput(false);
                  setNewNote("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Notes List */}
        <div className="space-y-4">
          {notes.map((note, index) => (
            <div key={note.id}>
              {index > 0 && <Separator className="my-4" />}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-black">{note.author}</span>
                  <span className="text-sm text-[#6B7280]">{note.date}</span>
                </div>
                <p className="text-sm text-[#374151]">{note.note}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Add Visa Dialog */}
      <AddVisa
        open={showAddVisaDialog}
        onClose={() => setShowAddVisaDialog(false)}
        onSave={handleSaveVisa}
        employeeName={employee.employee.name}
      />
    </div>
  );
}
