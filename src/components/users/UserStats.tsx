
import { UserProfile } from "@/types/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, UserMinus, DollarSign } from "lucide-react";

interface UserStatsProps {
  users: UserProfile[];
}

export function UserStats({ users }: UserStatsProps) {
  // Calculate statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.status === "active").length;
  const inactiveUsers = users.filter(user => user.status === "inactive").length;
  
  // Calculate total spend from all users
  const totalSpend = users.reduce((sum, user) => sum + (user.spend || 0), 0);
  
  // Format numbers
  const formatNumber = (num: number) => new Intl.NumberFormat().format(num);
  const formatCurrency = (num: number) => new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-secondary/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(totalUsers)}</div>
          <p className="text-xs text-muted-foreground">
            All registered users
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-secondary/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Users</CardTitle>
          <UserPlus className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(activeUsers)}</div>
          <p className="text-xs text-muted-foreground">
            {((activeUsers / totalUsers) * 100).toFixed(1)}% of total users
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-secondary/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
          <UserMinus className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(inactiveUsers)}</div>
          <p className="text-xs text-muted-foreground">
            {((inactiveUsers / totalUsers) * 100).toFixed(1)}% of total users
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-secondary/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(totalSpend)}</div>
          <p className="text-xs text-muted-foreground">
            Avg {formatCurrency(totalSpend / totalUsers)} per user
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
