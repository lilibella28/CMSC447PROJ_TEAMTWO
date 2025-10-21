import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import { Eye, EyeOff } from "lucide-react";

interface LoginProps {
  onLogin: (success: boolean) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validate form
    const newErrors: { email?: string; password?: string; general?: string } = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    // Test credentials check
    setTimeout(() => {
      if (email === "admin@test.com" && password === "password123") {
        onLogin(true);
      } else {
        setErrors({
          general: "Invalid email or password. Use admin@test.com / password123 for testing."
        });
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email || errors.general) {
      setErrors(prev => ({ ...prev, email: undefined, general: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password || errors.general) {
      setErrors(prev => ({ ...prev, password: undefined, general: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-6">
      <Card className="w-full max-w-[440px] border-[#E5E7EB] shadow-lg rounded-2xl">
        <CardHeader className="space-y-4 pb-6">
          {/* UMBC Wordmark with Gold Underline */}
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-foreground">UMBC</h1>
            <div className="w-16 h-0.5 bg-[#FFCC00] mx-auto mt-1"></div>
          </div>
          
          {/* Sign In Title */}
          <h2 className="text-lg font-semibold text-center text-foreground">
            Sign in  to Center for Global Engagement
          </h2>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* General Error Message */}
          {errors.general && (
            <div className="bg-[#FEF2F2] border border-[#FCA5A5] rounded-lg p-3">
              <p className="text-sm text-[#EF4444]">{errors.general}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-medium text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                placeholder="name@company.com"
                className={`h-12 rounded-lg border-2 bg-[#F6F6F6] focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20 ${
                  errors.email ? 'border-[#EF4444] focus:border-[#EF4444]' : 'border-[#E5E7EB]'
                }`}
                onChange={handleEmailChange}
              />
              {errors.email && (
                <p className="text-sm text-[#EF4444]">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-medium text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  className={`h-12 rounded-lg border-2 bg-[#F6F6F6] pr-12 focus:border-[#FFCC00] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-20 ${
                    errors.password ? 'border-[#EF4444] focus:border-[#EF4444]' : 'border-[#E5E7EB]'
                  }`}
                  onChange={handlePasswordChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#707070] hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-50 rounded"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-[#EF4444]">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember-me"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-2 border-[#E5E7EB] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-50 data-[state=checked]:bg-[#FFCC00] data-[state=checked]:border-[#FFCC00] data-[state=checked]:text-black"
                />
                <Label 
                  htmlFor="remember-me" 
                  className="text-sm font-normal text-foreground cursor-pointer"
                >
                  Remember me
                </Label>
              </div>
              <Button
                type="button"
                variant="ghost"
                className="text-sm text-[#707070] hover:text-foreground focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-50 p-0 h-auto self-start sm:self-auto"
              >
                Forgot password?
              </Button>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#000000] text-[#FFCC00] hover:bg-[#111111] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-50 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <Separator className="bg-[#E5E7EB]" />
            <div className="absolute inset-0 flex justify-center">
              <span className="bg-background px-4 text-sm text-[#707070]">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Auth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="ghost"
              className="h-12 border-2 border-[#E5E7EB] hover:bg-[#F6F6F6] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-50 rounded-lg"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
            <Button
              variant="ghost"
              className="h-12 border-2 border-[#E5E7EB] hover:bg-[#F6F6F6] focus:ring-2 focus:ring-[#FFCC00] focus:ring-opacity-50 rounded-lg"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M23.84 12.37c-.06-1.22-.47-2.32-1.28-3.25c-.48-.55-1.04-.92-1.68-1.17c-.35-.13-.72-.22-1.09-.25c-1.23-.1-2.53.17-3.89.38c-.24.04-.47.07-.71.07c-.48 0-.99-.09-1.45-.29c-.45-.2-.83-.51-1.08-.92c-.26-.42-.38-.9-.38-1.41c0-.47.11-.91.28-1.32c.32-.75.84-1.37 1.51-1.78c.32-.2.67-.35 1.03-.45C15.8 1.64 16.58 1.58 17.39 1.58c.38 0 .76.02 1.14.06c1.07.11 2.08.41 2.95.89c.87.48 1.57 1.17 2.05 2.02c.24.42.42.87.54 1.33c.12.46.18.94.18 1.42c0 .97-.15 1.9-.42 2.78c-.27.88-.66 1.7-1.14 2.44z"
                />
              </svg>
              Microsoft
            </Button>
          </div>

          {/* Footer Note */}
          <p className="text-center text-xs text-[#707070] font-medium">
            Need access? Contact your admin.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}