
import { useState } from "react";
import AdminNav from "@/components/admin/AdminNav";
import StatsCard from "@/components/admin/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";

import {
  Users,
  ShoppingBag,
  BookOpen,
  MousePointer,
  ArrowRightCircle,
  Calendar,
  LineChart
} from "lucide-react";
import { 
  LineChart as ReLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Sample data for charts
const visitData = [
  { name: "Jan", visits: 1200 },
  { name: "Feb", visits: 1900 },
  { name: "Mar", visits: 2300 },
  { name: "Apr", visits: 3200 },
  { name: "May", visits: 4500 },
  { name: "Jun", visits: 3800 },
  { name: "Jul", visits: 4000 },
];

const categoryData = [
  { name: "Gaming", value: 42 },
  { name: "Peripherals", value: 28 },
  { name: "Monitors", value: 15 },
  { name: "Accessories", value: 10 },
  { name: "Furniture", value: 5 },
];

const COLORS = ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe", "#ede9fe"];

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState("month");

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminNav />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Dashboard Overview</h1>
            <Select
              defaultValue="month"
              onValueChange={setTimeRange}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
                <SelectItem value="quarter">Last 3 months</SelectItem>
                <SelectItem value="year">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard 
              title="Total Clicks" 
              value="24,532"
              description="3,246 this week"
              icon={<MousePointer className="h-5 w-5" />}
              trend={{ value: 12, positive: true }}
            />
            <StatsCard 
              title="Redirections" 
              value="16,285"
              description="2,174 this week"
              icon={<ArrowRightCircle className="h-5 w-5" />}
              trend={{ value: 8, positive: true }}
            />
            <StatsCard 
              title="Monthly Visits" 
              value="84,756"
              description="Unique visitors"
              icon={<Calendar className="h-5 w-5" />}
              trend={{ value: 5, positive: true }}
            />
            <StatsCard 
              title="Conversion Rate" 
              value="23.6%"
              description="1.2% increase"
              icon={<LineChart className="h-5 w-5" />}
              trend={{ value: 1.2, positive: true }}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Visit Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ReLineChart data={visitData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(240 10% 3.9%)", 
                        borderColor: "hsl(240 3.7% 15.9%)" 
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="visits" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                    />
                  </ReLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Categories Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(240 10% 3.9%)", 
                        borderColor: "hsl(240 3.7% 15.9%)" 
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Products & Users Tabs */}
          <Tabs defaultValue="products">
            <TabsList className="mb-4">
              <TabsTrigger value="products">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Products
              </TabsTrigger>
              <TabsTrigger value="blogposts">
                <BookOpen className="mr-2 h-4 w-4" />
                Blog Posts
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="mr-2 h-4 w-4" />
                Users
              </TabsTrigger>
            </TabsList>
            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Top Performing Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="uppercase bg-secondary text-foreground/70">
                        <tr>
                          <th scope="col" className="px-6 py-3">Product</th>
                          <th scope="col" className="px-6 py-3">Category</th>
                          <th scope="col" className="px-6 py-3">Clicks</th>
                          <th scope="col" className="px-6 py-3">Redirections</th>
                          <th scope="col" className="px-6 py-3">Conv. Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border">
                          <td className="px-6 py-4">Ultra Gaming Headset X1</td>
                          <td className="px-6 py-4">Gaming</td>
                          <td className="px-6 py-4">3,542</td>
                          <td className="px-6 py-4">2,318</td>
                          <td className="px-6 py-4">65.4%</td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="px-6 py-4">4K Ultra HD Monitor 32"</td>
                          <td className="px-6 py-4">Monitors</td>
                          <td className="px-6 py-4">2,841</td>
                          <td className="px-6 py-4">1,952</td>
                          <td className="px-6 py-4">68.7%</td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="px-6 py-4">Ergonomic Mechanical Keyboard</td>
                          <td className="px-6 py-4">Peripherals</td>
                          <td className="px-6 py-4">2,756</td>
                          <td className="px-6 py-4">1,845</td>
                          <td className="px-6 py-4">66.9%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="blogposts">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Popular Blog Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="uppercase bg-secondary text-foreground/70">
                        <tr>
                          <th scope="col" className="px-6 py-3">Title</th>
                          <th scope="col" className="px-6 py-3">Author</th>
                          <th scope="col" className="px-6 py-3">Views</th>
                          <th scope="col" className="px-6 py-3">Comments</th>
                          <th scope="col" className="px-6 py-3">Published</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border">
                          <td className="px-6 py-4">Top 10 Gaming Peripherals for Competitive Players</td>
                          <td className="px-6 py-4">Alex Morgan</td>
                          <td className="px-6 py-4">12,532</td>
                          <td className="px-6 py-4">85</td>
                          <td className="px-6 py-4">Nov 15, 2023</td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="px-6 py-4">Mechanical vs Membrane Keyboards: Which Is Right For You?</td>
                          <td className="px-6 py-4">Jessica Chen</td>
                          <td className="px-6 py-4">8,741</td>
                          <td className="px-6 py-4">64</td>
                          <td className="px-6 py-4">Oct 28, 2023</td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="px-6 py-4">How to Set Up the Ultimate Streaming Station</td>
                          <td className="px-6 py-4">Mike Johnson</td>
                          <td className="px-6 py-4">7,456</td>
                          <td className="px-6 py-4">52</td>
                          <td className="px-6 py-4">Sep 15, 2023</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Recent Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="uppercase bg-secondary text-foreground/70">
                        <tr>
                          <th scope="col" className="px-6 py-3">User</th>
                          <th scope="col" className="px-6 py-3">Email</th>
                          <th scope="col" className="px-6 py-3">Joined</th>
                          <th scope="col" className="px-6 py-3">Comments</th>
                          <th scope="col" className="px-6 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border">
                          <td className="px-6 py-4">John Smith</td>
                          <td className="px-6 py-4">john.smith@example.com</td>
                          <td className="px-6 py-4">2023-11-20</td>
                          <td className="px-6 py-4">12</td>
                          <td className="px-6 py-4">
                            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">Active</span>
                          </td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="px-6 py-4">Sarah Johnson</td>
                          <td className="px-6 py-4">sarah.j@example.com</td>
                          <td className="px-6 py-4">2023-11-18</td>
                          <td className="px-6 py-4">5</td>
                          <td className="px-6 py-4">
                            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">Active</span>
                          </td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="px-6 py-4">Michael Brown</td>
                          <td className="px-6 py-4">m.brown@example.com</td>
                          <td className="px-6 py-4">2023-11-15</td>
                          <td className="px-6 py-4">0</td>
                          <td className="px-6 py-4">
                            <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs">Pending</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
