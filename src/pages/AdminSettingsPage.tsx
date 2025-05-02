
import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Save } from "lucide-react";

// Define the settings schema
const settingsSchema = z.object({
  siteName: z.string().min(2, { message: "Site name must be at least 2 characters." }),
  emailNotifications: z.boolean().default(true),
  darkMode: z.boolean().default(false),
  language: z.string().min(1, { message: "Please select a language." }),
  itemsPerPage: z.number().min(5).max(100),
  autoSave: z.boolean().default(true),
  maintenanceMode: z.boolean().default(false),
  analyticsEnabled: z.boolean().default(true),
  debugMode: z.boolean().default(false),
  apiThrottleLimit: z.number().min(10).max(1000),
  cacheLifetime: z.number().min(1).max(24),
});

type SettingsValues = z.infer<typeof settingsSchema>;

const AdminSettingsPage = () => {
  const { toast } = useToast();
  
  const [defaultSettings] = useState<SettingsValues>({
    siteName: "Grim's Store",
    emailNotifications: true,
    darkMode: false,
    language: "en",
    itemsPerPage: 20,
    autoSave: true,
    maintenanceMode: false,
    analyticsEnabled: true,
    debugMode: false,
    apiThrottleLimit: 100,
    cacheLifetime: 4,
  });

  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaultSettings,
  });

  const onSubmit = (values: SettingsValues) => {
    // Save settings to localStorage for demonstration
    localStorage.setItem("adminSettings", JSON.stringify(values));
    
    // Show success toast
    toast({
      title: "Settings saved",
      description: "Your settings have been saved successfully.",
    });
    
    console.log("Settings saved:", values);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            <p className="text-muted-foreground">
              Manage your admin dashboard preferences and configurations.
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
                <TabsTrigger value="basic">Basic Settings</TabsTrigger>
                <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>General</CardTitle>
                    <CardDescription>
                      Configure basic settings for your store.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="siteName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Site Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            The name that appears in the browser tab and emails.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="language"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Language</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="de">German</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            The default language for the admin interface.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="itemsPerPage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Items Per Page</FormLabel>
                          <FormControl>
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="w-12 text-sm">{field.value}</span>
                                <span className="w-12 text-right text-sm">100</span>
                              </div>
                              <Slider
                                min={5}
                                max={100}
                                step={5}
                                value={[field.value]}
                                onValueChange={(values) => field.onChange(values[0])}
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            Number of items to display per page in lists and tables.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Email Notifications</FormLabel>
                              <FormDescription>
                                Receive email notifications for important events.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="darkMode"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Dark Mode</FormLabel>
                              <FormDescription>
                                Enable dark mode for the admin interface.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Settings</CardTitle>
                    <CardDescription>
                      Configure technical settings for your store.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="maintenanceMode"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Maintenance Mode</FormLabel>
                              <FormDescription>
                                Put the site in maintenance mode.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="analyticsEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Analytics</FormLabel>
                              <FormDescription>
                                Enable analytics tracking.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="autoSave"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Auto Save</FormLabel>
                              <FormDescription>
                                Automatically save drafts while editing.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="debugMode"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <FormLabel>Debug Mode</FormLabel>
                              <FormDescription>
                                Show detailed error messages and logs.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="apiThrottleLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Rate Limit</FormLabel>
                          <FormControl>
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="w-12 text-sm">10</span>
                                <span className="w-12 text-right text-sm">1000</span>
                              </div>
                              <Slider
                                min={10}
                                max={1000}
                                step={10}
                                value={[field.value]}
                                onValueChange={(values) => field.onChange(values[0])}
                              />
                              <div className="text-sm text-center mt-1">
                                {field.value} requests per minute
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            Maximum number of API requests allowed per minute.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cacheLifetime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cache Lifetime</FormLabel>
                          <FormControl>
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="w-12 text-sm">1h</span>
                                <span className="w-12 text-right text-sm">24h</span>
                              </div>
                              <Slider
                                min={1}
                                max={24}
                                step={1}
                                value={[field.value]}
                                onValueChange={(values) => field.onChange(values[0])}
                              />
                              <div className="text-sm text-center mt-1">
                                {field.value} hour{field.value > 1 ? "s" : ""}
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription>
                            How long cached data should be stored.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end">
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AdminLayout>
  );
};

export default AdminSettingsPage;
