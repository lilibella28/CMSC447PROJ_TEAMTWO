import { useState, useEffect } from "react";
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
import { CalendarIcon, ChevronDown, ChevronUp, HelpCircle, ArrowLeft, Save } from "lucide-react";
import { format } from "date-fns";
import { VisaCase, Employee, fetchEmployeeById, updateEmployee } from "../../utils/dataService";
import { Card } from "./ui/card";
import { toast } from "sonner";

interface EditEmployeeProps {
  employee: VisaCase;
  onCancel: () => void;
  onSave: () => void;
}

export function EditEmployee({ employee, onCancel, onSave }: EditEmployeeProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [fullEmployeeData, setFullEmployeeData] = useState<Employee | null>(null);

  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "", // UMBC Email
    personalEmail: "",
    gender: "",
    countryOfBirth: "",
    citizenships: "",
    phone: "",
    address: "",
    nationality: "",
    dateOfBirth: "",
    passportNumber: "",
    // Employment Information
    department: "",
    employeeTitle: "",
    departmentAdmin: "",
    departmentAdvisor: "",
    annualSalary: "",
    // Visa & Immigration
    visaType: "",
    status: "",
    filedBy: "",
    caseType: "",
    i94Number: "",
    sevisId: "",
    // Permanent Residency
    prFilingDate: "",
    prStatus: "",
    prNotes: "",
    // Education
    highestEducation: "",
    fieldOfStudy: "",
    // Administrative
    socCode: "",
    socCodeDescription: "",
    generalNotes: "",
    // Dependents
    numberOfDependents: "0",
  });

  const [dates, setDates] = useState({
    expirationDate: undefined as Date | undefined,
    visaStartDate: undefined as Date | undefined,
    initialH1BStartDate: undefined as Date | undefined,
    prepExtensionDate: undefined as Date | undefined,
    maxHPeriod: undefined as Date | undefined,
    i94ExpiryDate: undefined as Date | undefined,
    prFilingDate: undefined as Date | undefined,
  });

  const [openSections, setOpenSections] = useState({
    personal: true,
    employment: true,
    visa: true,
    education: true,
    administrative: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load employee data on mount
  useEffect(() => {
    const loadEmployeeData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchEmployeeById(employee.id);
        setFullEmployeeData(data);

        // Populate form with existing data
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          personalEmail: data.personalEmail || "",
          gender: data.gender || "",
          countryOfBirth: data.countryOfBirth || "",
          citizenships: data.citizenships?.join(", ") || "",
          phone: data.phone || "",
          address: data.address || "",
          nationality: data.nationality || "",
          dateOfBirth: data.dateOfBirth || "",
          passportNumber: data.passportNumber || "",
          department: data.department || "",
          employeeTitle: data.employeeTitle || "",
          departmentAdmin: data.departmentAdmin || "",
          departmentAdvisor: data.departmentAdvisor || "",
          annualSalary: data.annualSalary?.toString() || "",
          visaType: data.visaType || "",
          status: data.status || "",
          filedBy: data.visaFiledBy || "",
          caseType: data.caseType || "",
          i94Number: data.i94Number || "",
          sevisId: data.sevisId || "",
          prFilingDate: data.permanentResidency?.filingDate || "",
          prStatus: data.permanentResidency?.currentStatus || "",
          prNotes: data.permanentResidency?.notes || "",
          highestEducation: data.highestEducation || "",
          fieldOfStudy: data.fieldOfStudy || "",
          socCode: data.socCode || "",
          socCodeDescription: data.socCodeDescription || "",
          generalNotes: data.generalNotes || "",
          numberOfDependents: data.dependents?.toString() || "0",
        });

        // Populate dates
        setDates({
          expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
          visaStartDate: data.visaStartDate ? new Date(data.visaStartDate) : undefined,
          initialH1BStartDate: data.initialH1BStartDate ? new Date(data.initialH1BStartDate) : undefined,
          prepExtensionDate: data.prepExtensionDate ? new Date(data.prepExtensionDate) : undefined,
          maxHPeriod: data.maxHPeriod ? new Date(data.maxHPeriod) : undefined,
          i94ExpiryDate: data.i94ExpiryDate ? new Date(data.i94ExpiryDate) : undefined,
          prFilingDate: data.permanentResidency?.filingDate ? new Date(data.permanentResidency.filingDate) : undefined,
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading employee data:", error);
        toast.error("Failed to load employee data");
        setIsLoading(false);
      }
    };
    loadEmployeeData();
  }, [employee.id]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleDateChange = (field: keyof typeof dates, value: Date | undefined) => {
    setDates((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "UMBC email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.department) {
      newErrors.department = "Department is required";
    }
    if (!formData.visaType) {
      newErrors.visaType = "Visa type is required";
    }
    if (!dates.expirationDate) {
      newErrors.expirationDate = "Expiration date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        setIsSaving(true);
        
        const updatedData: Partial<Employee> = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          employeeName: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          personalEmail: formData.personalEmail || undefined,
          gender: formData.gender || undefined,
          countryOfBirth: formData.countryOfBirth || undefined,
          citizenships: formData.citizenships ? formData.citizenships.split(",").map(c => c.trim()) : [],
          phone: formData.phone,
          address: formData.address,
          nationality: formData.nationality,
          dateOfBirth: formData.dateOfBirth,
          passportNumber: formData.passportNumber,
          department: formData.department,
          employeeTitle: formData.employeeTitle || undefined,
          departmentAdmin: formData.departmentAdmin || undefined,
          departmentAdvisor: formData.departmentAdvisor || undefined,
          annualSalary: formData.annualSalary ? parseFloat(formData.annualSalary) : undefined,
          visaType: formData.visaType,
          status: formData.status as any,
          visaFiledBy: formData.filedBy as any,
          caseType: formData.caseType || undefined,
          i94Number: formData.i94Number,
          sevisId: formData.sevisId,
          expirationDate: dates.expirationDate ? format(dates.expirationDate, "yyyy-MM-dd") : "",
          visaStartDate: dates.visaStartDate ? format(dates.visaStartDate, "yyyy-MM-dd") : "",
          initialH1BStartDate: dates.initialH1BStartDate ? format(dates.initialH1BStartDate, "yyyy-MM-dd") : undefined,
          prepExtensionDate: dates.prepExtensionDate ? format(dates.prepExtensionDate, "yyyy-MM-dd") : undefined,
          maxHPeriod: dates.maxHPeriod ? format(dates.maxHPeriod, "yyyy-MM-dd") : undefined,
          i94ExpiryDate: dates.i94ExpiryDate ? format(dates.i94ExpiryDate, "yyyy-MM-dd") : undefined,
          permanentResidency: {
            filingDate: dates.prFilingDate ? format(dates.prFilingDate, "yyyy-MM-dd") : undefined,
            currentStatus: formData.prStatus as any || undefined,
            notes: formData.prNotes || undefined,
          },
          highestEducation: formData.highestEducation as any || undefined,
          fieldOfStudy: formData.fieldOfStudy || undefined,
          socCode: formData.socCode || undefined,
          socCodeDescription: formData.socCodeDescription || undefined,
          generalNotes: formData.generalNotes || undefined,
          dependents: parseInt(formData.numberOfDependents) || 0,
        };

        await updateEmployee(employee.id, updatedData);
        toast.success("Employee information updated successfully!");
        onSave();
      } catch (error) {
        console.error("Error updating employee:", error);
        toast.error("Failed to update employee information");
      } finally {
        setIsSaving(false);
      }
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] p-6">
        <div className="max-w-7xl mx-auto">
          <Card className="border-[#E5E5E5] p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B8DEF]"></div>
              <p className="text-[#6B7280]">Loading employee data...</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={onCancel}
              className="text-[#5B8DEF] hover:text-[#4A7DD8] hover:bg-[#E9F2FF]"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-[#1E1E1E]">Edit Employee</h1>
              <p className="text-sm text-[#6B7280] mt-1">
                Update employee information and visa details
              </p>
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-[#000000] text-[#FFFFFF] hover:bg-[#1E1E1E]"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Personal Information Section */}
            <Card className="border-[#E5E5E5]">
              <Collapsible
                open={openSections.personal}
                onOpenChange={() => toggleSection("personal")}
              >
                <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors">
                  <h2 className="text-[#1E1E1E]">Personal Information</h2>
                  {openSections.personal ? (
                    <ChevronUp className="h-5 w-5 text-[#6B7280]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[#6B7280]" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* First Name */}
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-[#1E1E1E]">
                          First Name <span className="text-[#DC2626]">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          className={`border-[#E5E5E5] ${errors.firstName ? "border-[#DC2626]" : ""}`}
                          placeholder="Enter first name"
                        />
                        {errors.firstName && (
                          <p className="text-sm text-[#DC2626]">{errors.firstName}</p>
                        )}
                      </div>

                      {/* Last Name */}
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-[#1E1E1E]">
                          Last Name <span className="text-[#DC2626]">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          className={`border-[#E5E5E5] ${errors.lastName ? "border-[#DC2626]" : ""}`}
                          placeholder="Enter last name"
                        />
                        {errors.lastName && (
                          <p className="text-sm text-[#DC2626]">{errors.lastName}</p>
                        )}
                      </div>

                      {/* UMBC Email */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-[#1E1E1E]">
                          UMBC Email <span className="text-[#DC2626]">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className={`border-[#E5E5E5] ${errors.email ? "border-[#DC2626]" : ""}`}
                          placeholder="email@umbc.edu"
                        />
                        {errors.email && (
                          <p className="text-sm text-[#DC2626]">{errors.email}</p>
                        )}
                      </div>

                      {/* Personal Email */}
                      <div className="space-y-2">
                        <Label htmlFor="personalEmail" className="text-[#1E1E1E]">
                          Personal Email
                        </Label>
                        <Input
                          id="personalEmail"
                          type="email"
                          value={formData.personalEmail}
                          onChange={(e) => handleInputChange("personalEmail", e.target.value)}
                          className="border-[#E5E5E5]"
                          placeholder="personal@example.com"
                        />
                      </div>

                      {/* Phone */}
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-[#1E1E1E]">Phone Number</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="border-[#E5E5E5]"
                          placeholder="(123) 456-7890"
                        />
                      </div>

                      {/* Gender */}
                      <div className="space-y-2">
                        <Label htmlFor="gender" className="text-[#1E1E1E]">Gender</Label>
                        <Select
                          value={formData.gender}
                          onValueChange={(value) => handleInputChange("gender", value)}
                        >
                          <SelectTrigger className="border-[#E5E5E5]">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Non-binary">Non-binary</SelectItem>
                            <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Date of Birth */}
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth" className="text-[#1E1E1E]">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                          className="border-[#E5E5E5]"
                        />
                      </div>

                      {/* Nationality */}
                      <div className="space-y-2">
                        <Label htmlFor="nationality" className="text-[#1E1E1E]">Nationality</Label>
                        <Input
                          id="nationality"
                          value={formData.nationality}
                          onChange={(e) => handleInputChange("nationality", e.target.value)}
                          className="border-[#E5E5E5]"
                          placeholder="e.g., Indian, Chinese"
                        />
                      </div>

                      {/* Country of Birth */}
                      <div className="space-y-2">
                        <Label htmlFor="countryOfBirth" className="text-[#1E1E1E]">
                          Country of Birth
                        </Label>
                        <Input
                          id="countryOfBirth"
                          value={formData.countryOfBirth}
                          onChange={(e) => handleInputChange("countryOfBirth", e.target.value)}
                          className="border-[#E5E5E5]"
                          placeholder="Enter country"
                        />
                      </div>

                      {/* Citizenships */}
                      <div className="space-y-2">
                        <Label htmlFor="citizenships" className="text-[#1E1E1E]">
                          Citizenship(s)
                        </Label>
                        <Input
                          id="citizenships"
                          value={formData.citizenships}
                          onChange={(e) => handleInputChange("citizenships", e.target.value)}
                          className="border-[#E5E5E5]"
                          placeholder="e.g., India, Canada (comma separated)"
                        />
                      </div>

                      {/* Passport Number */}
                      <div className="space-y-2">
                        <Label htmlFor="passportNumber" className="text-[#1E1E1E]">
                          Passport Number
                        </Label>
                        <Input
                          id="passportNumber"
                          value={formData.passportNumber}
                          onChange={(e) => handleInputChange("passportNumber", e.target.value)}
                          className="border-[#E5E5E5]"
                          placeholder="Enter passport number"
                        />
                      </div>

                      {/* Address - Full Width */}
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="address" className="text-[#1E1E1E]">Address</Label>
                        <Textarea
                          id="address"
                          value={formData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                          className="border-[#E5E5E5]"
                          placeholder="Enter full address"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Employment Information Section */}
            <Card className="border-[#E5E5E5]">
              <Collapsible
                open={openSections.employment}
                onOpenChange={() => toggleSection("employment")}
              >
                <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors">
                  <h2 className="text-[#1E1E1E]">Employment Information</h2>
                  {openSections.employment ? (
                    <ChevronUp className="h-5 w-5 text-[#6B7280]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[#6B7280]" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Department */}
                      <div className="space-y-2">
                        <Label htmlFor="department" className="text-[#1E1E1E]">
                          Department <span className="text-[#DC2626]">*</span>
                        </Label>
                        <Select
                          value={formData.department}
                          onValueChange={(value) => handleInputChange("department", value)}
                        >
                          <SelectTrigger className={`border-[#E5E5E5] ${errors.department ? "border-[#DC2626]" : ""}`}>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Computer Science">Computer Science</SelectItem>
                            <SelectItem value="Engineering">Engineering</SelectItem>
                            <SelectItem value="Mathematics">Mathematics</SelectItem>
                            <SelectItem value="Physics">Physics</SelectItem>
                            <SelectItem value="Chemistry">Chemistry</SelectItem>
                            <SelectItem value="Biology">Biology</SelectItem>
                            <SelectItem value="Psychology">Psychology</SelectItem>
                            <SelectItem value="Economics">Economics</SelectItem>
                            <SelectItem value="Finance">Finance</SelectItem>
                            <SelectItem value="Marketing">Marketing</SelectItem>
                            <SelectItem value="Administration">Administration</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.department && (
                          <p className="text-sm text-[#DC2626]">{errors.department}</p>
                        )}
                      </div>

                      {/* Job Title */}
                      <div className="space-y-2">
                        <Label htmlFor="employeeTitle" className="text-[#1E1E1E]">
                          Job Title / Position
                        </Label>
                        <Input
                          id="employeeTitle"
                          value={formData.employeeTitle}
                          onChange={(e) => handleInputChange("employeeTitle", e.target.value)}
                          className="border-[#E5E5E5]"
                          placeholder="e.g., Research Assistant, Professor"
                        />
                      </div>

                      {/* Department Admin */}
                      <div className="space-y-2">
                        <Label htmlFor="departmentAdmin" className="text-[#1E1E1E]">
                          Department Admin
                        </Label>
                        <Input
                          id="departmentAdmin"
                          value={formData.departmentAdmin}
                          onChange={(e) => handleInputChange("departmentAdmin", e.target.value)}
                          className="border-[#E5E5E5]"
                          placeholder="Admin name"
                        />
                      </div>

                      {/* Department Advisor / PI / Chair */}
                      <div className="space-y-2">
                        <Label htmlFor="departmentAdvisor" className="text-[#1E1E1E]">
                          Department Advisor / PI / Chair
                        </Label>
                        <Input
                          id="departmentAdvisor"
                          value={formData.departmentAdvisor}
                          onChange={(e) => handleInputChange("departmentAdvisor", e.target.value)}
                          className="border-[#E5E5E5]"
                          placeholder="Advisor name"
                        />
                      </div>

                      {/* Annual Salary */}
                      <div className="space-y-2">
                        <Label htmlFor="annualSalary" className="text-[#1E1E1E]">
                          Annual Salary
                        </Label>
                        <Input
                          id="annualSalary"
                          type="number"
                          value={formData.annualSalary}
                          onChange={(e) => handleInputChange("annualSalary", e.target.value)}
                          className="border-[#E5E5E5]"
                          placeholder="65000"
                        />
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Visa & Immigration Section */}
            <Card className="border-[#E5E5E5]">
              <Collapsible
                open={openSections.visa}
                onOpenChange={() => toggleSection("visa")}
              >
                <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors">
                  <h2 className="text-[#1E1E1E]">Visa & Immigration</h2>
                  {openSections.visa ? (
                    <ChevronUp className="h-5 w-5 text-[#6B7280]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[#6B7280]" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Visa Type */}
                      <div className="space-y-2">
                        <Label htmlFor="visaType" className="text-[#1E1E1E]">
                          Visa Type <span className="text-[#DC2626]">*</span>
                        </Label>
                        <Select
                          value={formData.visaType}
                          onValueChange={(value) => handleInputChange("visaType", value)}
                        >
                          <SelectTrigger className={`border-[#E5E5E5] ${errors.visaType ? "border-[#DC2626]" : ""}`}>
                            <SelectValue placeholder="Select visa type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="F-1">F-1</SelectItem>
                            <SelectItem value="OPT">OPT</SelectItem>
                            <SelectItem value="OPT STEM">OPT STEM</SelectItem>
                            <SelectItem value="H-1B">H-1B</SelectItem>
                            <SelectItem value="Permanent Resident">Permanent Resident</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.visaType && (
                          <p className="text-sm text-[#DC2626]">{errors.visaType}</p>
                        )}
                      </div>

                      {/* Status */}
                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-[#1E1E1E]">Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) => handleInputChange("status", value)}
                        >
                          <SelectTrigger className="border-[#E5E5E5]">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Expired">Expired</SelectItem>
                            <SelectItem value="Processing">Processing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Expiration Date */}
                      <div className="space-y-2">
                        <Label className="text-[#1E1E1E]">
                          Expiration Date <span className="text-[#DC2626]">*</span>
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`w-full justify-start text-left border-[#E5E5E5] ${
                                errors.expirationDate ? "border-[#DC2626]" : ""
                              }`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 text-[#6B7280]" />
                              {dates.expirationDate ? (
                                format(dates.expirationDate, "MMM dd, yyyy")
                              ) : (
                                <span className="text-[#9CA3AF]">Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dates.expirationDate}
                              onSelect={(date) => handleDateChange("expirationDate", date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        {errors.expirationDate && (
                          <p className="text-sm text-[#DC2626]">{errors.expirationDate}</p>
                        )}
                      </div>

                      {/* Visa Start Date */}
                      <div className="space-y-2">
                        <Label className="text-[#1E1E1E]">Visa Start Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left border-[#E5E5E5]"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 text-[#6B7280]" />
                              {dates.visaStartDate ? (
                                format(dates.visaStartDate, "MMM dd, yyyy")
                              ) : (
                                <span className="text-[#9CA3AF]">Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dates.visaStartDate}
                              onSelect={(date) => handleDateChange("visaStartDate", date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Filed By */}
                      <div className="space-y-2">
                        <Label htmlFor="filedBy" className="text-[#1E1E1E]">Filed By</Label>
                        <Select
                          value={formData.filedBy}
                          onValueChange={(value) => handleInputChange("filedBy", value)}
                        >
                          <SelectTrigger className="border-[#E5E5E5]">
                            <SelectValue placeholder="Select who filed" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Attorney">Attorney</SelectItem>
                            <SelectItem value="UMBC Administrator">UMBC Administrator</SelectItem>
                            <SelectItem value="Self-Petition">Self-Petition</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Case Type */}
                      <div className="space-y-2">
                        <Label htmlFor="caseType" className="text-[#1E1E1E]">Case Type</Label>
                        <Input
                          id="caseType"
                          value={formData.caseType}
                          onChange={(e) => handleInputChange("caseType", e.target.value)}
                          className="border-[#E5E5E5]"
                          placeholder="e.g., H-1B Extension, Initial COS"
                        />
                      </div>

                      {/* I-94 Number */}
                      <div className="space-y-2">
                        <Label htmlFor="i94Number" className="text-[#1E1E1E]">I-94 Number</Label>
                        <Input
                          id="i94Number"
                          value={formData.i94Number}
                          onChange={(e) => handleInputChange("i94Number", e.target.value)}
                          className="border-[#E5E5E5]"
                          placeholder="Enter I-94 number"
                        />
                      </div>

                      {/* I-94 Expiry Date */}
                      <div className="space-y-2">
                        <Label className="text-[#1E1E1E]">I-94 Expiry Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left border-[#E5E5E5]"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 text-[#6B7280]" />
                              {dates.i94ExpiryDate ? (
                                format(dates.i94ExpiryDate, "MMM dd, yyyy")
                              ) : (
                                <span className="text-[#9CA3AF]">Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dates.i94ExpiryDate}
                              onSelect={(date) => handleDateChange("i94ExpiryDate", date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* SEVIS ID */}
                      <div className="space-y-2">
                        <Label htmlFor="sevisId" className="text-[#1E1E1E]">SEVIS ID</Label>
                        <Input
                          id="sevisId"
                          value={formData.sevisId}
                          onChange={(e) => handleInputChange("sevisId", e.target.value)}
                          className="border-[#E5E5E5]"
                          placeholder="Enter SEVIS ID"
                        />
                      </div>

                      {/* Initial H-1B Start Date */}
                      <div className="space-y-2">
                        <Label className="text-[#1E1E1E]">Initial H-1B Start Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left border-[#E5E5E5]"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 text-[#6B7280]" />
                              {dates.initialH1BStartDate ? (
                                format(dates.initialH1BStartDate, "MMM dd, yyyy")
                              ) : (
                                <span className="text-[#9CA3AF]">Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dates.initialH1BStartDate}
                              onSelect={(date) => handleDateChange("initialH1BStartDate", date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Prep Extension Date */}
                      <div className="space-y-2">
                        <Label className="text-[#1E1E1E]">
                          Prep Extension Date
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="inline-block ml-1 h-3.5 w-3.5 text-[#6B7280] cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">Reminder date for when to prepare visa extension</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left border-[#E5E5E5]"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 text-[#6B7280]" />
                              {dates.prepExtensionDate ? (
                                format(dates.prepExtensionDate, "MMM dd, yyyy")
                              ) : (
                                <span className="text-[#9CA3AF]">Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dates.prepExtensionDate}
                              onSelect={(date) => handleDateChange("prepExtensionDate", date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Max H-1B Period */}
                      <div className="space-y-2">
                        <Label className="text-[#1E1E1E]">
                          Max H-1B Period End Date
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="inline-block ml-1 h-3.5 w-3.5 text-[#6B7280] cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">Maximum H-1B period (usually 6 years from initial start)</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left border-[#E5E5E5]"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 text-[#6B7280]" />
                              {dates.maxHPeriod ? (
                                format(dates.maxHPeriod, "MMM dd, yyyy")
                              ) : (
                                <span className="text-[#9CA3AF]">Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dates.maxHPeriod}
                              onSelect={(date) => handleDateChange("maxHPeriod", date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Number of Dependents */}
                      <div className="space-y-2">
                        <Label htmlFor="numberOfDependents" className="text-[#1E1E1E]">
                          Number of Dependents
                        </Label>
                        <Input
                          id="numberOfDependents"
                          type="number"
                          min="0"
                          value={formData.numberOfDependents}
                          onChange={(e) => handleInputChange("numberOfDependents", e.target.value)}
                          className="border-[#E5E5E5]"
                        />
                      </div>

                      {/* Permanent Residency Status */}
                      <div className="space-y-2 md:col-span-2">
                        <h3 className="text-[#1E1E1E] font-medium mb-2">Permanent Residency</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-[#1E1E1E]">PR Filing Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="w-full justify-start text-left border-[#E5E5E5]"
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4 text-[#6B7280]" />
                                  {dates.prFilingDate ? (
                                    format(dates.prFilingDate, "MMM dd, yyyy")
                                  ) : (
                                    <span className="text-[#9CA3AF]">Pick a date</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={dates.prFilingDate}
                                  onSelect={(date) => handleDateChange("prFilingDate", date)}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="prStatus" className="text-[#1E1E1E]">PR Status</Label>
                            <Select
                              value={formData.prStatus}
                              onValueChange={(value) => handleInputChange("prStatus", value)}
                            >
                              <SelectTrigger className="border-[#E5E5E5]">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Not Started">Not Started</SelectItem>
                                <SelectItem value="Filed">Filed</SelectItem>
                                <SelectItem value="Awaiting Response">Awaiting Response</SelectItem>
                                <SelectItem value="Approved">Approved</SelectItem>
                                <SelectItem value="Denied">Denied</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="prNotes" className="text-[#1E1E1E]">PR Notes</Label>
                            <Input
                              id="prNotes"
                              value={formData.prNotes}
                              onChange={(e) => handleInputChange("prNotes", e.target.value)}
                              className="border-[#E5E5E5]"
                              placeholder="Add notes"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Education Section */}
            <Card className="border-[#E5E5E5]">
              <Collapsible
                open={openSections.education}
                onOpenChange={() => toggleSection("education")}
              >
                <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors">
                  <h2 className="text-[#1E1E1E]">Education</h2>
                  {openSections.education ? (
                    <ChevronUp className="h-5 w-5 text-[#6B7280]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[#6B7280]" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Highest Education */}
                      <div className="space-y-2">
                        <Label htmlFor="highestEducation" className="text-[#1E1E1E]">
                          Highest Education
                        </Label>
                        <Select
                          value={formData.highestEducation}
                          onValueChange={(value) => handleInputChange("highestEducation", value)}
                        >
                          <SelectTrigger className="border-[#E5E5E5]">
                            <SelectValue placeholder="Select education level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="High School">High School</SelectItem>
                            <SelectItem value="Associate">Associate</SelectItem>
                            <SelectItem value="Bachelor's">Bachelor's</SelectItem>
                            <SelectItem value="Master's">Master's</SelectItem>
                            <SelectItem value="Doctorate">Doctorate</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Field of Study */}
                      <div className="space-y-2">
                        <Label htmlFor="fieldOfStudy" className="text-[#1E1E1E]">
                          Field of Study
                        </Label>
                        <Input
                          id="fieldOfStudy"
                          value={formData.fieldOfStudy}
                          onChange={(e) => handleInputChange("fieldOfStudy", e.target.value)}
                          className="border-[#E5E5E5]"
                          placeholder="e.g., Computer Science, Biology"
                        />
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Administrative Section */}
            <Card className="border-[#E5E5E5]">
              <Collapsible
                open={openSections.administrative}
                onOpenChange={() => toggleSection("administrative")}
              >
                <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-[#F8F9FA] transition-colors">
                  <h2 className="text-[#1E1E1E]">Administrative</h2>
                  {openSections.administrative ? (
                    <ChevronUp className="h-5 w-5 text-[#6B7280]" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-[#6B7280]" />
                  )}
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-1 gap-4">
                      {/* SOC Code */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="socCode" className="text-[#1E1E1E]">
                            SOC Code
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <HelpCircle className="inline-block ml-1 h-3.5 w-3.5 text-[#6B7280] cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">Standard Occupational Classification Code</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </Label>
                          <Input
                            id="socCode"
                            value={formData.socCode}
                            onChange={(e) => handleInputChange("socCode", e.target.value)}
                            className="border-[#E5E5E5]"
                            placeholder="e.g., 15-1252"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="socCodeDescription" className="text-[#1E1E1E]">
                            SOC Code Description
                          </Label>
                          <Input
                            id="socCodeDescription"
                            value={formData.socCodeDescription}
                            onChange={(e) => handleInputChange("socCodeDescription", e.target.value)}
                            className="border-[#E5E5E5]"
                            placeholder="e.g., Software Developers"
                          />
                        </div>
                      </div>

                      {/* General Notes */}
                      <div className="space-y-2">
                        <Label htmlFor="generalNotes" className="text-[#1E1E1E]">
                          General Notes
                        </Label>
                        <Textarea
                          id="generalNotes"
                          value={formData.generalNotes}
                          onChange={(e) => handleInputChange("generalNotes", e.target.value)}
                          className="border-[#E5E5E5]"
                          placeholder="Add any additional notes or comments"
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Footer Actions */}
            <Card className="border-[#E5E5E5] p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#6B7280]">
                  <span className="text-[#DC2626]">*</span> Required fields
                </p>
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    className="border-[#E5E5E5] text-[#1E1E1E] hover:bg-[#F8F9FA]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="bg-[#000000] text-[#FFFFFF] hover:bg-[#1E1E1E]"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}