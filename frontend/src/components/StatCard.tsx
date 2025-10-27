import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";

interface StatCardProps {
  title: string;
  value: string | number;
  variant?: "default" | "warning" | "error" | "success";
  badge?: {
    text: string;
    variant: "default" | "warning" | "destructive" | "secondary";
  };
  onClick?: () => void;
  isActive?: boolean;
}

export function StatCard({ title, value, variant = "default", badge, onClick, isActive = false }: StatCardProps) {
  const getAccentColor = () => {
    switch (variant) {
      case "warning":
        return "bg-[#F59E0B]";
      case "error":
        return "bg-[#EF4444]";
      case "success":
        return "bg-[#10B981]";
      default:
        return "bg-[#FFCC00]";
    }
  };

  return (
    <Card 
      className={`relative overflow-hidden border bg-white transition-all ${
        onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''
      } ${
        isActive 
          ? 'border-black shadow-lg ring-2 ring-black ring-offset-2' 
          : 'border-neutral-gray-200'
      }`}
      onClick={onClick}
    >
      <div className={`absolute top-0 left-0 right-0 ${isActive ? 'h-1' : 'h-0.5'} ${getAccentColor()}`}></div>
      <CardHeader className="pb-2">
        <p className="text-sm text-neutral-gray-700">{title}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-semibold text-black">{value}</span>
          {badge && (
            <Badge variant={badge.variant} className="ml-2">
              {badge.text}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}