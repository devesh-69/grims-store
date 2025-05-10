
import { useEffect, useState } from "react";
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
import { Save, Trash, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

// Define the settings schema
const settingsSchema = z.object({
  siteName: z.string().min(2, { message: "Site name must be at least 2 characters." }),
  emailNotifications: z.boolean().default(true),
  darkMode: z.boolean().default(true),
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
  const [isLoading, setIsLoading] = useState(false);
  
  const defaultSettings: SettingsValues = {
    siteName: "Grim's Store",
    emailNotifications: true,
    darkMode: true,
    language: "en",
    itemsPerPage: 20,
    autoSave: true,
    maintenanceMode: false,
    analyticsEnabled: true,
    debugMode: false,
    apiThrottleLimit: 100,
    cacheLifetime: 4,
  };

  const form = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: defaultSettings,
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("adminSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        Object.keys(parsed).forEach(key => {
          form.setValue(key as any, parsed[key]);
        });
        toast({
          title: "Settings loaded",
          description: "Your saved settings have been loaded.",
        });
      } catch (error) {
        console.error("Error parsing saved settings:", error);
      }
    }
  }, [form, toast]);

  const onSubmit = (values: SettingsValues) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Save settings to localStorage
      localStorage.setItem("adminSettings", JSON.stringify(values));
      
      setIsLoading(false);
      
      // Show success toast
      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully.",
      });
      
      console.log("Settings saved:", values);
    }, 800);
  };

  const resetSettings = () => {
    // Reset form to default values
    Object.keys(defaultSettings).forEach(key => {
      form.setValue(key as any, defaultSettings[key as keyof SettingsValues]);
    });
    
    toast({
      title: "Settings reset",
      description: "All settings have been reset to their default values.",
    });
  };

  return (
    <AdminLayout>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto py-6 space-y-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Settings</h2>
            <p className="text-muted-foreground">
              Manage your admin dashboard preferences and configurations.
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={resetSettings}
              className="flex items-center border-primary/30 text-foreground hover:bg-primary/10 hover:text-primary"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Tabs defaultValue="basic" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 md:w-[400px] bg-background/50">
                <TabsTrigger value="basic" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Basic Settings</TabsTrigger>
                <TabsTrigger value="advanced" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Advanced Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <Card className="border-border bg-background/30 backdrop-blur-sm">
                  <CardHeader className="border-b border-border/40">
                    <CardTitle className="text-foreground">General</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Configure basic settings for your store.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <FormField
                      control={form.control}
                      name="siteName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-foreground">Site Name</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="bg-background/50 border-border text-foreground focus-visible:ring-primary"
                            />
                          </FormControl>
                          <FormDescription className="text-muted-foreground">
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
                          <FormLabel className="text-foreground">Language</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-background/50 border-border text-foreground focus-visible:ring-primary">
                                <SelectValue placeholder="Select a language" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-background border-border">
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="es">Spanish</SelectItem>
                              <SelectItem value="fr">French</SelectItem>
                              <SelectItem value="de">German</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-muted-foreground">
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
                          <FormLabel className="text-foreground">Items Per Page</FormLabel>
                          <FormControl>
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="w-12 text-sm text-muted-foreground">{field.value}</span>
                                <span className="w-12 text-right text-sm text-muted-foreground">100</span>
                              </div>
                              <Slider
                                min={5}
                                max={100}
                                step={5}
                                value={[field.value]}
                                onValueChange={(values) => field.onChange(values[0])}
                                className="[&>span]:bg-primary"
                              />
                            </div>
                          </FormControl>
                          <FormDescription className="text-muted-foreground">
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
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3 bg-background/30">
                            <div className="space-y-0.5">
                              <FormLabel className="text-foreground">Email Notifications</FormLabel>
                              <FormDescription className="text-muted-foreground">
                                Receive email notifications for important events.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="darkMode"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3 bg-background/30">
                            <div className="space-y-0.5">
                              <FormLabel className="text-foreground">Dark Mode</FormLabel>
                              <FormDescription className="text-muted-foreground">
                                Enable dark mode for the admin interface.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
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
                <Card className="border-border bg-background/30 backdrop-blur-sm">
                  <CardHeader className="border-b border-border/40">
                    <CardTitle className="text-foreground">Advanced Settings</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Configure technical settings for your store.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="maintenanceMode"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3 bg-background/30">
                            <div className="space-y-0.5">
                              <FormLabel className="text-foreground">Maintenance Mode</FormLabel>
                              <FormDescription className="text-muted-foreground">
                                Put the site in maintenance mode.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="analyticsEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3 bg-background/30">
                            <div className="space-y-0.5">
                              <FormLabel className="text-foreground">Analytics</FormLabel>
                              <FormDescription className="text-muted-foreground">
                                Enable analytics tracking.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="autoSave"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3 bg-background/30">
                            <div className="space-y-0.5">
                              <FormLabel className="text-foreground">Auto Save</FormLabel>
                              <FormDescription className="text-muted-foreground">
                                Automatically save drafts while editing.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="debugMode"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-3 bg-background/30">
                            <div className="space-y-0.5">
                              <FormLabel className="text-foreground">Debug Mode</FormLabel>
                              <FormDescription className="text-muted-foreground">
                                Show detailed error messages and logs.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
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
                          <FormLabel className="text-foreground">API Rate Limit</FormLabel>
                          <FormControl>
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="w-12 text-sm text-muted-foreground">10</span>
                                <span className="w-12 text-right text-sm text-muted-foreground">1000</span>
                              </div>
                              <Slider
                                min={10}
                                max={1000}
                                step={10}
                                value={[field.value]}
                                onValueChange={(values) => field.onChange(values[0])}
                                className="[&>span]:bg-primary"
                              />
                              <div className="text-sm text-center mt-1 text-muted-foreground">
                                {field.value} requests per minute
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription className="text-muted-foreground">
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
                          <FormLabel className="text-foreground">Cache Lifetime</FormLabel>
                          <FormControl>
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="w-12 text-sm text-muted-foreground">1h</span>
                                <span className="w-12 text-right text-sm text-muted-foreground">24h</span>
                              </div>
                              <Slider
                                min={1}
                                max={24}
                                step={1}
                                value={[field.value]}
                                onValueChange={(values) => field.onChange(values[0])}
                                className="[&>span]:bg-primary"
                              />
                              <div className="text-sm text-center mt-1 text-muted-foreground">
                                {field.value} hour{field.value > 1 ? "s" : ""}
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription className="text-muted-foreground">
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
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2 h-4 w-4"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </motion.div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminSettingsPage;
