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
import { CalendarIcon, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { format } from "date-fns";

interface AddEmployeeProps {
  onCancel: () => void;
  onSave: (employeeData: any) => void;
}

export function AddEmployee({ onCancel, onSave }: AddEmployeeProps) {
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "", // UMBC Email
    personalEmail: "",
    gender: "",
    countryOfBirth: "",
    citizenships: "",
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

  const handleSave = async (employeeData: any) => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/employees/newcase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employeeData),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        console.log("✅ Employee created successfully:", result);
        alert("Employee added successfully!");
      } else {
        console.error("❌ Error creating employee:", result.error);
        alert("Error saving employee: " + result.error);
      }
    } catch (err) {
      console.error("❌ Network error:", err);
      alert("Network error. Please check your backend connection.");
    }
  };
  

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const employeeData = {
        ...formData,
        citizenships: formData.citizenships ? formData.citizenships.split(",").map(c => c.trim()) : [],
        annualSalary: formData.annualSalary ? parseFloat(formData.annualSalary) : undefined,
        numberOfDependents: parseInt(formData.numberOfDependents) || 0,
        expirationDate: dates.expirationDate ? format(dates.expirationDate, "yyyy-MM-dd") : null,
        visaStartDate: dates.visaStartDate ? format(dates.visaStartDate, "yyyy-MM-dd") : null,
        initialH1BStartDate: dates.initialH1BStartDate ? format(dates.initialH1BStartDate, "yyyy-MM-dd") : null,
        prepExtensionDate: dates.prepExtensionDate ? format(dates.prepExtensionDate, "yyyy-MM-dd") : null,
        maxHPeriod: dates.maxHPeriod ? format(dates.maxHPeriod, "yyyy-MM-dd") : null,
        i94ExpiryDate: dates.i94ExpiryDate ? format(dates.i94ExpiryDate, "yyyy-MM-dd") : null,
        prFilingDate: dates.prFilingDate ? format(dates.prFilingDate, "yyyy-MM-dd") : null,
      };
      handleSave(employeeData); 
    }
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

  const DatePicker = ({
    value,
    onChange,
    label,
    required = false,
    error,
  }: {
    value: Date | undefined;
    onChange: (date: Date | undefined) => void;
    label: string;
    required?: boolean;
    error?: string;
  }) => (
    <div className="space-y-2">
      <Label className="text-black">
        {label} {required && <span className="text-[#EF4444]">*</span>}
      </Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-full h-11 justify-start text-left rounded-lg border-2 bg-[#F6F6F6] hover:bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20 ${
              error ? "border-[#EF4444]" : "border-[#E5E7EB]"
            } ${!value && "text-[#9CA3AF]"}`}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "MM/dd/yyyy") : <span>MM/DD/YYYY</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={value} onSelect={onChange} initialFocus />
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-[#EF4444]">{error}</p>}
    </div>
  );

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
      <div className="max-w-[960px] bg-white rounded-xl border border-[#E5E7EB] shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-0">
          
          {/* Personal Information Section */}
          <Collapsible
            open={openSections.personal}
            onOpenChange={() => toggleSection("personal")}
            className="border-b border-[#E5E7EB]"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-6 hover:bg-[#F9FAFB] transition-colors">
              <h2 className="text-lg font-semibold text-black">Personal Information</h2>
              {openSections.personal ? (
                <ChevronUp className="h-5 w-5 text-[#6B7280]" />
              ) : (
                <ChevronDown className="h-5 w-5 text-[#6B7280]" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="px-6 pb-6">
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
                      errors.firstName ? "border-[#EF4444]" : "border-[#E5E7EB]"
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
                      errors.lastName ? "border-[#EF4444]" : "border-[#E5E7EB]"
                    }`}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-[#EF4444]">{errors.lastName}</p>
                  )}
                </div>

                {/* UMBC Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-black">
                    UMBC Email <span className="text-[#EF4444]">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@umbc.edu"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`h-11 rounded-lg border-2 bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20 ${
                      errors.email ? "border-[#EF4444]" : "border-[#E5E7EB]"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-sm text-[#EF4444]">{errors.email}</p>
                  )}
                </div>

                {/* Personal Email */}
                <div className="space-y-2">
                  <Label htmlFor="personalEmail" className="text-black">
                    Personal Email
                  </Label>
                  <Input
                    id="personalEmail"
                    type="email"
                    placeholder="personal@example.com"
                    value={formData.personalEmail}
                    onChange={(e) => handleInputChange("personalEmail", e.target.value)}
                    className="h-11 rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-black">
                    Gender
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange("gender", value)}
                  >
                    <SelectTrigger className="h-11 rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20">
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

                {/* Country of Birth */}
                <div className="space-y-2">
                  <Label htmlFor="countryOfBirth" className="text-black">
                    Country of Birth
                  </Label>
                  <Input
                    id="countryOfBirth"
                    type="text"
                    placeholder="Enter country of birth"
                    value={formData.countryOfBirth}
                    onChange={(e) => handleInputChange("countryOfBirth", e.target.value)}
                    className="h-11 rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20"
                  />
                </div>

                {/* Citizenships */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="citizenships" className="text-black">
                      Citizenship(s)
                    </Label>
                    <HelpTooltip text="Enter multiple countries separated by commas (e.g., 'India, United States')" />
                  </div>
                  <Input
                    id="citizenships"
                    type="text"
                    placeholder="e.g., India, United States"
                    value={formData.citizenships}
                    onChange={(e) => handleInputChange("citizenships", e.target.value)}
                    className="h-11 rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20"
                  />
                  <p className="text-xs text-[#6B7280]">Separate multiple countries with commas</p>
                </div>

                {/* Number of Dependents */}
                <div className="space-y-2">
                  <Label htmlFor="numberOfDependents" className="text-black">
                    Number of Dependents
                  </Label>
                  <Input
                    id="numberOfDependents"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.numberOfDependents}
                    onChange={(e) => handleInputChange("numberOfDependents", e.target.value)}
                    className="h-11 rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Employment Information Section */}
          <Collapsible
            open={openSections.employment}
            onOpenChange={() => toggleSection("employment")}
            className="border-b border-[#E5E7EB]"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-6 hover:bg-[#F9FAFB] transition-colors">
              <h2 className="text-lg font-semibold text-black">Employment Information</h2>
              {openSections.employment ? (
                <ChevronUp className="h-5 w-5 text-[#6B7280]" />
              ) : (
                <ChevronDown className="h-5 w-5 text-[#6B7280]" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
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
                        errors.department ? "border-[#EF4444]" : "border-[#E5E7EB]"
                      }`}
                    >
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                      <SelectItem value="Biology">Biology</SelectItem>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Information Systems">Information Systems</SelectItem>
                      <SelectItem value="Administration">Administration</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.department && (
                    <p className="text-sm text-[#EF4444]">{errors.department}</p>
                  )}
                </div>

                {/* Employee Title */}
                <div className="space-y-2">
                  <Label htmlFor="employeeTitle" className="text-black">
                    Employee Title / Position
                  </Label>
                  <Input
                    id="employeeTitle"
                    type="text"
                    placeholder="e.g., Research Assistant, Professor"
                    value={formData.employeeTitle}
                    onChange={(e) => handleInputChange("employeeTitle", e.target.value)}
                    className="h-11 rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20"
                  />
                </div>

                {/* Department Admin */}
                <div className="space-y-2">
                  <Label htmlFor="departmentAdmin" className="text-black">
                    Department Admin
                  </Label>
                  <Input
                    id="departmentAdmin"
                    type="text"
                    placeholder="Enter department admin name"
                    value={formData.departmentAdmin}
                    onChange={(e) => handleInputChange("departmentAdmin", e.target.value)}
                    className="h-11 rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20"
                  />
                </div>

                {/* Department Advisor / PI / Chair */}
                <div className="space-y-2">
                  <Label htmlFor="departmentAdvisor" className="text-black">
                    Department Advisor / PI / Chair
                  </Label>
                  <Input
                    id="departmentAdvisor"
                    type="text"
                    placeholder="Enter advisor/PI/chair name"
                    value={formData.departmentAdvisor}
                    onChange={(e) => handleInputChange("departmentAdvisor", e.target.value)}
                    className="h-11 rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20"
                  />
                </div>

                {/* Annual Salary */}
                <div className="space-y-2">
                  <Label htmlFor="annualSalary" className="text-black">
                    Annual Salary
                  </Label>
                  <Input
                    id="annualSalary"
                    type="number"
                    placeholder="Enter annual salary"
                    value={formData.annualSalary}
                    onChange={(e) => handleInputChange("annualSalary", e.target.value)}
                    className="h-11 rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Visa & Immigration Section */}
          <Collapsible
            open={openSections.visa}
            onOpenChange={() => toggleSection("visa")}
            className="border-b border-[#E5E7EB]"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-6 hover:bg-[#F9FAFB] transition-colors">
              <h2 className="text-lg font-semibold text-black">Visa & Immigration</h2>
              {openSections.visa ? (
                <ChevronUp className="h-5 w-5 text-[#6B7280]" />
              ) : (
                <ChevronDown className="h-5 w-5 text-[#6B7280]" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="px-6 pb-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Visa Type */}
                  <div className="space-y-2">
                    <Label htmlFor="visaType" className="text-black">
                      Visa Type <span className="text-[#EF4444]">*</span>
                    </Label>
                    <Select
                      value={formData.visaType}
                      onValueChange={(value) => handleInputChange("visaType", value)}
                    >
                      <SelectTrigger
                        className={`h-11 rounded-lg border-2 bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20 ${
                          errors.visaType ? "border-[#EF4444]" : "border-[#E5E7EB]"
                        }`}
                      >
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
                      <p className="text-sm text-[#EF4444]">{errors.visaType}</p>
                    )}
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

                  {/* Filed By */}
                  <div className="space-y-2">
                    <Label htmlFor="filedBy" className="text-black">
                      Filed By
                    </Label>
                    <Select
                      value={formData.filedBy}
                      onValueChange={(value) => handleInputChange("filedBy", value)}
                    >
                      <SelectTrigger className="h-11 rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20">
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
                    <div className="flex items-center gap-2">
                      <Label htmlFor="caseType" className="text-black">
                        Case Type
                      </Label>
                      <HelpTooltip text="e.g., H-1B Extension, Initial Change of Status, Permanent Resident application" />
                    </div>
                    <Input
                      id="caseType"
                      type="text"
                      placeholder="e.g., H-1B Extension, Initial COS"
                      value={formData.caseType}
                      onChange={(e) => handleInputChange("caseType", e.target.value)}
                      className="h-11 rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20"
                    />
                  </div>

                  {/* Start Date */}
                  <DatePicker
                    value={dates.visaStartDate}
                    onChange={(date) => handleDateChange("visaStartDate", date)}
                    label="Visa Start Date"
                  />

                  {/* Expiration Date */}
                  <DatePicker
                    value={dates.expirationDate}
                    onChange={(date) => handleDateChange("expirationDate", date)}
                    label="Expiration Date"
                    required
                    error={errors.expirationDate}
                  />

                  {/* Initial H-1B Start Date */}
                  <DatePicker
                    value={dates.initialH1BStartDate}
                    onChange={(date) => handleDateChange("initialH1BStartDate", date)}
                    label="Initial H-1B Start Date"
                  />

                  {/* Prep Extension Date */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-black">Prep Extension Date</Label>
                      <HelpTooltip text="Optional reminder date for when to begin preparing visa extension" />
                    </div>
                    <DatePicker
                      value={dates.prepExtensionDate}
                      onChange={(date) => handleDateChange("prepExtensionDate", date)}
                      label=""
                    />
                  </div>

                  {/* Max H Period */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-black">Max H Period End Date</Label>
                      <HelpTooltip text="The maximum period end date for H-1B visa (typically 6 years from initial H-1B start)" />
                    </div>
                    <DatePicker
                      value={dates.maxHPeriod}
                      onChange={(date) => handleDateChange("maxHPeriod", date)}
                      label=""
                    />
                  </div>

                  {/* I-94 Number */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="i94Number" className="text-black">
                        I-94 Number
                      </Label>
                      <HelpTooltip text="The I-94 Arrival/Departure Record number" />
                    </div>
                    <Input
                      id="i94Number"
                      type="text"
                      placeholder="Enter I-94 number"
                      value={formData.i94Number}
                      onChange={(e) => handleInputChange("i94Number", e.target.value)}
                      className="h-11 rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20"
                    />
                  </div>

                  {/* I-94 Expiry Date */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-black">I-94 Expiry Date</Label>
                      <HelpTooltip text="The expiration date shown on the I-94 record" />
                    </div>
                    <DatePicker
                      value={dates.i94ExpiryDate}
                      onChange={(date) => handleDateChange("i94ExpiryDate", date)}
                      label=""
                    />
                  </div>

                  {/* SEVIS ID */}
                  <div className="space-y-2">
                    <Label htmlFor="sevisId" className="text-black">
                      SEVIS ID
                    </Label>
                    <Input
                      id="sevisId"
                      type="text"
                      placeholder="Enter SEVIS ID (for F-1)"
                      value={formData.sevisId}
                      onChange={(e) => handleInputChange("sevisId", e.target.value)}
                      className="h-11 rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20"
                    />
                  </div>
                </div>

                {/* Permanent Residency Section */}
                <div className="pt-4 border-t border-[#E5E7EB]">
                  <h3 className="text-base font-medium text-black mb-4">Permanent Residency Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* PR Filing Date */}
                    <DatePicker
                      value={dates.prFilingDate}
                      onChange={(date) => handleDateChange("prFilingDate", date)}
                      label="PR Filing Date"
                    />

                    {/* PR Status */}
                    <div className="space-y-2">
                      <Label htmlFor="prStatus" className="text-black">
                        PR Current Status
                      </Label>
                      <Select
                        value={formData.prStatus}
                        onValueChange={(value) => handleInputChange("prStatus", value)}
                      >
                        <SelectTrigger className="h-11 rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20">
                          <SelectValue placeholder="Select PR status" />
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

                    {/* PR Notes */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="prNotes" className="text-black">
                        PR Notes
                      </Label>
                      <Textarea
                        id="prNotes"
                        placeholder="Enter any notes about permanent residency application..."
                        value={formData.prNotes}
                        onChange={(e) => handleInputChange("prNotes", e.target.value)}
                        rows={3}
                        className="rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Education Section */}
          <Collapsible
            open={openSections.education}
            onOpenChange={() => toggleSection("education")}
            className="border-b border-[#E5E7EB]"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-6 hover:bg-[#F9FAFB] transition-colors">
              <h2 className="text-lg font-semibold text-black">Education</h2>
              {openSections.education ? (
                <ChevronUp className="h-5 w-5 text-[#6B7280]" />
              ) : (
                <ChevronDown className="h-5 w-5 text-[#6B7280]" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="px-6 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Highest Educational Level */}
                <div className="space-y-2">
                  <Label htmlFor="highestEducation" className="text-black">
                    Highest Educational Level
                  </Label>
                  <Select
                    value={formData.highestEducation}
                    onValueChange={(value) => handleInputChange("highestEducation", value)}
                  >
                    <SelectTrigger className="h-11 rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20">
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
                  <Label htmlFor="fieldOfStudy" className="text-black">
                    Field of Study
                  </Label>
                  <Input
                    id="fieldOfStudy"
                    type="text"
                    placeholder="e.g., Computer Science, Biology"
                    value={formData.fieldOfStudy}
                    onChange={(e) => handleInputChange("fieldOfStudy", e.target.value)}
                    className="h-11 rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Administrative Fields Section */}
          <Collapsible
            open={openSections.administrative}
            onOpenChange={() => toggleSection("administrative")}
            className="border-b border-[#E5E7EB]"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full p-6 hover:bg-[#F9FAFB] transition-colors">
              <h2 className="text-lg font-semibold text-black">Administrative Fields</h2>
              {openSections.administrative ? (
                <ChevronUp className="h-5 w-5 text-[#6B7280]" />
              ) : (
                <ChevronDown className="h-5 w-5 text-[#6B7280]" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="px-6 pb-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* SOC Code */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="socCode" className="text-black">
                        SOC Code
                      </Label>
                      <HelpTooltip text="Standard Occupational Classification code for USCIS reporting" />
                    </div>
                    <Input
                      id="socCode"
                      type="text"
                      placeholder="e.g., 15-1252"
                      value={formData.socCode}
                      onChange={(e) => handleInputChange("socCode", e.target.value)}
                      className="h-11 rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20"
                    />
                  </div>

                  {/* SOC Code Description */}
                  <div className="space-y-2">
                    <Label htmlFor="socCodeDescription" className="text-black">
                      SOC Code Description
                    </Label>
                    <Input
                      id="socCodeDescription"
                      type="text"
                      placeholder="e.g., Software Developers"
                      value={formData.socCodeDescription}
                      onChange={(e) => handleInputChange("socCodeDescription", e.target.value)}
                      className="h-11 rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20"
                    />
                  </div>
                </div>

                {/* General Notes */}
                <div className="space-y-2">
                  <Label htmlFor="generalNotes" className="text-black">
                    General Notes
                  </Label>
                  <Textarea
                    id="generalNotes"
                    placeholder="Enter any additional notes about this employee..."
                    value={formData.generalNotes}
                    onChange={(e) => handleInputChange("generalNotes", e.target.value)}
                    rows={4}
                    className="rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 p-6 bg-[#F9FAFB]">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-black text-[#FFCC00] hover:bg-neutral-gray-900 px-6"
            >
              Save Employee
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}