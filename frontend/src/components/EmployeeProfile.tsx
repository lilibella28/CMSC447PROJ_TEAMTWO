import { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { ArrowLeft, Edit, Plus, Calendar, Mail, Phone, User, Briefcase } from "lucide-react";
import { VisaCase } from "../../utils/dataService";

interface VisaHistory {
  id: string;
  visaType: string;
  status: "Active" | "Expired" | "Processing";
  startDate: string;
  expirationDate: string;
  comments?: string;
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
}

export function EmployeeProfile({ employee, onBack }: EmployeeProfileProps) {
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

  // Mock visa history - in real app, this would come from backend
  const visaHistory: VisaHistory[] = [
    {
      id: "1",
      visaType: employee.visaType,
      status: employee.status,
      startDate: "2022-01-15",
      expirationDate: employee.expirationDate,
      comments: "Current active visa",
    },
    {
      id: "2",
      visaType: "F-1",
      status: "Expired",
      startDate: "2020-08-20",
      expirationDate: "2022-01-14",
      comments: "Previous student visa - transitioned to work authorization",
    },
  ];

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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default";
      case "Expired":
        return "destructive";
      case "Processing":
        return "secondary";
      default:
        return "default";
    }
  };

  // Mock additional employee data
  const employeeDetails = {
    email: `${employee.employee.name.toLowerCase().replace(/\s+/g, ".")}@umbc.edu`,
    employeeId: `EMP-${employee.id.padStart(5, "0")}`,
    jobTitle: "Software Engineer",
    startDate: "2022-01-15",
    manager: "Dr. Robert Smith",
    phone: "+1 (410) 555-0123",
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
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit Info
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

      {/* Section 1 - Employee Information */}
      <Card className="p-6 border border-[#E5E7EB]">
        <h2 className="text-lg font-semibold text-black mb-4">Employee Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div>
            <label className="text-sm text-[#6B7280]">Full Name</label>
            <p className="text-black mt-1">{employee.employee.name}</p>
          </div>
          <div>
            <label className="text-sm text-[#6B7280]">Email Address</label>
            <p className="text-black mt-1 flex items-center">
              <Mail className="h-4 w-4 mr-2 text-[#6B7280]" />
              {employeeDetails.email}
            </p>
          </div>
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
          <div>
            <label className="text-sm text-[#6B7280]">Department</label>
            <p className="text-black mt-1 flex items-center">
              <Briefcase className="h-4 w-4 mr-2 text-[#6B7280]" />
              {employee.employee.department}
            </p>
          </div>
          <div>
            <label className="text-sm text-[#6B7280]">Job Title</label>
            <p className="text-black mt-1">{employeeDetails.jobTitle}</p>
          </div>
          <div>
            <label className="text-sm text-[#6B7280]">Start Date</label>
            <p className="text-black mt-1 flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-[#6B7280]" />
              {employeeDetails.startDate}
            </p>
          </div>
          <div>
            <label className="text-sm text-[#6B7280]">Manager</label>
            <p className="text-black mt-1 flex items-center">
              <User className="h-4 w-4 mr-2 text-[#6B7280]" />
              {employeeDetails.manager}
            </p>
          </div>
          <div>
            <label className="text-sm text-[#6B7280]">Current Status</label>
            <div className="mt-1">
              <Badge variant={getStatusVariant(employee.status)}>
                {employee.status}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Section 2 - Visa Information */}
      <Card className="p-6 border border-[#E5E7EB]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-black">Visa Information</h2>
          <Button
            variant="outline"
            size="sm"
            className="bg-[#FFCC00] text-black hover:bg-[#FFCC00]/90 border-[#FFCC00]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Visa
          </Button>
        </div>

        <div className="space-y-4">
          {visaHistory.map((visa, index) => (
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
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-[#6B7280]">Start Date</label>
                    <p className="text-black mt-1">{visa.startDate}</p>
                  </div>
                  <div>
                    <label className="text-[#6B7280]">Expiration Date</label>
                    <p className="text-black mt-1">{visa.expirationDate}</p>
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
          ))}
        </div>
      </Card>

      {/* Section 3 - Case Notes */}
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
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-black">{note.author}</span>
                    <span className="text-sm text-[#6B7280]">•</span>
                    <span className="text-sm text-[#6B7280]">{note.date}</span>
                  </div>
                </div>
                <p className="text-black">{note.note}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}