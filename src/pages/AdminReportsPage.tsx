
import { useState } from "react";
import { Link } from "react-router-dom";
import AdminNav from "@/components/admin/AdminNav";
import { 
  useReportTemplates, 
  useUserKpis, 
  useCohortAnalysis 
} from "@/hooks/useReports";
import { ReportCard } from "@/components/reports/ReportCard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ReportMetricsGrid } from "@/components/reports/ReportMetricsGrid";
import { CohortTable } from "@/components/reports/CohortTable";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileText, LineChart, BarChart, PieChart, AlertTriangle, Plus, Calendar } from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";

const AdminReportsPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: templates, isLoading: isLoadingTemplates } = useReportTemplates();
  const { data: kpis, isLoading: isLoadingKpis } = useUserKpis();
  const { data: cohortData, isLoading: isLoadingCohorts } = useCohortAnalysis();

  const isLoading = isLoadingTemplates || isLoadingKpis || isLoadingCohorts;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminNav />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Analytics & Reporting</h1>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link to="/admin/scheduled-reports">
                  <Calendar className="mr-2 h-4 w-4" />
                  Scheduled Reports
                </Link>
              </Button>
              <Button asChild>
                <Link to="/admin/reports/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Report
                </Link>
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="reports">My Reports</TabsTrigger>
              <TabsTrigger value="cohorts">Cohort Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {isLoadingKpis ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ReportMetricsGrid metrics={kpis || []} />
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Recent Reports</CardTitle>
                  <CardDescription>
                    Quick access to your most recent report templates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {isLoadingTemplates ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="animate-pulse h-40 bg-secondary/50"></Card>
                      ))
                    ) : templates && templates.length > 0 ? (
                      templates.slice(0, 3).map((template) => (
                        <ReportCard key={template.id} report={template} />
                      ))
                    ) : (
                      <Card className="col-span-full p-6 text-center border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-6">
                          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">No report templates found</p>
                          <Button asChild className="mt-4">
                            <Link to="/admin/reports/create">Create your first report</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/admin/reports">View all reports</Link>
                  </Button>
                </CardFooter>
              </Card>

              <Alert variant="default" className="bg-secondary/50">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Analytics tip</AlertTitle>
                <AlertDescription>
                  You can set up automatic alerts when important metrics change. Go to 
                  <Button variant="link" asChild className="p-0 h-auto">
                    <Link to="/admin/reports/alerts"> Alert Settings</Link>
                  </Button>
                  .
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="md:col-span-3">
                  <CardHeader>
                    <CardTitle>My Reports</CardTitle>
                    <CardDescription>
                      All your saved report templates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {isLoadingTemplates ? (
                        Array.from({ length: 6 }).map((_, i) => (
                          <Card key={i} className="animate-pulse h-40 bg-secondary/50"></Card>
                        ))
                      ) : templates && templates.length > 0 ? (
                        templates.map((template) => (
                          <ReportCard key={template.id} report={template} />
                        ))
                      ) : (
                        <Card className="col-span-full p-6 text-center border-dashed">
                          <CardContent className="flex flex-col items-center justify-center py-6">
                            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No report templates found</p>
                            <Button asChild className="mt-4">
                              <Link to="/admin/reports/create">Create your first report</Link>
                            </Button>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="cohorts" className="space-y-4">
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>User Cohort Analysis</CardTitle>
                  <CardDescription>User growth and spending by cohort month</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingCohorts ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : cohortData && cohortData.length > 0 ? (
                    <>
                      <CohortTable data={cohortData} />
                      <div className="h-80 mt-8">
                        <ChartContainer 
                          config={{ 
                            primary: { color: "hsl(252 87% 67%)" },
                            secondary: { color: "hsl(155 50% 60%)" }
                          }}
                        >
                          {/* Chart will be rendered here */}
                        </ChartContainer>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No cohort data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AdminReportsPage;
