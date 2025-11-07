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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { CalendarIcon, Plus, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export interface VisaHistoryRecord {
  id: string;
  visaType: string;
  status: "Active" | "Expired" | "Processing" | "Pending";
  startDate: string;
  expirationDate: string;
  filedBy: "Attorney" | "UMBC Administrator" | "Self-Petition";
  caseType?: string;
  i94Number?: string;
  sevisId?: string;
  comments?: string;
  addedDate: string;
  addedBy: string;
}

interface AddVisaProps {
  open: boolean;
  onClose: () => void;
  onSave: (visaData: VisaHistoryRecord) => void;
  employeeName: string;
  currentVisa?: VisaHistoryRecord;
}

export function AddVisa({ open, onClose, onSave, employeeName, currentVisa }: AddVisaProps) {
  const [formData, setFormData] = useState({
    visaType: currentVisa?.visaType || "",
    status: currentVisa?.status || "",
    filedBy: currentVisa?.filedBy || "",
    caseType: currentVisa?.caseType || "",
    i94Number: currentVisa?.i94Number || "",
    sevisId: currentVisa?.sevisId || "",
    comments: currentVisa?.comments || "",
  });

  const [dates, setDates] = useState({
    startDate: currentVisa?.startDate ? new Date(currentVisa.startDate) : undefined,
    expirationDate: currentVisa?.expirationDate ? new Date(currentVisa.expirationDate) : undefined,
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

  const handleDateChange = (field: "startDate" | "expirationDate", value: Date | undefined) => {
    setDates((prev) => ({ ...prev, [field]: value }));
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

    if (!formData.visaType) {
      newErrors.visaType = "Visa type is required";
    }
    if (!formData.status) {
      newErrors.status = "Status is required";
    }
    if (!dates.startDate) {
      newErrors.startDate = "Start date is required";
    }
    if (!dates.expirationDate) {
      newErrors.expirationDate = "Expiration date is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const visaRecord: VisaHistoryRecord = {
        id: currentVisa?.id || Date.now().toString(),
        visaType: formData.visaType,
        status: formData.status as any,
        startDate: dates.startDate ? format(dates.startDate, "yyyy-MM-dd") : "",
        expirationDate: dates.expirationDate ? format(dates.expirationDate, "yyyy-MM-dd") : "",
        filedBy: formData.filedBy as any,
        caseType: formData.caseType || undefined,
        i94Number: formData.i94Number || undefined,
        sevisId: formData.sevisId || undefined,
        comments: formData.comments || undefined,
        addedDate: new Date().toISOString(),
        addedBy: "Current Admin", // In production, this would come from auth context
      };

      onSave(visaRecord);
      toast.success(currentVisa ? "Visa record updated successfully!" : "New visa record added successfully!");
      handleClose();
    } else {
      toast.error("Please fill in all required fields");
    }
  };

  const handleClose = () => {
    // Reset form
    setFormData({
      visaType: "",
      status: "",
      filedBy: "",
      caseType: "",
      i94Number: "",
      sevisId: "",
      comments: "",
    });
    setDates({
      startDate: undefined,
      expirationDate: undefined,
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#1E1E1E]">
            {currentVisa ? "Update Visa Record" : "Add New Visa Record"}
          </DialogTitle>
          <DialogDescription className="text-[#6B7280]">
            {currentVisa 
              ? `Update visa information for ${employeeName}`
              : `Add a new visa record to ${employeeName}'s history`
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
              <Label htmlFor="status" className="text-[#1E1E1E]">
                Status <span className="text-[#DC2626]">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger className={`border-[#E5E5E5] ${errors.status ? "border-[#DC2626]" : ""}`}>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-[#DC2626]">{errors.status}</p>
              )}
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label className="text-[#1E1E1E]">
                Start Date <span className="text-[#DC2626]">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left border-[#E5E5E5] ${
                      errors.startDate ? "border-[#DC2626]" : ""
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-[#6B7280]" />
                    {dates.startDate ? (
                      format(dates.startDate, "MMM dd, yyyy")
                    ) : (
                      <span className="text-[#9CA3AF]">Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dates.startDate}
                    onSelect={(date) => handleDateChange("startDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.startDate && (
                <p className="text-sm text-[#DC2626]">{errors.startDate}</p>
              )}
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
          </div>

          {/* Comments - Full Width */}
          <div className="space-y-2">
            <Label htmlFor="comments" className="text-[#1E1E1E]">Comments / Notes</Label>
            <Textarea
              id="comments"
              value={formData.comments}
              onChange={(e) => handleInputChange("comments", e.target.value)}
              className="border-[#E5E5E5]"
              placeholder="Add any additional notes or comments about this visa record"
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-[#E5E5E5] text-[#1E1E1E] hover:bg-[#F8F9FA]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#000000] text-[#FFFFFF] hover:bg-[#1E1E1E]"
            >
              <Plus className="h-4 w-4 mr-2" />
              {currentVisa ? "Update Visa" : "Add Visa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}