
import { KpiMetric } from "@/types/report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Users, UserCheck, User, DollarSign, CreditCard } from "lucide-react";

interface ReportMetricsGridProps {
  metrics: KpiMetric[];
}

export function ReportMetricsGrid({ metrics }: ReportMetricsGridProps) {
  const getMetricIcon = (metricName: string) => {
    switch(metricName) {
      case "Total Users":
        return <Users className="h-5 w-5" />;
      case "Active Users":
        return <UserCheck className="h-5 w-5" />;
      case "New Users":
        return <User className="h-5 w-5" />;
      case "Total Revenue":
        return <DollarSign className="h-5 w-5" />;
      case "Avg. Spend per User":
        return <CreditCard className="h-5 w-5" />;
      default:
        return <DollarSign className="h-5 w-5" />;
    }
  };

  const formatValue = (metric: KpiMetric) => {
    if (metric.metric.toLowerCase().includes('revenue') || metric.metric.toLowerCase().includes('spend')) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(metric.value);
    }
    
    return metric.value.toLocaleString();
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {metrics.map((metric) => (
        <Card key={metric.metric} className="bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.metric}
            </CardTitle>
            <div className="h-4 w-4 text-muted-foreground">
              {getMetricIcon(metric.metric)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatValue(metric)}</div>
            <p className="text-xs text-muted-foreground">{metric.period}</p>
            {metric.change_percentage !== null && (
              <div className="flex items-center pt-1">
                {metric.change_percentage > 0 ? (
                  <div className="flex items-center text-green-500 text-xs font-medium">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    {metric.change_percentage}%
                  </div>
                ) : metric.change_percentage < 0 ? (
                  <div className="flex items-center text-red-500 text-xs font-medium">
                    <ArrowDown className="h-3 w-3 mr-1" />
                    {Math.abs(metric.change_percentage)}%
                  </div>
                ) : (
                  <div className="text-muted-foreground text-xs">No change</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
