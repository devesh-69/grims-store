
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, ShoppingBag, DollarSign, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTitle } from "@/hooks/useTitle";

interface DashboardData {
  metric: string;
  value: number;
  change_percentage: number;
  period: string;
}

const AdminDashboard = () => {
  useTitle("Dashboard | Admin");

  const { data: kpiData = [], isLoading } = useQuery({
    queryKey: ['userKpis'],
    queryFn: async (): Promise<DashboardData[]> => {
      const { data, error } = await supabase.rpc('get_user_kpis');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: recentUsers = [] } = useQuery({
    queryKey: ['recentUsers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data || [];
    }
  });

  // Sample chart data - in a real app, this would come from your analytics
  const chartData = [
    { name: 'Jan', users: 400, revenue: 2400 },
    { name: 'Feb', users: 300, revenue: 1398 },
    { name: 'Mar', users: 200, revenue: 9800 },
    { name: 'Apr', users: 278, revenue: 3908 },
    { name: 'May', users: 189, revenue: 4800 },
    { name: 'Jun', users: 239, revenue: 3800 },
  ];

  const chartConfig = {
    users: {
      label: "Users",
      color: "hsl(var(--chart-1))",
    },
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-2))",
    },
  };

  const getIcon = (metric: string) => {
    switch (metric) {
      case 'Total Users':
        return <Users className="h-4 w-4" />;
      case 'Active Users':
        return <TrendingUp className="h-4 w-4" />;
      case 'New Users':
        return <Users className="h-4 w-4" />;
      case 'Total Revenue':
        return <DollarSign className="h-4 w-4" />;
      case 'Avg. Spend per User':
        return <ShoppingBag className="h-4 w-4" />;
      default:
        return <TrendingUp className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 w-16 bg-muted animate-pulse rounded mb-1" />
                  <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpiData.map((kpi) => (
            <Card key={kpi.metric}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {kpi.metric}
                </CardTitle>
                {getIcon(kpi.metric)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {kpi.metric.includes('Revenue') || kpi.metric.includes('Spend') 
                    ? `$${kpi.value.toLocaleString()}` 
                    : kpi.value.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Badge variant={kpi.change_percentage >= 0 ? "default" : "destructive"}>
                    {kpi.change_percentage >= 0 ? '+' : ''}{kpi.change_percentage}%
                  </Badge>
                  from {kpi.period.toLowerCase()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={chartConfig}>
                <LineChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Line
                    dataKey="users"
                    type="monotone"
                    stroke="var(--color-users)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    dataKey="revenue"
                    type="monotone"
                    stroke="var(--color-revenue)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.company || 'No company'}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      ${user.spend || 0}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
