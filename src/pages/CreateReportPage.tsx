import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNav from "@/components/admin/AdminNav";
import { useCreateReportTemplate } from "@/hooks/useReports";
import { ChartType } from "@/types/report";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, LineChart, BarChart, PieChart, Layers } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart as ReBarChart, Bar } from "recharts";

// Sample data for charts
const sampleChartData = [
  { month: 'Jan', users: 500 },
  { month: 'Feb', users: 600 },
  { month: 'Mar', users: 750 },
  { month: 'Apr', users: 900 },
  { month: 'May', users: 1100 },
  { month: 'Jun', users: 1300 },
];

const chartTypes: { value: ChartType; label: string; icon: JSX.Element }[] = [
  { value: "line", label: "Line Chart", icon: <LineChart className="h-4 w-4" /> },
  { value: "bar", label: "Bar Chart", icon: <BarChart className="h-4 w-4" /> },
  { value: "pie", label: "Pie Chart", icon: <PieChart className="h-4 w-4" /> },
  { value: "area", label: "Area Chart", icon: <LineChart className="h-4 w-4" /> },
  { value: "donut", label: "Donut Chart", icon: <PieChart className="h-4 w-4" /> },
  { value: "scatter", label: "Scatter Plot", icon: <Layers className="h-4 w-4" /> },
];

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  chart_type: z.enum(["line", "bar", "pie", "donut", "area", "scatter", "heatmap", "funnel", "radar", "table"]),
  sql_query: z.string().min(1, "SQL query is required"),
  is_public: z.boolean().default(false),
  chart_config: z.object({
    title: z.string().optional(),
    xAxisLabel: z.string().optional(),
    yAxisLabel: z.string().optional(),
    showLegend: z.boolean().optional(),
  }).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CreateReportPage = () => {
  const navigate = useNavigate();
  const createReportMutation = useCreateReportTemplate();
  const [activeTab, setActiveTab] = useState("details");
  const [previewMode, setPreviewMode] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      chart_type: "line",
      sql_query: "SELECT * FROM profiles LIMIT 10",
      is_public: false,
      chart_config: {
        title: "",
        xAxisLabel: "",
        yAxisLabel: "",
        showLegend: true,
      },
    },
  });

  const onSubmit = (values: FormValues) => {
    createReportMutation.mutate({
      ...values,
      chart_config: values.chart_config || {},
    }, {
      onSuccess: (data) => {
        navigate(`/admin/reports/${data.id}`);
      },
    });
  };

  const isLoading = createReportMutation.isPending;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminNav />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => navigate("/admin/reports")}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Reports
          </Button>

          <h1 className="text-2xl font-bold mb-6">Create New Report</h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                  <TabsTrigger value="details">Report Details</TabsTrigger>
                  <TabsTrigger value="query">Data Query</TabsTrigger>
                  <TabsTrigger value="visualization">Visualization</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Report Details</CardTitle>
                      <CardDescription>
                        Enter the basic information about your report
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Report Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Monthly User Growth" {...field} />
                            </FormControl>
                            <FormDescription>
                              A clear, descriptive name for your report
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description (Optional)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tracks monthly user growth and engagement metrics"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="is_public"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Public Report
                              </FormLabel>
                              <FormDescription>
                                Make this report accessible to all team members
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => navigate("/admin/reports")}>
                        Cancel
                      </Button>
                      <Button 
                        type="button"
                        onClick={() => setActiveTab("query")}
                      >
                        Continue to Data Query
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="query" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>SQL Query</CardTitle>
                      <CardDescription>
                        Define the data source for your report
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <FormField
                        control={form.control}
                        name="sql_query"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>SQL Query</FormLabel>
                            <FormControl>
                              <Textarea 
                                className="font-mono h-60" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Write a SQL query to extract the data for your report
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        variant="outline" 
                        type="button"
                        onClick={() => setActiveTab("details")}
                      >
                        Previous
                      </Button>
                      <div className="space-x-2">
                        <Button variant="outline" type="button">
                          Test Query
                        </Button>
                        <Button 
                          type="button"
                          onClick={() => setActiveTab("visualization")}
                        >
                          Continue to Visualization
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="visualization" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Visualization Settings</CardTitle>
                      <CardDescription>
                        Configure how your data will be visualized
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="chart_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chart Type</FormLabel>
                            <FormControl>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a chart type" />
                                </SelectTrigger>
                                <SelectContent>
                                  {chartTypes.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                      <div className="flex items-center">
                                        {type.icon}
                                        <span className="ml-2">{type.label}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="chart_config.title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chart Title (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Monthly User Growth" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="chart_config.xAxisLabel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>X-Axis Label (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Month" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="chart_config.yAxisLabel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Y-Axis Label (Optional)</FormLabel>
                              <FormControl>
                                <Input placeholder="Users" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="chart_config.showLegend"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Show Legend
                              </FormLabel>
                              <FormDescription>
                                Display a legend for the chart
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        variant="outline" 
                        type="button"
                        onClick={() => setActiveTab("query")}
                      >
                        Previous
                      </Button>
                      <Button 
                        type="button"
                        onClick={() => setActiveTab("preview")}
                      >
                        Preview Report
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>

                <TabsContent value="preview" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Report Preview</CardTitle>
                      <CardDescription>
                        Preview how your report will look
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Card className="border-dashed">
                        <CardHeader>
                          <CardTitle>{form.watch("chart_config.title") || form.watch("name")}</CardTitle>
                          <CardDescription>{form.watch("description")}</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[400px]">
                          <ChartContainer 
                            config={{ 
                              primary: { color: "hsl(252 87% 67%)" },
                              secondary: { color: "hsl(155 50% 60%)" }
                            }}
                          >
                            <ReBarChart data={sampleChartData}>
                              <Bar dataKey="users" fill="#8884d8" />
                            </ReBarChart>
                          </ChartContainer>
                        </CardContent>
                      </Card>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        variant="outline" 
                        type="button"
                        onClick={() => setActiveTab("visualization")}
                      >
                        Previous
                      </Button>
                      <Button 
                        type="submit"
                        disabled={isLoading}
                      >
                        {isLoading ? "Creating..." : "Create Report"}
                      </Button>
                    </CardFooter>
                  </Card>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default CreateReportPage;
