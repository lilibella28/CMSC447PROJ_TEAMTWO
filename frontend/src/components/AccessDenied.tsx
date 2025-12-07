/**
 * Access Denied Component
 * Displayed when a user tries to access a page they don't have permission for
 */

import { ShieldAlert, ArrowLeft, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface AccessDeniedProps {
  onNavigateBack?: () => void;
  message?: string;
  requiredRole?: string;
}

export function AccessDenied({
  onNavigateBack,
  message = "You don't have permission to access this page.",
  requiredRole,
}: AccessDeniedProps) {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-6">
      <Card className="max-w-md w-full border-[#D86464] bg-white p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-[#FEE2E2] rounded-full">
            <ShieldAlert className="h-12 w-12 text-[#D86464]" />
          </div>
        </div>

        <h1 className="text-[#1E1E1E] mb-2">Access Denied</h1>
        
        <p className="text-[#4A4A4A] mb-6">{message}</p>

        {requiredRole && (
          <div className="bg-[#F8F9FA] rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-[#6B7280]">
              <strong>Required Role:</strong> {requiredRole}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {onNavigateBack && (
            <Button
              onClick={onNavigateBack}
              className="w-full bg-[#5B8DEF] hover:bg-[#4A7DD8] text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          )}
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => (window.location.href = 'mailto:admin@umbc.edu')}
          >
            <Mail className="h-4 w-4 mr-2" />
            Contact Administrator
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t border-[#E5E5E5]">
          <p className="text-xs text-[#6B7280]">
            If you believe this is an error, please contact your system administrator
            to request access or verify your role permissions.
          </p>
        </div>
      </Card>
    </div>
  );}