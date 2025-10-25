import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Calendar } from "./ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface AddEmployeeProps {
  onCancel: () => void;
  onSave: (employeeData: any) => void;
}

export function AddEmployee({ onCancel, onSave }: AddEmployeeProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    jobTitle: "",
    visaType: "",
    status: "",
    notes: "",
  });
  const [expirationDate, setExpirationDate] = useState<Date>();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.department) {
      newErrors.department = "Department is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const employeeData = {
        ...formData,
        expirationDate: expirationDate ? format(expirationDate, "yyyy-MM-dd") : null,
      };
      onSave(employeeData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="mb-2">
        <p className="text-sm text-[#6B7280]">
          Dashboard / Employees / Add Employee
        </p>
      </div>

      {/* Page Title */}
      <h1 className="text-2xl text-black">Add New Employee</h1>

      {/* Form Container */}
      <div className="max-w-[960px] bg-white rounded-xl border border-[#E5E7EB] p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Two-column grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-black">
                  First Name <span className="text-[#EF4444]">*</span>
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className={`h-11 rounded-lg border-2 bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20 ${
                    errors.firstName ? 'border-[#EF4444]' : 'border-[#E5E7EB]'
                  }`}
                />
                {errors.firstName && (
                  <p className="text-sm text-[#EF4444]">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-black">
                  Last Name <span className="text-[#EF4444]">*</span>
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className={`h-11 rounded-lg border-2 bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20 ${
                    errors.lastName ? 'border-[#EF4444]' : 'border-[#E5E7EB]'
                  }`}
                />
                {errors.lastName && (
                  <p className="text-sm text-[#EF4444]">{errors.lastName}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-black">
                  Email <span className="text-[#EF4444]">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@umbc.edu"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`h-11 rounded-lg border-2 bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20 ${
                    errors.email ? 'border-[#EF4444]' : 'border-[#E5E7EB]'
                  }`}
                />
                {errors.email && (
                  <p className="text-sm text-[#EF4444]">{errors.email}</p>
                )}
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department" className="text-black">
                  Department <span className="text-[#EF4444]">*</span>
                </Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleInputChange("department", value)}
                >
                  <SelectTrigger
                    className={`h-11 rounded-lg border-2 bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20 ${
                      errors.department ? 'border-[#EF4444]' : 'border-[#E5E7EB]'
                    }`}
                  >
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">Engineering</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="HR">HR</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                  </SelectContent>
                </Select>
                {errors.department && (
                  <p className="text-sm text-[#EF4444]">{errors.department}</p>
                )}
              </div>

              {/* Job Title */}
              <div className="space-y-2">
                <Label htmlFor="jobTitle" className="text-black">
                  Job Title
                </Label>
                <Input
                  id="jobTitle"
                  type="text"
                  placeholder="Enter job title"
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                  className="h-11 rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20"
                />
              </div>

              {/* Visa Type */}
              <div className="space-y-2">
                <Label htmlFor="visaType" className="text-black">
                  Visa Type
                </Label>
                <Select
                  value={formData.visaType}
                  onValueChange={(value) => handleInputChange("visaType", value)}
                >
                  <SelectTrigger className="h-11 rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20">
                    <SelectValue placeholder="Select visa type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="F-1">F-1</SelectItem>
                    <SelectItem value="OPT">OPT</SelectItem>
                    <SelectItem value="OPT STEM">OPT STEM</SelectItem>
                    <SelectItem value="H-1B">H-1B</SelectItem>
                    <SelectItem value="Permanent Resident">Permanent Resident</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Visa Expiration */}
              <div className="space-y-2">
                <Label htmlFor="visaExpiration" className="text-black">
                  Visa Expiration
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full h-11 justify-start text-left rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] hover:bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20 ${
                        !expirationDate && "text-[#9CA3AF]"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expirationDate ? (
                        format(expirationDate, "MM/dd/yyyy")
                      ) : (
                        <span>MM/DD/YYYY</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={expirationDate}
                      onSelect={setExpirationDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status" className="text-black">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger className="h-11 rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes - Full width */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-black">
                Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Add internal notes (optional)"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="min-h-[120px] rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20"
              />
            </div>

            {/* Form Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="h-12 px-6 rounded-lg border-2 border-[#D1D5DB] bg-white text-black hover:bg-[#F9FAFB]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-12 px-6 rounded-lg bg-[#FFCC00] text-black hover:bg-[#FFCC00]/90"
              >
                Save Employee
              </Button>
            </div>
          </form>
        </div>
    </div>
  );
}
