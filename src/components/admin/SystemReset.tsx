import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Trash2, UserPlus } from "lucide-react";

export const SystemReset = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const deleteAllUsers = async () => {
    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('api-admin-users', {
        body: {
          action: 'delete-all-users'
        }
      });

      if (error) {
        throw error;
      }

      toast.success(`${data.message}`);
      return true;
    } catch (error: any) {
      toast.error(`Failed to delete users: ${error.message}`);
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const createAdminUser = async () => {
    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('api-admin-users', {
        body: {
          action: 'create-user',
          email: 'tatkaredevesh69@gmail.com',
          password: 'Admin@216#D',
          userData: {
            first_name: 'Admin',
            last_name: 'User'
          }
        }
      });

      if (error) {
        throw error;
      }

      toast.success('Admin user created successfully');
      return true;
    } catch (error: any) {
      toast.error(`Failed to create admin user: ${error.message}`);
      return false;
    } finally {
      setIsCreating(false);
    }
  };

  const handleSystemReset = async () => {
    const deleteSuccess = await deleteAllUsers();
    if (deleteSuccess) {
      // Wait a moment for deletion to complete
      setTimeout(async () => {
        await createAdminUser();
      }, 1000);
    }
  };

  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardHeader>
        <CardTitle className="text-destructive flex items-center">
          <Trash2 className="mr-2 h-5 w-5" />
          System Reset
        </CardTitle>
        <CardDescription>
          Danger Zone: Remove all users and create new admin account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-destructive/10 p-4 rounded-lg">
          <p className="text-sm text-destructive mb-2 font-medium">
            This will permanently delete ALL users from the system and create a new admin user:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Email: tatkaredevesh69@gmail.com</li>
            <li>• Password: Admin@216#D</li>
            <li>• Role: Admin</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                disabled={isDeleting || isCreating}
                className="flex-1"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting Users...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Reset System
                  </>
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all users 
                  from the system and create a new admin account. All user data, blogs, 
                  reviews, and other content will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleSystemReset}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, Reset System
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button 
            variant="outline" 
            onClick={createAdminUser}
            disabled={isCreating || isDeleting}
            className="flex-1"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Admin Only
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};