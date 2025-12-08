import { ArrowLeft, Edit, Plus, Calendar, Mail, Phone, User, Briefcase, DollarSign, TrendingUp, Users, FileText, AlertCircle, CheckCircle, Clock, Globe, GraduationCap, FileCheck, ChevronDown, ChevronUp, HelpCircle, History, Filter, Trash2, X, Save } from "lucide-react";
import { VisaCase, Employee, fetchEmployeeById, Dependent, PendingVisaApplication, fetchVisaHistory, addVisaHistory, VisaHistoryRecord as APIVisaHistoryRecord } from "../../utils/dataService";
import { AddVisa, VisaHistoryRecord } from "./AddVisa";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { formatDate, formatDateWithFallback, isMissingDate, getMissingDateTooltip } from "../../utils/dateUtils";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";


interface VisaHistory {
  id: string;
  visa_type: string;
  status: "Active" | "Expired" | "Processing";
  start_date : string;
  expiration_date: string;
  comments?: string;
  addedDate?: string;
  addedBy?: string;
}

interface CaseNote {
  id: string;
  date: string;
  author: string;
  note: string;
  noteType: "General" | "Permanent Resident";
}

interface EmployeeProfileProps {
  employee: VisaCase;
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: (id: string) => void;
  currentUser?: import("../../utils/roles").User;
}

