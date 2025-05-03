
import { useState, useEffect } from "react";
import { useTitle } from "@/hooks/useTitle";
import AdminLayout from "@/components/admin/AdminLayout";
import { UserProfile, UserFilters, SavedSegment } from "@/types/user";
import { UsersTable } from "@/components/users/UsersTable";
import { UserFiltersPanel } from "@/components/users/UserFiltersPanel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SavedSegmentsPanel } from "@/components/users/SavedSegmentsPanel";
import { UserStats } from "@/components/users/UserStats";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Filter, Save, Download, UserPlus, UsersRound, UserCheck } from "lucide-react";

const AdminUsersPage = () => {
  useTitle("User Management | Admin");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<UserFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [savedSegments, setSavedSegments] = useState<SavedSegment[]>([]);
  const [activeSegment, setActiveSegment] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    fetchUsers();
    fetchSavedSegments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, filters, activeSegment]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch from Supabase
      // const { data, error } = await supabase
      //   .from('profiles')
      //   .select('*, user_roles(role)')
      
      // For now, we'll use mock data
      setTimeout(() => {
        const mockUsers: UserProfile[] = Array(20)
          .fill(0)
          .map((_, index) => ({
            id: `user-${index}`,
            email: `user${index}@example.com`,
            first_name: `First${index}`,
            last_name: `Last${index}`,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`,
            status: index % 5 === 0 ? "inactive" : "active",
            company: index % 3 === 0 ? `Company ${index}` : undefined,
            location: index % 4 === 0 ? "New York" : index % 4 === 1 ? "London" : index % 4 === 2 ? "Tokyo" : "Sydney",
            signup_source: index % 3 === 0 ? "google" : index % 3 === 1 ? "email" : "github",
            created_at: new Date(Date.now() - index * 86400000).toISOString(),
            updated_at: new Date(Date.now() - index * 43200000).toISOString(),
            last_login: index % 3 === 0 ? new Date(Date.now() - index * 3600000).toISOString() : undefined,
            roles: index % 10 === 0 ? ["admin"] : index % 5 === 0 ? ["moderator"] : ["user"],
            spend: index * 10.5,
            custom_attributes: index % 2 === 0 ? { preferences: { theme: "dark" } } : undefined,
          }));
        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
      setIsLoading(false);
    }
  };

  const fetchSavedSegments = async () => {
    try {
      // In a real implementation, this would fetch from Supabase
      // const { data, error } = await supabase.from('saved_segments').select('*')
      
      // For now, we'll use mock data
      const mockSegments: SavedSegment[] = [
        {
          id: "segment-1",
          name: "High Spenders",
          description: "Users who spent more than $100",
          filter_criteria: {
            conditions: [{ field: "spend", operator: "greater_than", value: 100 }],
            conjunction: "and",
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "segment-2",
          name: "Inactive Users",
          description: "Users who haven't logged in for 30 days",
          filter_criteria: {
            conditions: [{ field: "status", operator: "equals", value: "inactive" }],
            conjunction: "and",
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      setSavedSegments(mockSegments);
    } catch (error) {
      console.error("Error fetching segments:", error);
    }
  };

  const applyFilters = () => {
    if (activeSegment) {
      const segment = savedSegments.find((s) => s.id === activeSegment);
      if (segment) {
        // Apply segment filters - in real implementation, this would be more complex
        const filtered = users.filter((user) => {
          const criteria = segment.filter_criteria;
          return criteria.conditions.every((condition) => {
            if (condition.field === "spend" && condition.operator === "greater_than") {
              return user.spend && user.spend > (condition.value as number);
            }
            if (condition.field === "status" && condition.operator === "equals") {
              return user.status === condition.value;
            }
            return true;
          });
        });
        setFilteredUsers(filtered);
        return;
      }
    }

    let result = [...users];

    // Apply filters
    if (filters.roles && filters.roles.length > 0) {
      result = result.filter((user) =>
        user.roles.some((role) => filters.roles?.includes(role))
      );
    }

    if (filters.status && filters.status.length > 0) {
      result = result.filter((user) =>
        user.status && filters.status?.includes(user.status)
      );
    }

    if (filters.location) {
      result = result.filter((user) =>
        user.location?.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    if (filters.signup_source && filters.signup_source.length > 0) {
      result = result.filter((user) =>
        user.signup_source && filters.signup_source?.includes(user.signup_source)
      );
    }

    if (filters.min_spend !== undefined) {
      result = result.filter((user) =>
        user.spend !== undefined && user.spend >= filters.min_spend!
      );
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (user) =>
          user.email?.toLowerCase().includes(search) ||
          user.first_name?.toLowerCase().includes(search) ||
          user.last_name?.toLowerCase().includes(search) ||
          user.company?.toLowerCase().includes(search)
      );
    }

    setFilteredUsers(result);
  };

  const handleFilterChange = (newFilters: UserFilters) => {
    setFilters(newFilters);
    setActiveSegment(null);
  };

  const handleSaveSegment = async (segment: Omit<SavedSegment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // In a real implementation, this would save to Supabase
      // const { data, error } = await supabase.from('saved_segments').insert({
      //   ...segment,
      //   created_by: auth.user().id,
      // })

      const newSegment: SavedSegment = {
        ...segment,
        id: `segment-${savedSegments.length + 1}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setSavedSegments([...savedSegments, newSegment]);
      toast.success("Segment saved successfully");
    } catch (error) {
      console.error("Error saving segment:", error);
      toast.error("Failed to save segment");
    }
  };

  const handleExportUsers = () => {
    // In a real implementation, this would call a Supabase Edge Function
    // to generate and download a CSV file
    const usersToExport = selectedUsers.length > 0
      ? filteredUsers.filter((user) => selectedUsers.includes(user.id))
      : filteredUsers;
      
    if (usersToExport.length === 0) {
      toast.error("No users selected for export");
      return;
    }
    
    toast.success(`Exporting ${usersToExport.length} users...`);
    // Mock export
    setTimeout(() => {
      toast.success("Users exported successfully");
    }, 1500);
  };

  const handleBulkAction = (action: string) => {
    if (selectedUsers.length === 0) {
      toast.error("No users selected");
      return;
    }

    // In a real implementation, this would call a Supabase Edge Function
    // to perform the bulk action
    toast.success(`Performing ${action} on ${selectedUsers.length} users...`);
    
    // Mock action
    setTimeout(() => {
      if (action === "activate") {
        setUsers(users.map(u => 
          selectedUsers.includes(u.id) ? {...u, status: "active"} : u
        ));
        toast.success(`${selectedUsers.length} users activated`);
      } else if (action === "deactivate") {
        setUsers(users.map(u => 
          selectedUsers.includes(u.id) ? {...u, status: "inactive"} : u
        ));
        toast.success(`${selectedUsers.length} users deactivated`);
      }
      setSelectedUsers([]);
    }, 1000);
  };

  const handleActivateSegment = (segmentId: string) => {
    setActiveSegment(segmentId);
    setFilters({});
  };

  return (
    <AdminLayout>
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground">
              Manage, filter, and take actions on your users
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="border-primary/30 text-foreground hover:bg-primary/10 hover:text-primary"
            >
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
            <Button 
              variant="outline"
              onClick={handleExportUsers} 
              disabled={isLoading}
              className="border-primary/30 text-foreground hover:bg-primary/10 hover:text-primary"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button 
              variant="default"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        <UserStats users={users} />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {showFilters && (
            <div className="md:col-span-1">
              <Tabs defaultValue="filters" className="bg-background/30 rounded-lg border border-border p-1">
                <TabsList className="w-full bg-background/50">
                  <TabsTrigger value="filters" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Filters</TabsTrigger>
                  <TabsTrigger value="segments" className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Segments</TabsTrigger>
                </TabsList>
                <TabsContent value="filters" className="mt-4">
                  <UserFiltersPanel
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onSaveSegment={handleSaveSegment}
                  />
                </TabsContent>
                <TabsContent value="segments" className="mt-4">
                  <SavedSegmentsPanel
                    segments={savedSegments}
                    activeSegment={activeSegment}
                    onActivateSegment={handleActivateSegment}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}

          <div className={`${showFilters ? "md:col-span-3" : "md:col-span-4"}`}>
            <div className="bg-background/30 border border-border rounded-lg shadow backdrop-blur-sm">
              {selectedUsers.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-primary/10 rounded-t-lg border-b border-border">
                  <p className="text-sm font-medium text-foreground">
                    {selectedUsers.length} users selected
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction("activate")}
                      className="border-primary/30 hover:bg-primary/10 hover:text-primary"
                    >
                      <UserCheck className="mr-2 h-4 w-4" />
                      Activate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkAction("deactivate")}
                      className="border-primary/30 hover:bg-primary/10 hover:text-primary"
                    >
                      <UsersRound className="mr-2 h-4 w-4" />
                      Deactivate
                    </Button>
                  </div>
                </div>
              )}
              <UsersTable
                users={filteredUsers}
                isLoading={isLoading}
                selectedUsers={selectedUsers}
                onSelectUsers={setSelectedUsers}
              />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;
