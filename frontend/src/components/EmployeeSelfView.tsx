/**
 * Employee Self-View Portal
 * Limited view for employees to see only their own profile information
 */

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  MapPin,
  Building,
  FileText,
  Shield,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { fetchEmployeeById, Employee as EmployeeData } from '../../utils/dataService';
import { User as SystemUser } from '../../utils/roles';
import { formatDate, formatDateWithFallback, isMissingDate } from '../../utils/dateUtils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from './ui/tooltip';

interface EmployeeSelfViewProps {
  user: SystemUser;
}

export function EmployeeSelfView({ user }: EmployeeSelfViewProps) {
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEmployeeData();
  }, [user.employeeProfileId]);

  const loadEmployeeData = async () => {
    if (!user.employeeProfileId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await fetchEmployeeById(user.employeeProfileId); // Pass as string, not parseInt
      setEmployee(data);
    } catch (error) {
      console.error('Error loading employee data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getVisaStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-[#5BB974] text-white';
      case 'Expired':
        return 'bg-[#D86464] text-white';
      case 'Processing':
        return 'bg-[#9E9E9E] text-white';
      case 'Expiring Soon':
        return 'bg-[#EFB74A] text-white';
      default:
        return 'bg-[#6B7280] text-white';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5B8DEF] mx-auto mb-4"></div>
          <p className="text-[#6B7280]">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="h-12 w-12 text-[#D86464] mx-auto mb-4" />
          <h2 className="text-[#1E1E1E] mb-2">Profile Not Found</h2>
          <p className="text-[#4A4A4A]">
            Your employee profile could not be found. Please contact your administrator.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-[1000px] mx-auto px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <User className="h-7 w-7 text-[#5B8DEF]" />
            <h1 className="text-[#1E1E1E]">My Profile</h1>
          </div>
          <p className="text-[#4A4A4A]">
            View your personal information and current visa status.
          </p>
          <div className="mt-4 h-[1px] bg-[#E5E5E5]" />
        </div>

        {/* Welcome Banner */}
        <Card className="mb-6 border-[#5B8DEF] bg-gradient-to-r from-[#E9F2FF] to-white p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-[#5B8DEF] flex items-center justify-center text-white text-xl font-medium">
              {employee.employeeName?.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-[#1E1E1E] mb-1">Welcome, {employee.employeeName?.split(' ')[0]}!</h2>
              <p className="text-sm text-[#4A4A4A]">
                Last updated: {new Date().toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>
            <Badge className={getVisaStatusBadge(employee.status)}>
              {employee.status}
            </Badge>
          </div>
        </Card>

        {/* Visa Status Alert */}
        {employee.daysLeft !== undefined && employee.daysLeft <= 60 && employee.daysLeft >= 0 && (
          <Card className="mb-6 border-[#EFB74A] bg-[#FFF9EB] p-5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-[#EFB74A] mt-0.5" />
              <div>
                <p className="font-medium text-[#7A4C00] mb-1">
                  Visa Expiring Soon
                </p>
                <p className="text-sm text-[#7A4C00]">
                  Your {employee.visa_type} visa will expire in <strong>{employee.daysLeft} days</strong> on{' '}
                  {formatDateWithFallback(employee.expiration_date)}. Please contact your administrator or assistant
                  for renewal guidance.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Personal Information */}
        <Card className="mb-6 border-[#E5E5E5] p-6">
          <h3 className="text-[#1E1E1E] mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-[#5B8DEF]" />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-[#6B7280]">Full Name</label>
              <p className="text-black mt-1">{employee.employeeName}</p>
            </div>
            <div>
              <label className="text-sm text-[#6B7280]">Email Address</label>
              <p className="text-black mt-1 flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#6B7280]" />
                {employee.email}
              </p>
            </div>
            {employee.phone && (
              <div>
                <label className="text-sm text-[#6B7280]">Phone Number</label>
                <p className="text-black mt-1 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#6B7280]" />
                  {employee.phone}
                </p>
              </div>
            )}
            {employee.department && (
              <div>
                <label className="text-sm text-[#6B7280]">Department</label>
                <p className="text-black mt-1 flex items-center gap-2">
                  <Building className="h-4 w-4 text-[#6B7280]" />
                  {employee.department}
                </p>
              </div>
            )}
            {employee.employee_title && (
              <div>
                <label className="text-sm text-[#6B7280]">Job Title</label>
                <p className="text-black mt-1 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-[#6B7280]" />
                  {employee.employee_title}
                </p>
              </div>
            )}
            {employee.dateOfBirth && (
              <div>
                <label className="text-sm text-[#6B7280]">Date of Birth</label>
                <p className="text-black mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#6B7280]" />
                  {formatDate(employee.dateOfBirth)}
                </p>
              </div>
            )}
            {employee.citizenship && employee.citizenship.length > 0 && (
              <div>
                <label className="text-sm text-[#6B7280]">Country of Citizenship</label>
                <p className="text-black mt-1 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#6B7280]" />
                  {employee.citizenship.join(', ')}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Current Visa Status */}
        <Card className="mb-6 border-[#E5E5E5] p-6">
          <h3 className="text-[#1E1E1E] mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#5B8DEF]" />
            Current Visa Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-[#6B7280]">Visa Type</label>
              <p className="text-black mt-1">{employee.visa_type}</p>
            </div>
            <div>
              <label className="text-sm text-[#6B7280]">Status</label>
              <div className="mt-1">
                <Badge className={getVisaStatusBadge(employee.status)}>
                  {employee.status}
                </Badge>
              </div>
            </div>
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
                    <p>Date information is missing. Please contact your administrator to update.</p>
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
                    <p>Date information is missing. Please contact your administrator to update.</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
            {employee.daysLeft !== undefined && employee.daysLeft >= 0 && (
              <div>
                <label className="text-sm text-[#6B7280]">Days Remaining</label>
                <p className={`mt-1 flex items-center gap-2 ${
                  employee.daysLeft <= 30 ? 'text-[#D86464] font-medium' :
                  employee.daysLeft <= 60 ? 'text-[#EFB74A] font-medium' :
                  'text-black'
                }`}>
                  <Clock className="h-4 w-4" />
                  {employee.daysLeft} days
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6 border-[#E5E5E5] p-6">
          <h3 className="text-[#1E1E1E] mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5 text-[#5B8DEF]" />
            Your Support Team
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#F8F9FA] rounded-lg p-4">
              <p className="text-sm text-[#6B7280] mb-1">UMBC Administrator</p>
              <p className="text-black font-medium">
                {employee.department_advisor || 'Not Assigned'}
              </p>
              <p className="text-sm text-[#6B7280] mt-2">
                Contact for general inquiries and access requests
              </p>
            </div>
            <div className="bg-[#F8F9FA] rounded-lg p-4">
              <p className="text-sm text-[#6B7280] mb-1">Assigned Assistant</p>
              <p className="text-black font-medium">
                {employee.department_advisor || 'Not Assigned'}
              </p>
              <p className="text-sm text-[#6B7280] mt-2">
                Contact for visa updates and document submissions
              </p>
            </div>
          </div>
        </Card>

        {/* Help & Support */}
        <Card className="border-[#E5E5E5] p-6">
          <h3 className="text-[#1E1E1E] mb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#5B8DEF]" />
            Need Help?
          </h3>
          <div className="space-y-3">
            <p className="text-sm text-[#4A4A4A]">
              If you notice any incorrect information or have questions about your visa status,
              please contact your administrator or assigned assistant.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.location.href = `mailto:admin@umbc.edu?subject=Profile Update Request - ${employee.employeeName}`}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Administrator
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.location.href = `mailto:${employee.department_advisor?.toLowerCase().replace(/\s+/g, '.')}@umbc.edu?subject=Visa Inquiry - ${employee.employeeName}`}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Assistant
              </Button>
            </div>
          </div>
        </Card>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-[#6B7280]">
            This is a read-only view of your profile. For updates or changes, please contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );}