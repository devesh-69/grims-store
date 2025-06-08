
import { useState } from "react";
import { UserFilters, SavedSegment, FilterCriteria } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Save, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface UserFiltersPanelProps {
  filters: UserFilters;
  onFilterChange: (filters: UserFilters) => void;
  onSaveSegment: (segment: Omit<SavedSegment, "id" | "created_at" | "updated_at">) => void;
}

export function UserFiltersPanel({ 
  filters, 
  onFilterChange, 
  onSaveSegment 
}: UserFiltersPanelProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [segmentName, setSegmentName] = useState("");
  const [segmentDescription, setSegmentDescription] = useState("");

  const handleClearFilters = () => {
    onFilterChange({});
  };

  const handleRoleChange = (role: string, checked: boolean) => {
    const roles = filters.roles || [];
    if (checked) {
      onFilterChange({ ...filters, roles: [...roles, role] });
    } else {
      onFilterChange({
        ...filters,
        roles: roles.filter((r) => r !== role),
      });
    }
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    const statuses = filters.status || [];
    if (checked) {
      onFilterChange({ ...filters, status: [...statuses, status] });
    } else {
      onFilterChange({
        ...filters,
        status: statuses.filter((s) => s !== status),
      });
    }
  };

  const handleSourceChange = (source: string, checked: boolean) => {
    const sources = filters.signup_source || [];
    if (checked) {
      onFilterChange({ ...filters, signup_source: [...sources, source] });
    } else {
      onFilterChange({
        ...filters,
        signup_source: sources.filter((s) => s !== source),
      });
    }
  };

  const handleSaveSegment = () => {
    if (!segmentName) return;
    
    // Convert current filters to filter criteria
    const conditions: FilterCriteria["conditions"] = [];
    
    if (filters.roles && filters.roles.length > 0) {
      conditions.push({
        field: "roles",
        operator: "in",
        value: filters.roles,
      });
    }
    
    if (filters.status && filters.status.length > 0) {
      conditions.push({
        field: "status",
        operator: "in",
        value: filters.status,
      });
    }
    
    if (filters.signup_source && filters.signup_source.length > 0) {
      conditions.push({
        field: "signup_source",
        operator: "in",
        value: filters.signup_source,
      });
    }
    
    if (filters.location) {
      conditions.push({
        field: "location",
        operator: "contains",
        value: filters.location,
      });
    }
    
    if (filters.search) {
      conditions.push({
        field: "search",
        operator: "contains",
        value: filters.search,
      });
    }
    
    onSaveSegment({
      name: segmentName,
      description: segmentDescription,
      filter_criteria: {
        conditions,
        conjunction: "and",
      },
    });
    
    setSaveDialogOpen(false);
    setSegmentName("");
    setSegmentDescription("");
  };

  return (
    <div className="space-y-4 p-4 bg-secondary/50 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Filters</h3>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleClearFilters}
          >
            <X className="h-4 w-4 mr-1" /> Clear
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSaveDialogOpen(true)}
          >
            <Save className="h-4 w-4 mr-1" /> Save
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Search by name, email, etc."
            className="mt-1"
            value={filters.search || ""}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          />
        </div>

        <Separator className="my-4" />

        <div>
          <Label className="block mb-2">Role</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="role-admin"
                checked={filters.roles?.includes("admin") || false}
                onCheckedChange={(checked) =>
                  handleRoleChange("admin", checked as boolean)
                }
              />
              <Label htmlFor="role-admin" className="text-sm">Admin</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="role-moderator"
                checked={filters.roles?.includes("moderator") || false}
                onCheckedChange={(checked) =>
                  handleRoleChange("moderator", checked as boolean)
                }
              />
              <Label htmlFor="role-moderator" className="text-sm">Moderator</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="role-user"
                checked={filters.roles?.includes("user") || false}
                onCheckedChange={(checked) =>
                  handleRoleChange("user", checked as boolean)
                }
              />
              <Label htmlFor="role-user" className="text-sm">User</Label>
            </div>
          </div>
        </div>

        <div>
          <Label className="block mb-2">Status</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="status-active"
                checked={filters.status?.includes("active") || false}
                onCheckedChange={(checked) =>
                  handleStatusChange("active", checked as boolean)
                }
              />
              <Label htmlFor="status-active" className="text-sm">Active</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="status-inactive"
                checked={filters.status?.includes("inactive") || false}
                onCheckedChange={(checked) =>
                  handleStatusChange("inactive", checked as boolean)
                }
              />
              <Label htmlFor="status-inactive" className="text-sm">Inactive</Label>
            </div>
          </div>
        </div>

        <div>
          <Label className="block mb-2">Signup Source</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="source-email"
                checked={filters.signup_source?.includes("email") || false}
                onCheckedChange={(checked) =>
                  handleSourceChange("email", checked as boolean)
                }
              />
              <Label htmlFor="source-email" className="text-sm">Email</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="source-google"
                checked={filters.signup_source?.includes("google") || false}
                onCheckedChange={(checked) =>
                  handleSourceChange("google", checked as boolean)
                }
              />
              <Label htmlFor="source-google" className="text-sm">Google</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="source-github"
                checked={filters.signup_source?.includes("github") || false}
                onCheckedChange={(checked) =>
                  handleSourceChange("github", checked as boolean)
                }
              />
              <Label htmlFor="source-github" className="text-sm">GitHub</Label>
            </div>
          </div>
        </div>

        <div>
          <Label className="block mb-2">Location</Label>
          <Input
            id="location"
            placeholder="Filter by location"
            className="mt-1"
            value={filters.location || ""}
            onChange={(e) => onFilterChange({ ...filters, location: e.target.value })}
          />
        </div>
      </div>

      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Segment</DialogTitle>
            <DialogDescription>
              Save this filter combination as a segment for quick access later.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="segment-name">Segment Name</Label>
              <Input
                id="segment-name"
                placeholder="High value customers"
                value={segmentName}
                onChange={(e) => setSegmentName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="segment-description">Description (optional)</Label>
              <Input
                id="segment-description"
                placeholder="Customers who spent over $100"
                value={segmentDescription}
                onChange={(e) => setSegmentDescription(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSegment} disabled={!segmentName}>
              Save Segment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
