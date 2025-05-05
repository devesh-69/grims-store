
import { useState } from "react";
import { useRoles, UserRole } from "@/hooks/useRoles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Trash2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface RoleManagerProps {
  userId: string;
  userName?: string;
}

export function RoleManager({ userId, userName = "User" }: RoleManagerProps) {
  const { user } = useAuth();
  const { userRoles, isLoadingRoles, assignRole, removeRole, loading } = useRoles(userId);
  const [selectedRole, setSelectedRole] = useState<UserRole>("viewer");
  
  const handleAssignRole = async () => {
    if (!selectedRole) {
      toast.error("Please select a role to assign");
      return;
    }
    
    try {
      await assignRole.mutateAsync({ userId, role: selectedRole });
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const handleRemoveRole = async (roleId: string, roleName: string) => {
    // Prevent removing the only admin role
    if (roleName === "admin" && 
        userRoles.filter(r => r.role === "admin").length <= 1 &&
        userId === user?.id) {
      toast.error("Cannot remove the last admin role from yourself");
      return;
    }
    
    try {
      await removeRole.mutateAsync(roleId);
    } catch (error) {
      // Error is handled in the mutation
    }
  };

  const roleColors: Record<UserRole, string> = {
    admin: "bg-red-100 text-red-800 border-red-200",
    editor: "bg-blue-100 text-blue-800 border-blue-200",
    viewer: "bg-green-100 text-green-800 border-green-200"
  };

  const roleDescriptions: Record<UserRole, string> = {
    admin: "Full access to all system functions",
    editor: "Can create and edit content but not manage users or settings",
    viewer: "Read-only access to content"
  };

  return (
    <Card className="border-border bg-background/30 backdrop-blur-sm">
      <CardHeader className="border-b border-border/40">
        <CardTitle className="flex items-center text-foreground">
          <Shield className="mr-2 h-5 w-5" />
          User Roles
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Manage roles for {userName}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5">
        {isLoadingRoles ? (
          <div className="flex justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2 text-foreground">Current Roles</h3>
              <div className="flex flex-wrap gap-2">
                {userRoles.length === 0 ? (
                  <span className="text-sm text-muted-foreground">No roles assigned</span>
                ) : (
                  userRoles.map((userRole) => (
                    <Badge 
                      key={userRole.id} 
                      variant="outline" 
                      className={`flex items-center ${roleColors[userRole.role as UserRole]}`}
                    >
                      {userRole.role}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 ml-1 p-0 hover:bg-transparent"
                        onClick={() => handleRemoveRole(userRole.id, userRole.role)}
                        disabled={loading}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))
                )}
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <Select 
                  defaultValue={selectedRole} 
                  onValueChange={(value) => setSelectedRole(value as UserRole)}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  onClick={handleAssignRole}
                  disabled={loading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>Assign Role</>
                  )}
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {roleDescriptions[selectedRole]}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
