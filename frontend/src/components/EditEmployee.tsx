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
    first_name: "",
    last_name: "",
    email: "", // UMBC Email
    personal_email: "",
    gender: "",
    country_of_birth: "",
    citizenship: "",
    phone: "",
    address: "",
    nationality: "",
    dateOfBirth: "",
    passportNumber: "",
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

  // Load employee data on mount
  useEffect(() => {
    const loadEmployeeData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchEmployeeById(employee.id);
        setFullEmployeeData(data);

        // Populate form with existing data
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          personal_email: data.personal_email || "",
          gender: data.gender || "",
          country_of_birth: data.country_of_birth || "",
          citizenship: data.citizenship?.join(", ") || "",
          phone: data.phone || "",
          address: data.address || "",
          nationality: data.nationality || "",
          dateOfBirth: data.dateOfBirth || "",
          passportNumber: data.passportNumber || "",
          department: data.department || "",
          employee_title: data.employee_title || "",
          department_admin: data.department_admin || "",
          department_advisor: data.department_advisor || "",
         annual_salary: data.annual_salary?.toString() || "",
          visa_type: data.visa_type || "",
          status: data.status || "",
          filed_by: data.visaFiledBy || "",
          case_type: data.case_type || "",
         i94_number: data.i94_number  || "",
          sevis_id: data.sevis_id || "",
          pr_filing_date: data.permanentResidency?.filingDate || "",
          pr_status: data.permanentResidency?.currentStatus || "",
          pr_notes: data.permanentResidency?.notes || "",
          highest_education: data.highest_education || "",
          field_of_study: data.field_of_study || "",
          soc_code: data.soc_code || "",
          soc_code_description: data.soc_code_description || "",
          general_notes: data.general_notes || "",
          number_of_dependents : data.number_of_dependents?.toString() || "0",
        });

        // Populate dates
        setDates({
          expiration_date: data.expiration_date ? new Date(data.expiration_date) : undefined,
          visa_start_date: data.visa_start_date ? new Date(data.visa_start_date) : undefined,
          initial_h1b_start_date: data.initial_h1b_start_date ? new Date(data.initial_h1b_start_date) : undefined,
          prep_extension_date : data.prep_extension_date  ? new Date(data.prep_extension_date ) : undefined,
          max_h_period: data.max_h_period ? new Date(data.max_h_period) : undefined,
          i94_expiry_date: data.i94_expiry_date ? new Date(data.i94_expiry_date) : undefined,
          pr_filing_date: data.permanentResidency?.filingDate ? new Date(data.permanentResidency.filingDate) : undefined,
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
    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }
    if (!formData.last_name.trim()) {
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
    if (!formData.visa_type) {
      newErrors.visa_type = "Visa type is required";
    }
    if (!dates.expiration_date) {
      newErrors.expiration_date = "Expiration date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        setIsSaving(true);
        
        // const updatedData: Partial<Employee> = {
        //   first_name: formData.first_name,
        //   last_name: formData.last_name,
        //   employeeName: `${formData.first_name} ${formData.last_name}`,
        //   email: formData.email,
        //   personal_email: formData.personal_email || undefined,
        //   gender: formData.gender || undefined,
        //   country_of_birth: formData.country_of_birth || undefined,
        //   citizenship: formData.citizenship ? formData.citizenship.split(",").map(c => c.trim()) : [],
        //   phone: formData.phone,
        //   address: formData.address,
        //   nationality: formData.nationality,
        //   dateOfBirth: formData.dateOfBirth,
        //   passportNumber: formData.passportNumber,
        //   department: formData.department,
        //   employee_title: formData.employee_title || undefined,
        //   department_admin: formData.department_admin || undefined,
        //   department_advisor: formData.department_advisor || undefined,
        //  annual_salary: formData.annual_salary ? parseFloat(formData.annual_salary) : undefined,
        //   visa_type: formData.visa_type,
        //   status: formData.status as any,
        //   visafiled_by: formData.filed_by as any,
        //   case_type: formData.case_type || undefined,
        //  i94_number: formData.i94_number ,
        //   sevis_id: formData.sevis_id,
        //   expiration_date: dates.expiration_date ? format(dates.expiration_date, "yyyy-MM-dd") : "",
        //   visa_start_date: dates.visa_start_date ? format(dates.visa_start_date, "yyyy-MM-dd") : "",
        //   initial_h1b_start_date: dates.initial_h1b_start_date ? format(dates.initial_h1b_start_date, "yyyy-MM-dd") : undefined,
        //   prep_extension_date : dates.prep_extension_date  ? format(dates.prep_extension_date , "yyyy-MM-dd") : undefined,
        //   max_h_period: dates.max_h_period ? format(dates.max_h_period, "yyyy-MM-dd") : undefined,
        //   i94_expiry_date: dates.i94_expiry_date ? format(dates.i94_expiry_date, "yyyy-MM-dd") : undefined,
        //   permanentResidency: {
        //     filingDate: dates.pr_filing_date ? format(dates.pr_filing_date, "yyyy-MM-dd") : undefined,
        //     currentStatus: formData.pr_status as any || undefined,
        //     notes: formData.pr_notes || undefined,
        //   },
        //   highest_education: formData.highest_education as any || undefined,
        //   field_of_study: formData.field_of_study || undefined,
        //   soc_code: formData.soc_code || undefined,
        //   soc_code_description: formData.soc_code_description || undefined,
        //   general_notes: formData.general_notes || undefined,
        //   number_of_dependents: parseInt(formData.number_of_dependents ) || 0,
        // };
        const updatedData: any = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email || null,
          personal_email: formData.personal_email || null,
          gender: formData.gender || null,
          country_of_birth: formData.country_of_birth || null,
          citizenship: formData.citizenship
            ? formData.citizenship.split(",").map(c => c.trim())
            : null,
          department: formData.department || null,
          employee_title: formData.employee_title || null,
          department_admin: formData.department_admin || null,
          department_advisor: formData.department_advisor || null,
         annual_salary: formData.annual_salary
            ? parseFloat(formData.annual_salary)
            : null,
          visa_type: formData.visa_type || null,
          status: formData.status || null,
          filed_by: formData.filed_by || null,
          case_type: formData.case_type || null,
         i94_number: formData.i94_number  || null,
          sevis_id: formData.sevis_id || null,
          expiration_date: dates.expiration_date
            ? format(dates.expiration_date, "yyyy-MM-dd")
            : null,
          visa_start_date: dates.visa_start_date
            ? format(dates.visa_start_date, "yyyy-MM-dd")
            : null,
          initial_h1b_start_date: dates.initial_h1b_start_date
            ? format(dates.initial_h1b_start_date, "yyyy-MM-dd")
            : null,
          prep_extension_date : dates.prep_extension_date 
            ? format(dates.prep_extension_date , "yyyy-MM-dd")
            : null,
          max_h_period: dates.max_h_period
            ? format(dates.max_h_period, "yyyy-MM-dd")
            : null,
          i94_expiry_date: dates.i94_expiry_date
            ? format(dates.i94_expiry_date, "yyyy-MM-dd")
            : null,
          pr_filing_date: dates.pr_filing_date
            ? format(dates.pr_filing_date, "yyyy-MM-dd")
            : null,
          pr_status: formData.pr_status || null,
          pr_notes: formData.pr_notes || null,
          highest_education: formData.highest_education || null,
          field_of_study: formData.field_of_study || null,
          soc_code: formData.soc_code || null,
          soc_code_description: formData.soc_code_description || null,
          general_notes: formData.general_notes || null,
          number_of_dependents: parseInt(formData.number_of_dependents ) || 0,
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
                        <Label htmlFor="first_name" className="text-[#1E1E1E]">
                          First Name <span className="text-[#DC2626]">*</span>
                        </Label>
                        <Input
                          id="first_name"
                          value={formData.first_name}
                          onChange={(e) => handleInputChange("first_name", e.target.value)}
                          className={`border-[#E5E5E5] ${errors.first_name ? "border-[#DC2626]" : ""}`}
                          placeholder="Enter first name"
                        />
                        {errors.first_name && (
                          <p className="text-sm text-[#DC2626]">{errors.first_name}</p>
                        )}
                      </div>

                      {/* Last Name */}
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-[#1E1E1E]">
                          Last Name <span className="text-[#DC2626]">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          value={formData.last_name}
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
                        <Label htmlFor="personal_email" className="text-[#1E1E1E]">
                          Personal Email
                        </Label>
                        <Input
                          id="personal_email"
                          type="email"
                          value={formData.personal_email}
                          onChange={(e) => handleInputChange("personal_email", e.target.value)}
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
                        <Label htmlFor="country_of_birth" className="text-[#1E1E1E]">
                          Country of Birth
                        </Label>
                        <Input
                          id="country_of_birth"
                          value={formData.country_of_birth}
                          onChange={(e) => handleInputChange("country_of_birth", e.target.value)}
                          className="border-[#E5E5E5]"
                          placeholder="Enter country"
                        />
                      </div>

                      {/* citizenship */}
                      <div className="space-y-2">
                        <Label htmlFor="citizenship" className="text-[#1E1E1E]">
                          Citizenship(s)
                        </Label>
                        <Input
                          id="citizenship"
                          value={formData.citizenship}
                          onChange={(e) => handleInputChange("citizenship", e.target.value)}
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
                        <Label htmlFor="employee_title" className="text-[#1E1E1E]">
                          Job Title / Position
                        </Label>
                        <Input
                          id="employee_title"
                          value={formData.employee_title}
                          onChange={(e) => handleInputChange("employee_title", e.target.value)}
                          className="border-[#E5E5E5]"
                          placeholder="e.g., Research Assistant, Professor"
                        />
                      </div>

                      {/* Department Admin */}
                      <div className="space-y-2">
                        <Label htmlFor="department_admin" className="text-[#1E1E1E]">
                          Department Admin
                        </Label>
                        <Input
                          id="department_admin"
                          value={formData.department_admin}
                          onChange={(e) => handleInputChange("department_admin", e.target.value)}
                          className="border-[#E5E5E5]"
                          placeholder="Admin name"
                        />
                      </div>

                      {/* Department Advisor / PI / Chair */}
                      <div className="space-y-2">
                        <Label htmlFor="department_advisor" className="text-[#1E1E1E]">
                          Department Advisor / PI / Chair
                        </Label>
                        <Input
                          id="department_advisor"
                          value={formData.department_advisor}
                          onChange={(e) => handleInputChange("department_advisor", e.target.value)}
                          className="border-[#E5E5E5]"
                          placeholder="Advisor name"
                        />
                      </div>

                      {/* Annual Salary */}
                      <div className="space-y-2">
                        <Label htmlFor="annual_salary" className="text-[#1E1E1E]">
                          Annual Salary
                        </Label>
                        <Input
                          id="annual_salary"
                          type="number"
                          value={formData.annual_salary}
                          onChange={(e) => handleInputChange("annual_salary", e.target.value)}
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
                        <Label htmlFor="visa_type" className="text-[#1E1E1E]">
                          Visa Type <span className="text-[#DC2626]">*</span>
                        </Label>
                        <Select
                          value={formData.visa_type}
                          onValueChange={(value) => handleInputChange("visa_type", value)}
                        >
                          <SelectTrigger className={`border-[#E5E5E5] ${errors.visa_type ? "border-[#DC2626]" : ""}`}>
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
                          <p className="text-sm text-[#DC2626]">{errors.visa_type}</p>
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
                                errors.expiration_date ? "border-[#DC2626]" : ""
                              }`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 text-[#6B7280]" />
                              {dates.expiration_date ? (
                                format(dates.expiration_date, "MMM dd, yyyy")
                              ) : (
                                <span className="text-[#9CA3AF]">Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dates.expiration_date}
                              onSelect={(date) => handleDateChange("expiration_date", date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        {errors.expiration_date && (
                          <p className="text-sm text-[#DC2626]">{errors.expiration_date}</p>
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
                              {dates.visa_start_date ? (
                                format(dates.visa_start_date, "MMM dd, yyyy")
                              ) : (
                                <span className="text-[#9CA3AF]">Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dates.visa_start_date}
                              onSelect={(date) => handleDateChange("visa_start_date", date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Filed By */}
                      <div className="space-y-2">
                        <Label htmlFor="filed_by" className="text-[#1E1E1E]">Filed By</Label>
                        <Select
                          value={formData.filed_by}
                          onValueChange={(value) => handleInputChange("filed_by", value)}
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
                        <Label htmlFor="case_type" className="text-[#1E1E1E]">Case Type</Label>
                        <Input
                          id="case_type"
                          value={formData.case_type}
                          onChange={(e) => handleInputChange("case_type", e.target.value)}
                          className="border-[#E5E5E5]"
                          placeholder="e.g., H-1B Extension, Initial COS"
                        />
                      </div>

                      {/* I-94 Number */}
                      <div className="space-y-2">
                        <Label htmlFor="i94_number " className="text-[#1E1E1E]">I-94 Number</Label>
                        <Input
                          id="i94_number "
                          value={formData.i94_number }
                          onChange={(e) => handleInputChange("i94_number ", e.target.value)}
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
                              {dates.i94_expiry_date ? (
                                format(dates.i94_expiry_date, "MMM dd, yyyy")
                              ) : (
                                <span className="text-[#9CA3AF]">Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dates.i94_expiry_date}
                              onSelect={(date) => handleDateChange("i94_expiry_date", date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* SEVIS ID */}
                      <div className="space-y-2">
                        <Label htmlFor="sevis_id" className="text-[#1E1E1E]">SEVIS ID</Label>
                        <Input
                          id="sevis_id"
                          value={formData.sevis_id}
                          onChange={(e) => handleInputChange("sevis_id", e.target.value)}
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
                              {dates.initial_h1b_start_date ? (
                                format(dates.initial_h1b_start_date, "MMM dd, yyyy")
                              ) : (
                                <span className="text-[#9CA3AF]">Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dates.initial_h1b_start_date}
                              onSelect={(date) => handleDateChange("initial_h1b_start_date", date)}
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
                              {dates.prep_extension_date  ? (
                                format(dates.prep_extension_date , "MMM dd, yyyy")
                              ) : (
                                <span className="text-[#9CA3AF]">Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dates.prep_extension_date }
                              onSelect={(date) => handleDateChange("prep_extension_date ", date)}
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
                              {dates.max_h_period ? (
                                format(dates.max_h_period, "MMM dd, yyyy")
                              ) : (
                                <span className="text-[#9CA3AF]">Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dates.max_h_period}
                              onSelect={(date) => handleDateChange("max_h_period", date)}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Number of number_of_dependents */}
                      <div className="space-y-2">
                        <Label htmlFor="number_of_dependents " className="text-[#1E1E1E]">
                          Number of number_of_dependents
                        </Label>
                        <Input
                          id="number_of_dependents "
                          type="number"
                          min="0"
                          value={formData.number_of_dependents }
                          onChange={(e) => handleInputChange("number_of_dependents ", e.target.value)}
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
                                  {dates.pr_filing_date ? (
                                    format(dates.pr_filing_date, "MMM dd, yyyy")
                                  ) : (
                                    <span className="text-[#9CA3AF]">Pick a date</span>
                                  )}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={dates.pr_filing_date}
                                  onSelect={(date) => handleDateChange("pr_filing_date", date)}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="pr_status" className="text-[#1E1E1E]">PR Status</Label>
                            <Select
                              value={formData.pr_status}
                              onValueChange={(value) => handleInputChange("pr_status", value)}
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
                            <Label htmlFor="pr_notes" className="text-[#1E1E1E]">PR Notes</Label>
                            <Input
                              id="pr_notes"
                              value={formData.pr_notes}
                              onChange={(e) => handleInputChange("pr_notes", e.target.value)}
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
                        <Label htmlFor="highest_education" className="text-[#1E1E1E]">
                          Highest Education
                        </Label>
                        <Select
                          value={formData.highest_education}
                          onValueChange={(value) => handleInputChange("highest_education", value)}
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
                        <Label htmlFor="field_of_study" className="text-[#1E1E1E]">
                          Field of Study
                        </Label>
                        <Input
                          id="field_of_study"
                          value={formData.field_of_study}
                          onChange={(e) => handleInputChange("field_of_study", e.target.value)}
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
                          <Label htmlFor="soc_code" className="text-[#1E1E1E]">
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
                            id="soc_code"
                            value={formData.soc_code}
                            onChange={(e) => handleInputChange("soc_code", e.target.value)}
                            className="border-[#E5E5E5]"
                            placeholder="e.g., 15-1252"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="soc_code_description" className="text-[#1E1E1E]">
                            SOC Code Description
                          </Label>
                          <Input
                            id="soc_code_description"
                            value={formData.soc_code_description}
                            onChange={(e) => handleInputChange("soc_code_description", e.target.value)}
                            className="border-[#E5E5E5]"
                            placeholder="e.g., Software Developers"
                          />
                        </div>
                      </div>

                      {/* General Notes */}
                      <div className="space-y-2">
                        <Label htmlFor="general_notes" className="text-[#1E1E1E]">
                          General Notes
                        </Label>
                        <Textarea
                          id="general_notes"
                          value={formData.general_notes}
                          onChange={(e) => handleInputChange("general_notes", e.target.value)}
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