export function EmployeeProfile({ employee, onBack, onEdit, onDelete }: EmployeeProfileProps) {
  const [fullEmployeeData, setFullEmployeeData] = useState<Employee | null>(null);
  const [notes, setNotes] = useState<CaseNote[]>([
   
  ]);

  const [showNoteInput, setShowNoteInput] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [newNoteType, setNewNoteType] = useState<"General" | "Permanent Resident">("General");
  const [noteFilter, setNoteFilter] = useState<"All" | "General" | "Permanent Resident">("All");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState("");
  const [editNoteType, setEditNoteType] = useState<"General" | "Permanent Resident">("General");
  const [showAddVisaDialog, setShowAddVisaDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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

  // Visa history state - fetched from backend
  const [visaHistory, setVisaHistory] = useState<VisaHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  // Fetch visa history from backend
  useEffect(() => {
    const loadVisaHistory = async () => {
      try {
        setIsLoadingHistory(true);
        console.log('📋 Fetching visa history for employee:', employee.id);
        const history = await fetchVisaHistory(parseInt(employee.id));
        
        // Convert API format to component format
        const formattedHistory: VisaHistory[] = history.map(record => ({
          id: record.id.toString(),
          visa_type: record.visa_type,
          status: record.status as "Active" | "Expired" | "Processing",
          start_date : record.start_date,
          expiration_date: record.expiration_date,
          comments: record.comments,
          addedDate: record.added_at,
          addedBy: record.added_by,
        }));
        
        console.log('✅ Loaded visa history:', formattedHistory.length, 'records');
        setVisaHistory(formattedHistory);
      } catch (error) {
        console.error("❌ Error loading visa history:", error);
        // Set empty array on error
        setVisaHistory([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    
    loadVisaHistory();
  }, [employee.id]);

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
        noteType: newNoteType,
      };
      setNotes([note, ...notes]);
      setNewNote("");
      setNewNoteType("General");
      setShowNoteInput(false);
      toast.success("Note added successfully");
    }
  };

  const handleEditNote = (noteId: string) => {
    const noteToEdit = notes.find(n => n.id === noteId);
    if (noteToEdit) {
      setEditingNoteId(noteId);
      setEditNoteText(noteToEdit.note);
      setEditNoteType(noteToEdit.noteType);
    }
  };

  const handleSaveEdit = () => {
    if (editNoteText.trim() && editingNoteId) {
      setNotes(notes.map(note => 
        note.id === editingNoteId 
          ? { ...note, note: editNoteText, noteType: editNoteType }
          : note
      ));
      setEditingNoteId(null);
      setEditNoteText("");
      setEditNoteType("General");
      toast.success("Note updated successfully");
    }
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditNoteText("");
    setEditNoteType("General");
  };

  const handleDeleteNote = (noteId: string) => {
    const noteToDelete = notes.find(n => n.id === noteId);
    if (noteToDelete && confirm(`Are you sure you want to delete this ${noteToDelete.noteType.toLowerCase()} note?`)) {
      setNotes(notes.filter(note => note.id !== noteId));
      toast.success("Note deleted successfully");
    }
  };

  const handleSaveVisa = async (visaData: VisaHistoryRecord) => {
    try {
      console.log('💾 Saving new visa history record:', visaData);
      
      // Call backend API to save visa history
      const result = await addVisaHistory(parseInt(employee.id), {
        visa_type: visaData.visa_type,
        status: visaData.status,
        start_date: visaData.start_date ,
        expiration_date: visaData.expiration_date,
        comments: visaData.comments || '',
        added_by: visaData.addedBy,
        is_current: false, // You can make this configurable if needed
      });
      
      if (result.success && result.visa_history) {
        // Convert API response to component format
        const newVisaHistory: VisaHistory = {
          id: result.visa_history.id.toString(),
          visa_type: result.visa_history.visa_type,
          status: result.visa_history.status as "Active" | "Expired" | "Processing",
          start_date : result.visa_history.start_date,
          expiration_date: result.visa_history.expiration_date,
          comments: result.visa_history.comments,
          addedDate: result.visa_history.added_at,
          addedBy: result.visa_history.added_by,
        };
        
        // Add to beginning of visa history (most recent first)
        setVisaHistory([newVisaHistory, ...visaHistory]);
        
        console.log('✅ Visa history record saved successfully');
        
        // Show success toast
        toast.success("Visa record added successfully!", {
          description: `${visaData.visa_type} visa has been added to history`,
        });
      } else {
        throw new Error(result.error || 'Failed to save visa history');
      }
    } catch (error) {
      console.error("❌ Error saving visa history:", error);
      
      // Show error toast
      toast.error("Failed to save visa record", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    }
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
    jobTitle: fullEmployeeData?.employee_title || "Software Engineer",
    start_date : fullEmployeeData?.start_date  || "2022-01-15",
    manager: fullEmployeeData?.department_advisor || "Dr. Robert Smith",
    phone: fullEmployeeData?.phone || "+1 (410) 555-0123",
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(employee.id);  // <-- Pass the ID as required
    }
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
          {fullEmployeeData && fullEmployeeData.number_of_dependents > 0 && (
            <p className="text-sm text-[#6B7280] mt-1 flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {fullEmployeeData.number_of_dependents} {fullEmployeeData.number_of_dependents === 1 ? 'Dependent' : 'Dependents'}
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
          <Button
              variant="outline"
              size="sm"
              className="border-[#D86464] text-[#D86464] hover:bg-[#D86464]/10"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
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
                    Transitioning from {employee.visa_type} to{" "}
                    <span className="font-medium text-black">
                      {fullEmployeeData.pendingVisaApplication.targetvisa_type}
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className={`text-sm mt-1 font-medium ${isMissingDate(fullEmployeeData.pendingVisaApplication.applicationDate) ? 'text-[#D86464]' : 'text-black'}`}>
                        {formatDate(fullEmployeeData.pendingVisaApplication.applicationDate)}
                      </p>
                    </TooltipTrigger>
                    {isMissingDate(fullEmployeeData.pendingVisaApplication.applicationDate) && (
                      <TooltipContent>
                        <p>{getMissingDateTooltip()}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </div>
                {fullEmployeeData.pendingVisaApplication.expectedDecisionDate && (
                  <div>
                    <label className="text-xs text-[#6B7280]">Expected Decision</label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className={`text-sm mt-1 font-medium ${isMissingDate(fullEmployeeData.pendingVisaApplication.expectedDecisionDate) ? 'text-[#D86464]' : 'text-black'}`}>
                          {formatDate(fullEmployeeData.pendingVisaApplication.expectedDecisionDate)}
                        </p>
                      </TooltipTrigger>
                      {isMissingDate(fullEmployeeData.pendingVisaApplication.expectedDecisionDate) && (
                        <TooltipContent>
                          <p>{getMissingDateTooltip()}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </div>
                )}
                <div>
                  <label className="text-xs text-[#6B7280]">Filed By</label>
                  <p className="text-sm text-black mt-1 font-medium">
                    {fullEmployeeData.pendingVisaApplication.filed_by}
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
                {fullEmployeeData?.personal_email && (
                  <div>
                    <label className="text-sm text-[#6B7280]">Personal Email</label>
                    <p className="text-black mt-1 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-[#6B7280]" />
                      {fullEmployeeData.personal_email}
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
                {fullEmployeeData?.country_of_birth && (
                  <div>
                    <label className="text-sm text-[#6B7280]">Country of Birth</label>
                    <p className="text-black mt-1 flex items-center">
                      <Globe className="h-4 w-4 mr-2 text-[#6B7280]" />
                      {fullEmployeeData.country_of_birth}
                    </p>
                  </div>
                )}
                {fullEmployeeData?.nationality && (
                  <div>
                    <label className="text-sm text-[#6B7280]">Nationality</label>
                    <p className="text-black mt-1">{fullEmployeeData.nationality}</p>
                  </div>
                )}
                {fullEmployeeData?.citizenship && fullEmployeeData.citizenship.length > 0 && (
                  <div>
                    <label className="text-sm text-[#6B7280]">Citizenship(s)</label>
                    <p className="text-black mt-1">{fullEmployeeData.citizenship.join(", ")}</p>
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
                {fullEmployeeData?.department_admin && (
                  <div>
                    <label className="text-sm text-[#6B7280]">Department Admin</label>
                    <p className="text-black mt-1">{fullEmployeeData.department_admin}</p>
                  </div>
                )}
                {fullEmployeeData?.department_advisor && (
                  <div>
                    <label className="text-sm text-[#6B7280]">Department Advisor / PI / Chair</label>
                    <p className="text-black mt-1">{fullEmployeeData.department_advisor}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm text-[#6B7280]">Start Date</label>
                  <p className="text-black mt-1 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-[#6B7280]" />
                    {employeeDetails.start_date }
                  </p>
                </div>
                {fullEmployeeData?.annual_salary && (
                  <div>
                    <label className="text-sm text-[#6B7280]">Annual Salary</label>
                    <p className="text-black mt-1 flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 text-[#6B7280]" />
                      ${fullEmployeeData.annual_salary.toLocaleString()}
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
                    <p className="text-black mt-1 font-medium">{employee.visa_type}</p>
                  </div>
                  <div>
                    <label className="text-sm text-[#6B7280]">Filed By</label>
                    <p className="text-black mt-1">{fullEmployeeData?.filed_by || employee.filed_by}</p>
                  </div>
                  {/* {fullEmployeeData?.case_type && (
                    // <div>
                    //   <label className="text-sm text-[#6B7280]">Case Type</label>
                    //   <p className="text-black mt-1">{fullEmployeeData.case_type}</p>
                    // </div>
                  )} */}
                  <div>
                    <label className="text-sm text-[#6B7280]">Start Date</label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className={`text-black mt-1 ${isMissingDate(employee.visa_start_date) ? 'text-[#D86464] font-medium' : ''}`}>
                          {formatDateWithFallback(employee.visa_start_date)}
                        </p>
                      </TooltipTrigger>
                      {isMissingDate(employee.visa_start_date) && (
                        <TooltipContent>
                          <p>{getMissingDateTooltip()}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </div>
                  <div>
                    <label className="text-sm text-[#6B7280]">Expiration Date</label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className={`text-black mt-1 ${isMissingDate(employee.expiration_date) ? 'text-[#D86464] font-medium' : ''}`}>
                          {formatDateWithFallback(employee.expiration_date)}
                        </p>
                      </TooltipTrigger>
                      {isMissingDate(employee.expiration_date) && (
                        <TooltipContent>
                          <p>{getMissingDateTooltip()}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </div>
                  {fullEmployeeData?.initial_h1b_start_date && (
                    <div>
                      <label className="text-sm text-[#6B7280]">Initial H-1B Start Date</label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className={`text-black mt-1 ${isMissingDate(fullEmployeeData.initial_h1b_start_date) ? 'text-[#D86464] font-medium' : ''}`}>
                            {formatDateWithFallback(fullEmployeeData.initial_h1b_start_date)}
                          </p>
                        </TooltipTrigger>
                        {isMissingDate(fullEmployeeData.initial_h1b_start_date) && (
                          <TooltipContent>
                            <p>{getMissingDateTooltip()}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </div>
                  )}
                  {fullEmployeeData?.prep_extension_date && (
                    <div>
                      <label className="text-sm text-[#6B7280] flex items-center gap-1">
                        Prep Extension Date
                        <HelpTooltip text="Reminder date for when to begin preparing visa extension" />
                      </label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <p className={`text-black mt-1 ${isMissingDate(fullEmployeeData.prep_extension_date) ? 'text-[#D86464] font-medium' : ''}`}>
                            {formatDateWithFallback(fullEmployeeData.prep_extension_date)}
                          </p>
                        </TooltipTrigger>
                        {isMissingDate(fullEmployeeData.prep_extension_date) && (
                          <TooltipContent>
                            <p>{getMissingDateTooltip()}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </div>
                  )}
                  {fullEmployeeData?.max_h_period && (
                    <div>
                      <label className="text-sm text-[#6B7280] flex items-center gap-1">
                        Max H Period End Date
                        <HelpTooltip text="The maximum period end date for H-1B visa" />
                      </label>
                      <p className="text-black mt-1">{fullEmployeeData.max_h_period}</p>
                    </div>
                  )}
                  {fullEmployeeData?.i94_number && (
                    <div>
                      <label className="text-sm text-[#6B7280] flex items-center gap-1">
                        I-94 Number
                        <HelpTooltip text="The I-94 Arrival/Departure Record number" />
                      </label>
                      <p className="text-black mt-1">{fullEmployeeData.i94_number}</p>
                    </div>
                  )}
                  {fullEmployeeData?.i94_expiry_date && (
                    <div>
                      <label className="text-sm text-[#6B7280] flex items-center gap-1">
                        I-94 Expiry Date
                        <HelpTooltip text="The expiration date shown on the I-94 record" />
                      </label>
                      <p className="text-black mt-1">{fullEmployeeData.i94_expiry_date}</p>
                    </div>
                  )}
                  {fullEmployeeData?.sevis_id&& (
                    <div>
                      <label className="text-sm text-[#6B7280]">SEVIS ID</label>
                      <p className="text-black mt-1">{fullEmployeeData.sevis_id}</p>
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
                  {isLoadingHistory ? (
                    <div className="text-center py-8 text-[#6B7280]">
                      <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Loading visa history...</p>
                    </div>
                  ) : visaHistory.length === 0 ? (
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
                              <h3 className="font-medium text-black">{visa.visa_type}</h3>
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
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className={`mt-1 ${isMissingDate(visa.start_date ) ? 'text-[#D86464] font-medium' : 'text-black'}`}>
                                    {formatDateWithFallback(visa.start_date , "— Missing —")}
                                  </p>
                                </TooltipTrigger>
                                {isMissingDate(visa.start_date ) && (
                                  <TooltipContent>
                                    <p>{getMissingDateTooltip()}</p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </div>
                            <div>
                              <label className="text-[#6B7280]">Expiration Date</label>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className={`mt-1 ${isMissingDate(visa.expiration_date) ? 'text-[#D86464] font-medium' : 'text-black'}`}>
                                    {formatDateWithFallback(visa.expiration_date, "— Missing —")}
                                  </p>
                                </TooltipTrigger>
                                {isMissingDate(visa.expiration_date) && (
                                  <TooltipContent>
                                    <p>{getMissingDateTooltip()}</p>
                                  </TooltipContent>
                                )}
                              </Tooltip>
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
      {(fullEmployeeData?.highest_education || fullEmployeeData?.field_of_study) && (
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
                  {fullEmployeeData.highest_education && (
                    <div>
                      <label className="text-sm text-[#6B7280]">Highest Educational Level</label>
                      <p className="text-black mt-1">{fullEmployeeData.highest_education}</p>
                    </div>
                  )}
                  {fullEmployeeData.field_of_study && (
                    <div>
                      <label className="text-sm text-[#6B7280]">Field of Study</label>
                      <p className="text-black mt-1">{fullEmployeeData.field_of_study}</p>
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      {/* Administrative Fields Section */}
      {(fullEmployeeData?.soc_code|| fullEmployeeData?.soc_code_description|| fullEmployeeData?.general_notes) && (
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
                  {fullEmployeeData.soc_code && (
                    <div>
                      <label className="text-sm text-[#6B7280] flex items-center gap-1">
                        SOC Code
                        <HelpTooltip text="Standard Occupational Classification code for USCIS reporting" />
                      </label>
                      <p className="text-black mt-1">{fullEmployeeData.soc_code}</p>
                    </div>
                  )}
                  {fullEmployeeData.soc_code_description  && (
                    <div>
                      <label className="text-sm text-[#6B7280]">SOC Code Description</label>
                      <p className="text-black mt-1">{fullEmployeeData.soc_code_description }</p>
                    </div>
                  )}
                  {fullEmployeeData.general_notes&& (
                    <div className="md:col-span-2">
                      <label className="text-sm text-[#6B7280]">General Notes</label>
                      <p className="text-black mt-1">{fullEmployeeData.general_notes}</p>
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
      {fullEmployeeData && fullEmployeeData.salary_history && fullEmployeeData.salary_history.length > 0 && (
        <Card className="p-6 border border-[#E5E7EB]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-black flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-[#FFCC00]" />
              Salary Progression
            </h2>
            <div className="text-right">
              <p className="text-sm text-[#6B7280]">Current Salary</p>
              <p className="text-xl font-semibold text-black">
                ${fullEmployeeData.salary_history[fullEmployeeData.salary_history.length - 1].amount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {fullEmployeeData.salary_history
              .slice()
              .reverse()
              .map((record, index) => {
                const isLatest = index === 0;
                const previousSalary = index < fullEmployeeData.salary_history.length - 1 
                  ? fullEmployeeData.salary_history[fullEmployeeData.salary_history.length - 1 - index - 1].amount 
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
          {fullEmployeeData.salary_history.length > 1 && (
            <>
              <Separator className="my-6" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[#F9FAFB] rounded-lg">
                <div>
                  <label className="text-xs text-[#6B7280]">Starting Salary</label>
                  <p className="text-lg font-semibold text-black">
                    ${fullEmployeeData.salary_history[0].amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-[#6B7280]">Total Increase</label>
                  <p className="text-lg font-semibold text-[#10B981]">
                    ${(fullEmployeeData.salary_history[fullEmployeeData.salary_history.length - 1].amount - 
                       fullEmployeeData.salary_history[0].amount).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-[#6B7280]">Total Growth</label>
                  <p className="text-lg font-semibold text-[#10B981]">
                    {(((fullEmployeeData.salary_history[fullEmployeeData.salary_history.length - 1].amount - 
                        fullEmployeeData.salary_history[0].amount) / 
                       fullEmployeeData.salary_history[0].amount) * 100).toFixed(1)}%
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
        <Button
            size="sm"
            className="bg-[#FFCC00] text-black hover:bg-[#FFCC00]/90"
            onClick={() => setShowNoteInput(!showNoteInput)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Note
          </Button>
          <h2 className="text-lg font-semibold text-black">Case Notes</h2>
          <div className="flex items-center gap-2">
            <Button
              variant={noteFilter === "All" ? "default" : "outline"}
              size="sm"
              onClick={() => setNoteFilter("All")}
              className={noteFilter === "All" ? "bg-[#FFCC00] text-black hover:bg-[#FFCC00]/90" : ""}
            >
              All ({notes.length})
            </Button>
            <Button
              variant={noteFilter === "General" ? "default" : "outline"}
              size="sm"
              onClick={() => setNoteFilter("General")}
              className={noteFilter === "General" ? "bg-[#FFCC00] text-black hover:bg-[#FFCC00]/90" : ""}
            >
              General ({notes.filter(n => n.noteType === "General").length})
            </Button>
            <Button
              variant={noteFilter === "Permanent Resident" ? "default" : "outline"}
              size="sm"
              onClick={() => setNoteFilter("Permanent Resident")}
              className={noteFilter === "Permanent Resident" ? "bg-[#FFCC00] text-black hover:bg-[#FFCC00]/90" : ""}
            >
              PR ({notes.filter(n => n.noteType === "Permanent Resident").length})
            </Button>
          </div>
        </div>

        {/* Add Note Input */}
        {showNoteInput && (
          <div className="mb-4 p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
            <div className="mb-3">
              <Label className="text-sm text-[#6B7280] mb-2 block">Note Type</Label>
              <RadioGroup
                value={newNoteType}
                onValueChange={(value) => setNewNoteType(value as "General" | "Permanent Resident")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="General" id="type-general" />
                  <Label htmlFor="type-general" className="cursor-pointer">General Note</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Permanent Resident" id="type-pr" />
                  <Label htmlFor="type-pr" className="cursor-pointer">Permanent Resident Note</Label>
                </div>
              </RadioGroup>
            </div>
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
                  setNewNoteType("General");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Notes List */}
        <div className="space-y-4">
          {notes
            .filter(note => noteFilter === "All" || note.noteType === noteFilter)
            .map((note, index) => (
            <div key={note.id}>
              {index > 0 && <Separator className="my-4" />}
              {editingNoteId === note.id ? (
                // Edit Mode
                <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                  <div className="mb-3">
                    <Label className="text-sm text-[#6B7280] mb-2 block">Note Type</Label>
                    <RadioGroup
                      value={editNoteType}
                      onValueChange={(value) => setEditNoteType(value as "General" | "Permanent Resident")}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="General" id="edit-type-general" />
                        <Label htmlFor="edit-type-general" className="cursor-pointer">General Note</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Permanent Resident" id="edit-type-pr" />
                        <Label htmlFor="edit-type-pr" className="cursor-pointer">Permanent Resident Note</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <Textarea
                    value={editNoteText}
                    onChange={(e) => setEditNoteText(e.target.value)}
                    className="mb-2 bg-white"
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-[#FFCC00] text-black hover:bg-[#FFCC00]/90"
                      onClick={handleSaveEdit}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="space-y-2 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-black">{note.author}</span>
                      <Badge 
                        variant={note.noteType === "Permanent Resident" ? "default" : "secondary"}
                        className={note.noteType === "Permanent Resident" ? "bg-blue-500" : ""}
                      >
                        {note.noteType === "Permanent Resident" ? "PR" : "General"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#6B7280]">{note.date}</span>
                      <div className="flex items-center gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditNote(note.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit className="h-4 w-4 text-[#6B7280] hover:text-black" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit note</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteNote(note.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete note</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-[#374151]">{note.note}</p>
                </div>
              )}
            </div>
          ))}
          {notes.filter(note => noteFilter === "All" || note.noteType === noteFilter).length === 0 && (
            <div className="text-center py-8 text-[#6B7280]">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No {noteFilter !== "All" ? noteFilter.toLowerCase() : ""} notes yet</p>
              <p className="text-sm mt-1">Click "Add Note" to create the first note</p>
            </div>
          )}
        </div>
      </Card>

      {/* Add Visa Dialog */}
      <AddVisa
        open={showAddVisaDialog}
        onClose={() => setShowAddVisaDialog(false)}
        onSave={handleSaveVisa}
        employeeName={employee.employee.name}
      />

       {/* Delete Confirmation Dialog */}
       <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Employee Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{employee.employee.name}</strong>? This action cannot be undone and will permanently remove all associated visa records, notes, and history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleDelete();
                toast.success("Employee deleted successfully!");
                setShowDeleteDialog(false);
              }}
              className="bg-[#D86464] hover:bg-[#C54545]"
            >
              Delete Employee
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>



  );
}