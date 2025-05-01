import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminNav from "@/components/admin/AdminNav";
import { useReportTemplate, useReportComments, useAddComment, useDeleteReportTemplate, useCreateShareLink } from "@/hooks/useReports";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { FileDown, Share2, MoreHorizontal, Trash, Calendar, Download, Edit, Copy, ChevronLeft } from "lucide-react";
import { CommentsSection } from "@/components/reports/CommentsSection";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { ChartContainer } from "@/components/ui/chart";
import { LineChart, Line } from "recharts";

// Sample data for charts
const sampleChartData = [
  { month: 'Jan', users: 500, revenue: 8000 },
  { month: 'Feb', users: 600, revenue: 10000 },
  { month: 'Mar', users: 750, revenue: 12000 },
  { month: 'Apr', users: 900, revenue: 15000 },
  { month: 'May', users: 1100, revenue: 20000 },
  { month: 'Jun', users: 1300, revenue: 22000 },
];

const ReportDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shareUrl, setShareUrl] = useState("");
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const { data: report, isLoading } = useReportTemplate(id);
  const { data: comments, isLoading: isLoadingComments } = useReportComments(id);
  const { mutate: addComment } = useAddComment();
  const { mutate: deleteReport } = useDeleteReportTemplate();
  const { mutate: createShareLink } = useCreateShareLink();
  
  const handleDeleteReport = () => {
    if (!id) return;
    
    deleteReport(id, {
      onSuccess: () => {
        navigate("/admin/reports");
      }
    });
    
    setIsDeleteDialogOpen(false);
  };
  
  const handleCreateShareLink = (days?: number) => {
    if (!id) return;
    
    const expiresAt = days ? new Date(Date.now() + days * 24 * 60 * 60 * 1000) : undefined;
    
    createShareLink({ templateId: id, expiresAt }, {
      onSuccess: (data) => {
        const shareUrl = `${window.location.origin}/share/${data.share_token}`;
        setShareUrl(shareUrl);
        setIsShareDialogOpen(true);
      }
    });
  };
  
  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard");
  };
  
  const handleAddComment = (content: string, parentId?: string) => {
    if (!id) return;
    
    addComment({
      template_id: id,
      user_id: "current-user-id", // This would be the actual user ID in a real app
      content,
      parent_id: parentId
    });
  };

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
          
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : report ? (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold">{report.name}</h1>
                  <p className="text-muted-foreground">
                    {report.description || "No description provided"}
                  </p>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Calendar className="h-4 w-4 mr-1" />
                    Last updated {format(new Date(report.updated_at), "PPP")}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleCreateShareLink()}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                  
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/admin/reports/edit/${report.id}`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Report
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(`/admin/reports/schedule/${report.id}`)}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleCreateShareLink(7)}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share (1 week access)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCreateShareLink(30)}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share (1 month access)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCreateShareLink()}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share (Unlimited)
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setIsDeleteDialogOpen(true)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <Tabs defaultValue="visualization" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="visualization">Visualization</TabsTrigger>
                  <TabsTrigger value="data">Data</TabsTrigger>
                  <TabsTrigger value="sql">SQL Query</TabsTrigger>
                  <TabsTrigger value="discussion">Discussion</TabsTrigger>
                </TabsList>
                
                <TabsContent value="visualization" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>{report.name}</CardTitle>
                      <CardDescription>
                        {report.chart_type} chart
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[500px]">
                      <ChartContainer 
                        config={{ 
                          primary: { color: "hsl(252 87% 67%)" },
                          secondary: { color: "hsl(155 50% 60%)" }
                        }}
                      >
                        <LineChart data={sampleChartData}>
                          <Line type="monotone" dataKey="users" stroke="#8884d8" />
                          <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
                        </LineChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="data" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Data Table</CardTitle>
                      <CardDescription>
                        Raw data used for this report
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Alert className="bg-secondary/50">
                        <AlertDescription>
                          Data table would be loaded here from the SQL query results
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="sql" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>SQL Query</CardTitle>
                      <CardDescription>
                        The SQL query used to generate this report
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-secondary p-4 rounded-md overflow-x-auto">
                        <pre className="text-sm">
                          <code>{report.sql_query}</code>
                        </pre>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="discussion" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Discussion</CardTitle>
                      <CardDescription>
                        Comments and annotations on this report
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isLoadingComments ? (
                        <div className="flex justify-center items-center h-40">
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                        </div>
                      ) : (
                        <CommentsSection 
                          comments={comments || []} 
                          onAddComment={handleAddComment} 
                        />
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-muted-foreground">Report not found</p>
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Report</DialogTitle>
            <DialogDescription>
              Anyone with this link can view this report
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center space-x-2">
            <Input value={shareUrl} readOnly />
            <Button size="icon" variant="outline" onClick={handleCopyShareLink}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsShareDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Report</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this report? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteReport}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReportDetailsPage;
