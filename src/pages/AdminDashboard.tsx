import React, { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Sample user data for the chart
const userData = [
  { month: 'Jan', activeUsers: 4000, newUsers: 2400 },
  { month: 'Feb', activeUsers: 3000, newUsers: 1398 },
  { month: 'Mar', activeUsers: 2000, newUsers: 9800 },
  { month: 'Apr', activeUsers: 2780, newUsers: 3908 },
  { month: 'May', activeUsers: 1890, newUsers: 4800 },
  { month: 'Jun', activeUsers: 2390, newUsers: 3800 },
  { month: 'Jul', activeUsers: 3490, newUsers: 4300 },
];

const AdminDashboard = () => {
  const { user, checkUserRole } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!checkUserRole('admin')) {
      navigate('/');
      toast.error("You don't have permission to access this page");
    } else {
      setIsAdmin(true);
    }
  }, [navigate, checkUserRole]);

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="container mx-auto py-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Welcome Card */}
        <Card className="col-span-3 shadow-md">
          <CardHeader>
            <CardTitle>Welcome, Admin!</CardTitle>
            <CardDescription>Here's a quick overview of your system.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>You have administrative privileges.</p>
          </CardContent>
        </Card>

        {/* Quick Stats Cards */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>Number of registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,457</div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>New Signups (Last 7 Days)</CardTitle>
            <CardDescription>Users who signed up in the last week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Total Products</CardTitle>
            <CardDescription>Number of products in the store</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">345</div>
          </CardContent>
        </Card>

        {/* Chart Card */}
        <Card className="col-span-3 shadow-md">
          <CardHeader>
            <CardTitle>Monthly Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={userData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="activeUsers" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="newUsers" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
