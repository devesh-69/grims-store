
import { useState, useEffect } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTitle } from "@/hooks/useTitle";
import { FeatureFlagsManager } from "@/components/admin/FeatureFlags";
import { RoleManager } from "@/components/admin/RoleManager";
import { useAuth } from "@/contexts/AuthContext";
import { Shield, Table } from "lucide-react";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

interface UserListItem {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  lastSignIn?: string;
}

const AdminSecurityPage = () => {
  useTitle("Security & Permissions | Admin");
  const { user, checkUserRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();

  // Fetch users to assign roles
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data: authUsers, error: authError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          created_at,
          last_login
        `)
        .order('created_at', { ascending: false });

      if (authError) {
        toast.error(`Failed to load users: ${authError.message}`);
        return [];
      }

      // Get emails from auth.users
      const { data: authData, error: emailsError } = await supabase
        .rpc('get_users_with_emails');

      if (emailsError) {
        toast.error(`Failed to load user emails: ${emailsError.message}`);
        return authUsers.map((u: any) => ({
          id: u.id,
          email: "Email protected",
          firstName: u.first_name || "",
          lastName: u.last_name || "",
          createdAt: u.created_at,
          lastSignIn: u.last_login,
        }));
      }

      // Combine the data
      const emailMap = new Map();
      if (authData) {
        authData.forEach((item: any) => {
          emailMap.set(item.id, item.email);
        });
      }

      return authUsers.map((user: any) => ({
        id: user.id,
        email: emailMap.get(user.id) || "Email protected",
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        createdAt: user.created_at,
        lastSignIn: user.last_login,
      }));
    },
    enabled: checkUserRole('admin'),
  });

  const filteredUsers = searchQuery 
    ? users.filter((user) => 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.firstName && user.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.lastName && user.lastName.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : users;

  return (
    <AdminLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">Security & Permissions</h2>
          <p className="text-muted-foreground">
            Manage user roles, feature flags and security settings
          </p>
        </div>

        <Tabs defaultValue="roles" className="w-full">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="roles">User Roles</TabsTrigger>
            <TabsTrigger value="features">Feature Flags</TabsTrigger>
          </TabsList>

          <TabsContent value="roles" className="space-y-4 pt-4">
            {user?.id && (
              <>
                <Card className="border-border bg-background/30 backdrop-blur-sm">
                  <CardHeader className="border-b border-border/40">
                    <CardTitle className="flex items-center text-foreground">
                      <Table className="mr-2 h-5 w-5" />
                      User Management
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Assign roles to users in the system
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="mb-4">
                      <Input
                        placeholder="Search users by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-sm"
                      />
                    </div>
                    
                    <div className="rounded-md border border-border">
                      <div className="overflow-x-auto">
                        <UITable>
                          <TableHeader>
                            <TableRow>
                              <TableHead>User</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Created</TableHead>
                              <TableHead>Roles</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {isLoadingUsers ? (
                              Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    <Skeleton className="h-5 w-[150px]" />
                                  </TableCell>
                                  <TableCell>
                                    <Skeleton className="h-5 w-[200px]" />
                                  </TableCell>
                                  <TableCell>
                                    <Skeleton className="h-5 w-[100px]" />
                                  </TableCell>
                                  <TableCell>
                                    <Skeleton className="h-8 w-[120px]" />
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : filteredUsers.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-6">
                                  {searchQuery ? "No users found matching your search" : "No users in the system"}
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                  <TableCell>
                                    {user.firstName || user.lastName 
                                      ? `${user.firstName || ''} ${user.lastName || ''}`.trim() 
                                      : 'Unknown User'}
                                  </TableCell>
                                  <TableCell>{user.email}</TableCell>
                                  <TableCell>
                                    {new Date(user.createdAt).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>
                                    <RoleManager 
                                      userId={user.id}
                                      userName={`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </UITable>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="features" className="pt-4">
            <FeatureFlagsManager />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSecurityPage;
