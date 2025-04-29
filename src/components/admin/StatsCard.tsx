
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
}

const StatsCard = ({
  title,
  value,
  description,
  icon,
  trend,
}: StatsCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="w-8 h-8 p-1.5 bg-secondary rounded-md">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center pt-1">
          {trend && (
            <span
              className={`text-xs font-medium mr-2 ${
                trend.positive ? "text-green-500" : "text-red-500"
              }`}
            >
              {trend.positive ? "+" : "-"}
              {trend.value}%
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {description || "From previous period"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
