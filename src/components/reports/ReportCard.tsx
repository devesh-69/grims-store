
import { Link } from "react-router-dom";
import { ReportTemplate } from "@/types/report";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { formatDistance } from "date-fns";
import { LineChart, BarChart, PieChart, Clock, MoreVertical, Share, Download, Edit, Trash } from "lucide-react";

interface ReportCardProps {
  report: ReportTemplate;
  onDelete?: (id: string) => void;
  onShare?: (id: string) => void;
}

export function ReportCard({ report, onDelete, onShare }: ReportCardProps) {
  const getChartIcon = () => {
    switch (report.chart_type) {
      case "line":
      case "area":
        return <LineChart className="h-5 w-5 text-primary" />;
      case "bar":
      case "donut":
      case "funnel":
        return <BarChart className="h-5 w-5 text-primary" />;
      case "pie":
      case "radar":
      case "scatter":
        return <PieChart className="h-5 w-5 text-primary" />;
      default:
        return <LineChart className="h-5 w-5 text-primary" />;
    }
  };
  
  const formattedDate = formatDistance(
    new Date(report.updated_at),
    new Date(),
    { addSuffix: true }
  );

  return (
    <Card className="overflow-hidden h-full transition-all hover:shadow-md hover:shadow-primary/20 hover:-translate-y-1">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            {getChartIcon()}
            <Badge variant="outline" className="ml-2">
              {report.chart_type}
            </Badge>
          </div>
          {(onDelete || onShare) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onShare && (
                  <DropdownMenuItem onClick={() => onShare(report.id)}>
                    <Share className="mr-2 h-4 w-4" />
                    Share
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to={`/admin/reports/${report.id}`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/admin/reports/${report.id}`}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Link>
                </DropdownMenuItem>
                {onDelete && (
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(report.id)}
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <CardTitle className="line-clamp-1">{report.name}</CardTitle>
        <CardDescription className="line-clamp-2">
          {report.description || "No description provided"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="mr-1 h-3 w-3" />
          <span>Updated {formattedDate}</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link to={`/admin/reports/${report.id}`}>
            View Report
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
