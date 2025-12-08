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
    first_name: "",
    last_name: "",
    email: "", // UMBC Email
    personal_email: "",
    gender: "",
    country_of_birth: "",
    citizenship: "",
    // Employment Information
    department: "",
    employee_title: "",
    department_admin: "",
    department_advisor: "",
   annual_salary: "",
    // Visa & Immigration
    visa_type: "",
    status: "",
    filed_by: "",
    case_type: "",
   i94_number: "",
    sevis_id: "",
    // Permanent Residency
    pr_filing_date: "",
    pr_status: "",
    pr_notes: "",
    // Education
    highest_education: "",
    field_of_study: "",
    // Administrative
    soc_code: "",
    soc_code_description: "",
    general_notes: "",
    // number_of_dependents
    number_of_dependents : "0",
  });

  const [dates, setDates] = useState({
    expiration_date: undefined as Date | undefined,
    visa_start_date: undefined as Date | undefined,
    initial_h1b_start_date: undefined as Date | undefined,
    prep_extension_date : undefined as Date | undefined,
    max_h_period: undefined as Date | undefined,
    i94_expiry_date: undefined as Date | undefined,
    pr_filing_date: undefined as Date | undefined,
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
    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "UMBC email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.department) {
      newErrors.department = "Department is required";
    }
    if (!formData.visa_type) {
      newErrors.visa_type = "Visa type is required";
    }
    if (!dates.expiration_date) {
      newErrors.expiration_date = "Expiration date is required";
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
        // alert("Employee added successfully!");
      } else {
        console.error("❌ Error creating employee:", result.error);
        // alert("Error saving employee: " + result.error);
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
        citizenship: formData.citizenship ? formData.citizenship.split(",").map(c => c.trim()) : [],
       annual_salary: formData.annual_salary ? parseFloat(formData.annual_salary) : undefined,
        number_of_dependents : parseInt(formData.number_of_dependents ) || 0,
        expiration_date: dates.expiration_date ? format(dates.expiration_date, "yyyy-MM-dd") : null,
        visa_start_date: dates.visa_start_date ? format(dates.visa_start_date, "yyyy-MM-dd") : null,
        initial_h1b_start_date: dates.initial_h1b_start_date ? format(dates.initial_h1b_start_date, "yyyy-MM-dd") : null,
        prep_extension_date : dates.prep_extension_date  ? format(dates.prep_extension_date , "yyyy-MM-dd") : null,
        max_h_period: dates.max_h_period ? format(dates.max_h_period, "yyyy-MM-dd") : null,
        i94_expiry_date: dates.i94_expiry_date ? format(dates.i94_expiry_date, "yyyy-MM-dd") : null,
        pr_filing_date: dates.pr_filing_date ? format(dates.pr_filing_date, "yyyy-MM-dd") : null,
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
            className={`w-full h-11 justify-start text-left rounded-lg border-2 bg-[#F6F6F6] hover:bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20 ${error ? "border-[#EF4444]" : "border-[#E5E7EB]"
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
                  <Label htmlFor="first_name" className="text-black">
                    First Name <span className="text-[#EF4444]">*</span>
                  </Label>
                  <Input
                    id="first_name"
                    type="text"
                    placeholder="Enter first name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange("first_name", e.target.value)}
                    className={`h-11 rounded-lg border-2 bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20 ${errors.first_name ? "border-[#EF4444]" : "border-[#E5E7EB]"
                      }`}
                  />
                  {errors.first_name && (
                    <p className="text-sm text-[#EF4444]">{errors.first_name}</p>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-black">
                    Last Name <span className="text-[#EF4444]">*</span>
                  </Label>
                  <Input
                    id="last_name"
                    type="text"
                    placeholder="Enter last name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange("last_name", e.target.value)}
                    className={`h-11 rounded-lg border-2 bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20 ${errors.last_name ? "border-[#EF4444]" : "border-[#E5E7EB]"
                      }`}
                  />
                  {errors.last_name && (
                    <p className="text-sm text-[#EF4444]">{errors.last_name}</p>
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
                    className={`h-11 rounded-lg border-2 bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20 ${errors.email ? "border-[#EF4444]" : "border-[#E5E7EB]"
                      }`}
                  />
                  {errors.email && (
                    <p className="text-sm text-[#EF4444]">{errors.email}</p>
                  )}
                </div>

                {/* Personal Email */}
                <div className="space-y-2">
                  <Label htmlFor="personal_email" className="text-black">
                    Personal Email
                  </Label>
                  <Input
                    id="personal_email"
                    type="email"
                    placeholder="personal@example.com"
                    value={formData.personal_email}
                    onChange={(e) => handleInputChange("personal_email", e.target.value)}
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
                  <Label htmlFor="country_of_birth" className="text-black">
                    Country of Birth
                  </Label>
                  <Input
                    id="country_of_birth"
                    type="text"
                    placeholder="Enter country of birth"
                    value={formData.country_of_birth}
                    onChange={(e) => handleInputChange("country_of_birth", e.target.value)}
                    className="h-11 rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20"
                  />
                </div>

                {/* citizenship */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="citizenship" className="text-black">
                      Citizenship(s)
                    </Label>
                    <HelpTooltip text="Enter multiple countries separated by commas (e.g., 'India, United States')" />
                  </div>
                  <Input
                    id="citizenship"
                    type="text"
                    placeholder="e.g., India, United States"
                    value={formData.citizenship}
                    onChange={(e) => handleInputChange("citizenship", e.target.value)}
                    className="h-11 rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20"
                  />
                  <p className="text-xs text-[#6B7280]">Separate multiple countries with commas</p>
                </div>

                {/* Number of number_of_dependents */}
                <div className="space-y-2">
                  <Label htmlFor="number_of_dependents " className="text-black">
                    Number of number_of_dependents
                  </Label>
                  <Input
                    id="number_of_dependents "
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.number_of_dependents }
                    onChange={(e) => handleInputChange("number_of_dependents ", e.target.value)}
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
                      className={`h-11 rounded-lg border-2 bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20 ${errors.department ? "border-[#EF4444]" : "border-[#E5E7EB]"
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
                  <Label htmlFor="employee_title" className="text-black">
                    Employee Title / Position
                  </Label>
                  <Input
                    id="employee_title"
                    type="text"
                    placeholder="e.g., Research Assistant, Professor"
                    value={formData.employee_title}
                    onChange={(e) => handleInputChange("employee_title", e.target.value)}
                    className="h-11 rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20"
                  />
                </div>

                {/* Department Admin */}
                <div className="space-y-2">
                  <Label htmlFor="department_admin" className="text-black">
                    Department Admin
                  </Label>
                  <Input
                    id="department_admin"
                    type="text"
                    placeholder="Enter department admin name"
                    value={formData.department_admin}
                    onChange={(e) => handleInputChange("department_admin", e.target.value)}
                    className="h-11 rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20"
                  />
                </div>

                {/* Department Advisor / PI / Chair */}
                <div className="space-y-2">
                  <Label htmlFor="department_advisor" className="text-black">
                    Department Advisor / PI / Chair
                  </Label>
                  <Input
                    id="department_advisor"
                    type="text"
                    placeholder="Enter advisor/PI/chair name"
                    value={formData.department_advisor}
                    onChange={(e) => handleInputChange("department_advisor", e.target.value)}
                    className="h-11 rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20"
                  />
                </div>

                {/* Annual Salary */}
                <div className="space-y-2">
                  <Label htmlFor="annual_salary" className="text-black">
                    Annual Salary
                  </Label>
                  <Input
                    id="annual_salary"
                    type="number"
                    placeholder="Enter annual salary"
                    value={formData.annual_salary}
                    onChange={(e) => handleInputChange("annual_salary", e.target.value)}
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
                    <Label htmlFor="visa_type" className="text-black">
                      Visa Type <span className="text-[#EF4444]">*</span>
                    </Label>
                    <Select
                      value={formData.visa_type}
                      onValueChange={(value) => handleInputChange("visa_type", value)}
                    >
                      <SelectTrigger
                        className={`h-11 rounded-lg border-2 bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20 ${errors.visa_type ? "border-[#EF4444]" : "border-[#E5E7EB]"
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
                    {errors.visa_type && (
                      <p className="text-sm text-[#EF4444]">{errors.visa_type}</p>
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

                  {/* Filed By
                  <div className="space-y-2">
                    <Label htmlFor="filed_by" className="text-black">
                      Filed By
                    </Label>
                    <Select
                      value={formData.filed_by}
                      onValueChange={(value) => handleInputChange("filed_by", value)}
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
                  </div> */}

                  {/* Filed By */}
                  <div className="space-y-2">
                    <Label htmlFor="filed_by" className="text-black">
                      Filed By
                    </Label>

                    {(() => {
                      const options = [
                        "Attorney",
                        "UMBC Administrator",
                        "Self-Petition",
                      ];

                      const currentValue = formData.filed_by?.trim() || "";

                      // If the value is not in the predefined options, add it dynamically
                      const finalOptions = options.includes(currentValue)
                        ? options
                        : currentValue
                          ? [...options, currentValue]
                          : options;

                      return (
                        <Select
                          value={currentValue}
                          onValueChange={(value) => handleInputChange("filed_by", value)}
                        >
                          <SelectTrigger className="h-11 rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20">
                            <SelectValue placeholder="Select who filed" />
                          </SelectTrigger>

                          <SelectContent>
                            {finalOptions.map((opt) => (
                              <SelectItem key={opt} value={opt}>
                                {opt}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      );
                    })()}
                  </div>


                  {/* Case Type
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="case_type" className="text-black">
                        Case Type
                      </Label>
                      <HelpTooltip text="e.g., H-1B Extension, Initial Change of Status, Permanent Resident application" />
                    </div>
                    <Input
                      id="case_type"
                      type="text"
                      placeholder="e.g., H-1B Extension, Initial COS"
                      value={formData.case_type}
                      onChange={(e) => handleInputChange("case_type", e.target.value)}
                      className="h-11 rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20"
                    />
                  </div> */}

                  {/* Start Date */}
                  <DatePicker
                    value={dates.visa_start_date}
                    onChange={(date) => handleDateChange("visa_start_date", date)}
                    label="Visa Start Date"
                  />

                  {/* Expiration Date */}
                  <DatePicker
                    value={dates.expiration_date}
                    onChange={(date) => handleDateChange("expiration_date", date)}
                    label="Expiration Date"
                    required
                    error={errors.expiration_date}
                  />

                  {/* Initial H-1B Start Date */}
                  <DatePicker
                    value={dates.initial_h1b_start_date}
                    onChange={(date) => handleDateChange("initial_h1b_start_date", date)}
                    label="Initial H-1B Start Date"
                  />

                  {/* Prep Extension Date */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label className="text-black">Prep Extension Date</Label>
                      <HelpTooltip text="Optional reminder date for when to begin preparing visa extension" />
                    </div>
                    <DatePicker
                      value={dates.prep_extension_date }
                      onChange={(date) => handleDateChange("prep_extension_date ", date)}
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
                      value={dates.max_h_period}
                      onChange={(date) => handleDateChange("max_h_period", date)}
                      label=""
                    />
                  </div>

                  {/* I-94 Number */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="i94_number " className="text-black">
                        I-94 Number
                      </Label>
                      <HelpTooltip text="The I-94 Arrival/Departure Record number" />
                    </div>
                    <Input
                      id="i94_number "
                      type="text"
                      placeholder="Enter I-94 number"
                      value={formData.i94_number }
                      onChange={(e) => handleInputChange("i94_number ", e.target.value)}
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
                      value={dates.i94_expiry_date}
                      onChange={(date) => handleDateChange("i94_expiry_date", date)}
                      label=""
                    />
                  </div>

                  {/* SEVIS ID */}
                  <div className="space-y-2">
                    <Label htmlFor="sevis_id" className="text-black">
                      SEVIS ID
                    </Label>
                    <Input
                      id="sevis_id"
                      type="text"
                      placeholder="Enter SEVIS ID (for F-1)"
                      value={formData.sevis_id}
                      onChange={(e) => handleInputChange("sevis_id", e.target.value)}
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
                      value={dates.pr_filing_date}
                      onChange={(date) => handleDateChange("pr_filing_date", date)}
                      label="PR Filing Date"
                    />

                    {/* PR Status */}
                    <div className="space-y-2">
                      <Label htmlFor="pr_status" className="text-black">
                        PR Current Status
                      </Label>
                      <Select
                        value={formData.pr_status}
                        onValueChange={(value) => handleInputChange("pr_status", value)}
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
                      <Label htmlFor="pr_notes" className="text-black">
                        PR Notes
                      </Label>
                      <Textarea
                        id="pr_notes"
                        placeholder="Enter any notes about permanent residency application..."
                        value={formData.pr_notes}
                        onChange={(e) => handleInputChange("pr_notes", e.target.value)}
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
                  <Label htmlFor="highest_education" className="text-black">
                    Highest Educational Level
                  </Label>
                  <Select
                    value={formData.highest_education}
                    onValueChange={(value) => handleInputChange("highest_education", value)}
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
                  <Label htmlFor="field_of_study" className="text-black">
                    Field of Study
                  </Label>
                  <Input
                    id="field_of_study"
                    type="text"
                    placeholder="e.g., Computer Science, Biology"
                    value={formData.field_of_study}
                    onChange={(e) => handleInputChange("field_of_study", e.target.value)}
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
                      <Label htmlFor="soc_code" className="text-black">
                        SOC Code
                      </Label>
                      <HelpTooltip text="Standard Occupational Classification code for USCIS reporting" />
                    </div>
                    <Input
                      id="soc_code"
                      type="text"
                      placeholder="e.g., 15-1252"
                      value={formData.soc_code}
                      onChange={(e) => handleInputChange("soc_code", e.target.value)}
                      className="h-11 rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20"
                    />
                  </div>

                  {/* SOC Code Description */}
                  <div className="space-y-2">
                    <Label htmlFor="soc_code_description" className="text-black">
                      SOC Code Description
                    </Label>
                    <Input
                      id="soc_code_description"
                      type="text"
                      placeholder="e.g., Software Developers"
                      value={formData.soc_code_description}
                      onChange={(e) => handleInputChange("soc_code_description", e.target.value)}
                      className="h-11 rounded-lg border-2 border-[#E5E7EB] bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20"
                    />
                  </div>
                </div>

                {/* General Notes */}
                <div className="space-y-2">
                  <Label htmlFor="general_notes" className="text-black">
                    General Notes
                  </Label>
                  <Textarea
                    id="general_notes"
                    placeholder="Enter any additional notes about this employee..."
                    value={formData.general_notes}
                    onChange={(e) => handleInputChange("general_notes", e.target.value)}
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