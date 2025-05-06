
import { useState } from "react";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Flag, Plus, Trash2, Pencil, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { UserRole } from "@/types/auth";

const featureFlagSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  isEnabled: z.boolean().default(false),
  appliesToRoles: z.array(z.string()).default([]),
});

type FeatureFlagFormValues = z.infer<typeof featureFlagSchema>;

export function FeatureFlagsManager() {
  const { featureFlags, isLoadingFlags, createFeatureFlag, updateFeatureFlag, deleteFeatureFlag, loading } = useFeatureFlags();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFlagId, setEditingFlagId] = useState<string | null>(null);
  
  const form = useForm<FeatureFlagFormValues>({
    resolver: zodResolver(featureFlagSchema),
    defaultValues: {
      name: "",
      description: "",
      isEnabled: false,
      appliesToRoles: [],
    },
  });
  
  const handleToggleFlag = async (id: string, isEnabled: boolean) => {
    try {
      await updateFeatureFlag.mutateAsync({
        id,
        isEnabled: !isEnabled,
      });
    } catch (error) {
      // Error is handled in the mutation
    }
  };
  
  const handleEdit = (flag: any) => {
    setEditingFlagId(flag.id);
    form.reset({
      name: flag.name,
      description: flag.description || "",
      isEnabled: flag.is_enabled,
      appliesToRoles: flag.applies_to_roles || [],
    });
    setIsDialogOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this feature flag?")) {
      try {
        await deleteFeatureFlag.mutateAsync(id);
      } catch (error) {
        // Error is handled in the mutation
      }
    }
  };
  
  const onSubmit = async (values: FeatureFlagFormValues) => {
    try {
      if (editingFlagId) {
        await updateFeatureFlag.mutateAsync({
          id: editingFlagId,
          name: values.name,
          description: values.description,
          isEnabled: values.isEnabled,
          appliesToRoles: values.appliesToRoles as UserRole[],
        });
      } else {
        await createFeatureFlag.mutateAsync({
          name: values.name,
          description: values.description,
          isEnabled: values.isEnabled,
          appliesToRoles: values.appliesToRoles as UserRole[],
        });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error is handled in the mutation
    }
  };
  
  const resetForm = () => {
    form.reset({
      name: "",
      description: "",
      isEnabled: false,
      appliesToRoles: [],
    });
    setEditingFlagId(null);
  };

  const roleOptions: { value: UserRole; label: string }[] = [
    { value: "admin", label: "Admin" },
    { value: "moderator", label: "Moderator" },
    { value: "user", label: "User" },
  ];

  return (
    <Card className="border-border bg-background/30 backdrop-blur-sm">
      <CardHeader className="border-b border-border/40">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center text-foreground">
              <Flag className="mr-2 h-5 w-5" />
              Feature Flags
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Enable or disable features across the platform
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                New Flag
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingFlagId ? "Edit Feature Flag" : "Create Feature Flag"}</DialogTitle>
                <DialogDescription>
                  {editingFlagId 
                    ? "Update this feature flag settings"
                    : "Create a new feature flag to control functionality in your app"}
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="feature_name" {...field} disabled={!!editingFlagId} />
                        </FormControl>
                        <FormDescription>
                          The unique identifier for this feature flag
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe what this feature flag controls"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Enabled</FormLabel>
                          <FormDescription>
                            Turn this feature on or off
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="appliesToRoles"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Apply To Roles</FormLabel>
                          <FormDescription>
                            Select which roles this feature is available for
                          </FormDescription>
                        </div>
                        {roleOptions.map((role) => (
                          <FormField
                            key={role.value}
                            control={form.control}
                            name="appliesToRoles"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={role.value}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(role.value)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, role.value])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== role.value
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {role.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="submit" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingFlagId ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoadingFlags ? (
          <div className="flex justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : featureFlags.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <Flag className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium text-foreground">No feature flags</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first feature flag to get started
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {featureFlags.map((flag) => (
                  <TableRow key={flag.id}>
                    <TableCell className="font-medium">{flag.name}</TableCell>
                    <TableCell>{flag.description || "-"}</TableCell>
                    <TableCell>
                      {flag.applies_to_roles && flag.applies_to_roles.length > 0 
                        ? flag.applies_to_roles.join(", ") 
                        : "All"}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={flag.is_enabled}
                        onCheckedChange={() => handleToggleFlag(flag.id, flag.is_enabled)}
                        disabled={loading}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(flag)}
                          disabled={loading}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(flag.id)}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
