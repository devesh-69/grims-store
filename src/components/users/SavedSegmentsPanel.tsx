
import { SavedSegment } from "@/types/user";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserCheck, Calendar, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface SavedSegmentsPanelProps {
  segments: SavedSegment[];
  activeSegment: string | null;
  onActivateSegment: (segmentId: string) => void;
}

export function SavedSegmentsPanel({
  segments,
  activeSegment,
  onActivateSegment,
}: SavedSegmentsPanelProps) {
  if (segments.length === 0) {
    return (
      <div className="p-4 text-center bg-secondary/50 rounded-lg border border-dashed border-border">
        <UserCheck className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
        <h3 className="font-medium">No saved segments</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Save filters as segments for quick access
        </p>
      </div>
    );
  }

  const getSegmentIcon = (segment: SavedSegment) => {
    const conditions = segment.filter_criteria.conditions;
    
    // Check if segment is related to spending
    const spendCondition = conditions.find(c => c.field === "spend");
    if (spendCondition) {
      return <DollarSign className="h-5 w-5 text-primary" />;
    }
    
    // Check if segment is related to status
    const statusCondition = conditions.find(c => c.field === "status");
    if (statusCondition) {
      return <UserCheck className="h-5 w-5 text-primary" />;
    }
    
    // Default icon
    return <Calendar className="h-5 w-5 text-primary" />;
  };

  return (
    <div className="bg-secondary/50 rounded-lg overflow-hidden">
      <ScrollArea className="h-[400px]">
        <div className="p-2 space-y-2">
          {segments.map((segment) => (
            <button
              key={segment.id}
              className={cn(
                "w-full text-left p-3 rounded-md hover:bg-accent flex items-center space-x-3",
                activeSegment === segment.id ? "bg-accent" : "bg-card"
              )}
              onClick={() => onActivateSegment(segment.id)}
            >
              <div className="shrink-0">
                {getSegmentIcon(segment)}
              </div>
              <div className="flex-grow min-w-0">
                <h4 className="font-medium truncate">{segment.name}</h4>
                {segment.description && (
                  <p className="text-sm text-muted-foreground truncate">
                    {segment.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Created {format(new Date(segment.created_at), "MMM d, yyyy")}
                </p>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
