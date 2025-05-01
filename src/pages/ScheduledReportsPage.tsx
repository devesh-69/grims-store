
import { useState } from "react";
import { Link } from "react-router-dom";
import AdminNav from "@/components/admin/AdminNav";
import { useScheduledReports } from "@/hooks/useReports";
import { ScheduledReport } from "@/types/report";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, Clock, MoreVertical, Play, Pause, Edit, Trash, Plus, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

const ScheduledReportsPage = () => {
  const [activeTab, setActiveTab] = useState("active");
  const { data: scheduledReports, isLoading } = useScheduledReports();

  const activeReports = scheduledReports?.filter(report => report.is_active) || [];
  const inactiveReports = scheduledReports?.filter(report => !report.is_active) || [];

  const formatSchedule = (schedule: string) => {
    // Simple cron translator for common patterns
    if (schedule === "0 0 * * *") return "Daily at midnight";
    if (schedule === "0 0 * * 0") return "Weekly on Sunday";
    if (schedule === "0 0 1 * *") return "Monthly on the 1st";
    if (schedule === "0 0 1 1 *") return "Yearly on Jan 1";
    return schedule;
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "Never";
    return format(new Date(dateStr), "MMM d, yyyy 'at' h:mm a");
  };

  const getFormatBadges = (formats: string[]) => {
    return formats.map(format => (
      <Badge key={format} variant="outline" className="mr-1">
        {format}
      </Badge>
    ));
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminNav />
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Scheduled Reports</h1>
              <p className="text-muted-foreground">
                Set up automated reports to be sent via email
              </p>
            </div>
            <Button asChild>
              <Link to="/admin/reports/schedule">
                <Plus className="mr-2 h-4 w-4" />
                New Schedule
              </Link>
            </Button>
          </div>

          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="active">
                Active
                <Badge className="ml-2 bg-primary/20 text-primary border-0">
                  {activeReports.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="inactive">
                Paused
                <Badge className="ml-2 bg-muted text-muted-foreground border-0">
                  {inactiveReports.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {["active", "inactive"].map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {tab === "active" ? "Active Schedules" : "Paused Schedules"}
                    </CardTitle>
                    <CardDescription>
                      {tab === "active" ? 
                        "Reports that are currently scheduled to run automatically" : 
                        "Reports that are configured but not actively running"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    ) : (tab === "active" ? activeReports : inactiveReports).length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Report</TableHead>
                              <TableHead>Schedule</TableHead>
                              <TableHead>Recipients</TableHead>
                              <TableHead>Format</TableHead>
                              <TableHead>Last Run</TableHead>
                              <TableHead>Next Run</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(tab === "active" ? activeReports : inactiveReports).map((report) => (
                              <TableRow key={report.id}>
                                <TableCell className="font-medium">
                                  <Link 
                                    to={`/admin/reports/${report.template_id}`}
                                    className="flex items-center text-primary hover:underline"
                                  >
                                    {report.report_templates.name}
                                    <ExternalLink className="ml-1 h-3 w-3" />
                                  </Link>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {report.description || "No description"}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                                    {formatSchedule(report.schedule)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {report.recipients.length} recipient{report.recipients.length !== 1 ? 's' : ''}
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap">
                                    {getFormatBadges(report.format)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center text-muted-foreground">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {formatDate(report.last_run_at)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {formatDate(report.next_run_at)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <Switch 
                                      checked={report.is_active} 
                                      disabled 
                                      className="mr-2"
                                    />
                                    {report.is_active ? "Active" : "Paused"}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>
                                        <Edit className="mr-2 h-4 w-4" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Play className="mr-2 h-4 w-4" />
                                        Run Now
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        {report.is_active ? (
                                          <>
                                            <Pause className="mr-2 h-4 w-4" />
                                            Pause
                                          </>
                                        ) : (
                                          <>
                                            <Play className="mr-2 h-4 w-4" />
                                            Activate
                                          </>
                                        )}
                                      </DropdownMenuItem>
                                      <DropdownMenuItem className="text-destructive focus:text-destructive">
                                        <Trash className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-10 border border-dashed rounded-md bg-secondary/30">
                        <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                        <h3 className="text-lg font-medium mb-1">No scheduled reports</h3>
                        <p className="text-muted-foreground mb-4">
                          {tab === "active" ? 
                            "You don't have any active scheduled reports" : 
                            "You don't have any paused scheduled reports"}
                        </p>
                        <Button asChild>
                          <Link to="/admin/reports/schedule">Create schedule</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            ))}

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Execution History</CardTitle>
                  <CardDescription>
                    Recent report executions and their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* This would show the history of report executions */}
                  <div className="text-center py-10 border border-dashed rounded-md bg-secondary/30">
                    <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-lg font-medium mb-1">No execution history</h3>
                    <p className="text-muted-foreground">
                      Run a report to see its execution history
                    </p>
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

export default ScheduledReportsPage;
