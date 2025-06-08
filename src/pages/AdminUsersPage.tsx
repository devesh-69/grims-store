
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
import { useQuery } from "@tanstack/react-query";

const AdminUsersPage = () => {
  useTitle("User Management | Admin");
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [filters, setFilters] = useState<UserFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [savedSegments, setSavedSegments] = useState<SavedSegment[]>([]);
  const [activeSegment, setActiveSegment] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  // Fetch users from profiles table
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async (): Promise<UserProfile[]> => {
      console.log('Fetching users from profiles table...');
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      console.log('Fetched profiles:', profiles);

      // Try to get user emails from edge function (admin only)
      let userEmails: { [key: string]: string } = {};
      try {
        const { data: emailData, error: emailError } = await supabase.functions.invoke('api-admin-users/get-users-with-emails');
        if (!emailError && emailData) {
          emailData.forEach((user: any) => {
            userEmails[user.id] = user.email;
          });
        }
      } catch (error) {
        console.log('Could not fetch emails (user may not be admin):', error);
      }

      // Map profiles to UserProfile format
      const userProfiles: UserProfile[] = profiles.map((profile): UserProfile => ({
        id: profile.id,
        email: userEmails[profile.id] || 'Email not available',
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        avatar_url: profile.avatar_url || '',
        status: (profile.status || 'active') as any,
        company: profile.company || '',
        location: profile.location || '',
        signup_source: profile.signup_source || '',
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        last_login: profile.last_login || undefined,
        roles: ['user'], // Default role, will be updated if we can fetch actual roles
        spend: profile.spend || 0,
        custom_attributes: profile.custom_attributes || {},
        referral_code: profile.referral_code || '',
      }));

      return userProfiles;
    }
  });

  useEffect(() => {
    fetchSavedSegments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, filters, activeSegment]);

  const fetchSavedSegments = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_segments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const segments: SavedSegment[] = data.map(segment => ({
        id: segment.id,
        name: segment.name,
        description: segment.description,
        filter_criteria: segment.filter_criteria,
        created_by: segment.created_by,
        created_at: segment.created_at,
        updated_at: segment.updated_at,
      }));
      
      setSavedSegments(segments);
    } catch (error) {
      console.error("Error fetching segments:", error);
    }
  };

  const applyFilters = () => {
    if (activeSegment) {
      const segment = savedSegments.find((s) => s.id === activeSegment);
      if (segment) {
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
        user.roles?.some((role) => filters.roles?.includes(role))
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
      const { data, error } = await supabase
        .from('saved_segments')
        .insert({
          name: segment.name,
          description: segment.description,
          filter_criteria: segment.filter_criteria,
        })
        .select()
        .single();

      if (error) throw error;
      
      const newSegment: SavedSegment = {
        id: data.id,
        name: data.name,
        description: data.description,
        filter_criteria: data.filter_criteria,
        created_by: data.created_by,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };
      
      setSavedSegments([newSegment, ...savedSegments]);
      toast.success("Segment saved successfully");
    } catch (error) {
      console.error("Error saving segment:", error);
      toast.error("Failed to save segment");
    }
  };

  const handleExportUsers = () => {
    const usersToExport = selectedUsers.length > 0
      ? filteredUsers.filter((user) => selectedUsers.includes(user.id))
      : filteredUsers;
      
    if (usersToExport.length === 0) {
      toast.error("No users selected for export");
      return;
    }
    
    // Create CSV content
    const headers = ['ID', 'Email', 'First Name', 'Last Name', 'Status', 'Company', 'Location', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...usersToExport.map(user => [
        user.id,
        user.email || '',
        user.first_name || '',
        user.last_name || '',
        user.status || '',
        user.company || '',
        user.location || '',
        user.created_at
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    toast.success(`Exported ${usersToExport.length} users successfully`);
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) {
      toast.error("No users selected");
      return;
    }

    try {
      if (action === "activate" || action === "deactivate") {
        const newStatus = action === "activate" ? "active" : "inactive";
        
        const { error } = await supabase
          .from('profiles')
          .update({ status: newStatus })
          .in('id', selectedUsers);

        if (error) throw error;

        toast.success(`${selectedUsers.length} users ${action}d successfully`);
        setSelectedUsers([]);
        refetch();
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.error(`Failed to ${action} users`);
    }
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
