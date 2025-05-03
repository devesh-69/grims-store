
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { BlogEditorProps, BlogFormData } from "@/types/blog-admin";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Upload, Link, Info, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const blogFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  coverImage: z.string().url("Must be a valid URL"),
  date: z.date().optional(),
  status: z.string().default("draft"),
  category: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().min(50, "Meta description should be at least 50 characters").max(160, "Meta description should be less than 160 characters").optional().or(z.literal("")),
  canonicalUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  keywords: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  twitterTitle: z.string().optional(),
  twitterDescription: z.string().optional(),
});

type BlogFormValues = z.infer<typeof blogFormSchema>;

export function BlogEditor({ blog, onSave, onCancel }: BlogEditorProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contentWordCount, setContentWordCount] = useState(0);
  const [readabilityScore, setReadabilityScore] = useState(0);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  
  // Content analysis
  const analyzeContent = (content: string) => {
    // Count words
    const words = content.trim().split(/\s+/).length;
    setContentWordCount(words);
    
    // Simple readability score (0-100)
    // This is a simplified version - you might want to implement a proper algorithm
    const avgSentenceLength = content.split(/[.!?]+/).filter(Boolean).reduce((sum, sentence) => {
      return sum + sentence.trim().split(/\s+/).length;
    }, 0) / (content.split(/[.!?]+/).filter(Boolean).length || 1);
    
    const avgWordLength = content.split(/\s+/).reduce((sum, word) => {
      return sum + word.length;
    }, 0) / (content.split(/\s+/).length || 1);
    
    // Lower is better for readability
    let score = 100 - (avgSentenceLength * 4) - (avgWordLength * 3);
    setReadabilityScore(Math.max(0, Math.min(100, score)));
  };
  
  // Initialize the form with the blog data or default values
  const form = useForm<BlogFormValues>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: blog
      ? {
          title: blog.title,
          excerpt: blog.excerpt,
          content: blog.content,
          coverImage: blog.coverImage,
          date: blog.date ? new Date(blog.date) : new Date(),
          status: blog.status || "draft",
          category: blog.category || "",
          metaTitle: blog.seo?.metaTitle || "",
          metaDescription: blog.seo?.metaDescription || "",
          canonicalUrl: blog.seo?.canonicalUrl || "",
          keywords: blog.seo?.keywords || "",
          ogTitle: blog.socialPreview?.ogTitle || "",
          ogDescription: blog.socialPreview?.ogDescription || "",
          twitterTitle: blog.socialPreview?.twitterTitle || "",
          twitterDescription: blog.socialPreview?.twitterDescription || "",
        }
      : {
          title: "",
          excerpt: "",
          content: "",
          coverImage: "",
          date: new Date(),
          status: "draft",
          category: "",
          metaTitle: "",
          metaDescription: "",
          canonicalUrl: "",
          keywords: "",
          ogTitle: "",
          ogDescription: "",
          twitterTitle: "",
          twitterDescription: "",
        },
  });

  // Update content analysis when content changes
  useEffect(() => {
    const content = form.watch("content");
    analyzeContent(content);
  }, [form.watch("content")]);

  // Update cover image preview when the URL changes
  useEffect(() => {
    const coverImage = form.watch("coverImage");
    if (coverImage) {
      setCoverImagePreview(coverImage);
    } else {
      setCoverImagePreview(null);
    }
  }, [form.watch("coverImage")]);

  // Handle form submission
  const onSubmit = async (data: BlogFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Convert form data to the required format
      const formattedData: BlogFormData = {
        id: blog?.id,
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage,
        date: data.date ? format(data.date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
        author: {
          id: user?.id || blog?.author.id || "anonymous",
          name: user?.email?.split('@')[0] || blog?.author.name || "Anonymous",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (user?.id || blog?.author.id || "anonymous"),
        },
        status: data.status,
        category: data.category,
        seo: {
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          canonicalUrl: data.canonicalUrl,
          keywords: data.keywords,
        },
        socialPreview: {
          ogTitle: data.ogTitle,
          ogDescription: data.ogDescription,
          twitterTitle: data.twitterTitle,
          twitterDescription: data.twitterDescription,
        },
      };

      await onSave(formattedData);
    } catch (error) {
      console.error("Error saving blog:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateStructure = () => {
    const template = `# Introduction
A brief overview of what this post will cover.

## Key Point One
Explain your first main point here.

### Sub-point
Supporting details for key point one.

## Key Point Two
Explain your second main point here.

### Sub-point
Supporting details for key point two.

## Key Point Three
Explain your third main point here.

### Sub-point
Supporting details for key point three.

# Conclusion
Summarize the key takeaways from this post.`;

    form.setValue("content", template);
  };

  return (
    <div className="bg-background rounded-lg shadow p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="content" aria-label="Content tab">Content</TabsTrigger>
              <TabsTrigger value="seo" aria-label="SEO tab">SEO</TabsTrigger>
              <TabsTrigger value="social" aria-label="Social Preview tab">Social Preview</TabsTrigger>
              <TabsTrigger value="settings" aria-label="Settings tab">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="title">Title</FormLabel>
                        <FormControl>
                          <Input
                            id="title"
                            placeholder="Enter blog title"
                            {...field}
                            aria-required="true"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="excerpt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="excerpt">Excerpt</FormLabel>
                        <FormControl>
                          <Textarea
                            id="excerpt"
                            placeholder="Brief summary of the blog post"
                            className="resize-none h-20"
                            {...field}
                            aria-required="true"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Content</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateStructure}
                    >
                      Generate Structure
                    </Button>
                  </div>

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Textarea
                            id="content"
                            placeholder="Write your blog post content here..."
                            className="resize-none min-h-[400px] font-mono"
                            {...field}
                            aria-required="true"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-6">
                  <div className="bg-secondary/50 p-4 rounded-lg space-y-4">
                    <h3 className="font-medium">Content Analysis</h3>
                    <div>
                      <p className="text-sm text-muted-foreground">Word count</p>
                      <p className="font-medium">{contentWordCount} words</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Readability</p>
                      <div className="relative mt-1 h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "absolute h-full",
                            readabilityScore > 70 ? "bg-green-500" :
                            readabilityScore > 40 ? "bg-yellow-500" : "bg-red-500"
                          )} 
                          style={{ width: `${readabilityScore}%` }}
                        />
                      </div>
                      <p className="text-xs mt-1">
                        {readabilityScore > 70 ? "Easy to read" :
                         readabilityScore > 40 ? "Moderate" : "Difficult to read"}
                      </p>
                    </div>

                    <div className="pt-2">
                      <h4 className="text-sm font-medium mb-2">Suggestions</h4>
                      <ul className="text-xs space-y-2">
                        {contentWordCount < 300 && (
                          <li className="flex items-start gap-2">
                            <span className="text-yellow-500">●</span>
                            <span>Consider adding more content (aim for 300+ words)</span>
                          </li>
                        )}
                        {readabilityScore < 50 && (
                          <li className="flex items-start gap-2">
                            <span className="text-yellow-500">●</span>
                            <span>Try using shorter sentences to improve readability</span>
                          </li>
                        )}
                        <li className="flex items-start gap-2">
                          <span className="text-green-500">●</span>
                          <span>Use headings to structure your content</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="coverImage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="coverImage">Cover Image URL</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              id="coverImage"
                              placeholder="https://example.com/image.jpg"
                              {...field}
                              aria-required="true"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2"
                              onClick={() => {
                                // In a real app, this would open an image selector
                                form.setValue("coverImage", "https://picsum.photos/800/400");
                                setCoverImagePreview("https://picsum.photos/800/400");
                              }}
                            >
                              <Upload className="h-4 w-4" />
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />

                        {coverImagePreview ? (
                          <div className="mt-2 relative aspect-video w-full overflow-hidden rounded-lg border border-border">
                            <img
                              src={coverImagePreview}
                              alt="Cover preview"
                              className="h-full w-full object-cover"
                              onError={() => setCoverImagePreview(null)}
                            />
                          </div>
                        ) : (
                          <div className="mt-2 flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/10">
                            <div className="text-center">
                              <Image className="mx-auto h-12 w-12 text-muted-foreground" />
                              <p className="mt-2 text-sm text-muted-foreground">No image preview</p>
                            </div>
                          </div>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="category">Category</FormLabel>
                        <FormControl>
                          <Input
                            id="category"
                            placeholder="e.g. Technology, Travel"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="status">Publication Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger id="status">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="published">Published</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel htmlFor="date">Publication Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                id="date"
                                aria-label="Select date"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() || date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="seo" className="space-y-6">
              <div className="bg-secondary/50 p-4 rounded-lg mb-6">
                <h3 className="font-medium flex items-center">
                  <Info className="h-4 w-4 mr-2" />
                  SEO Best Practices
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Optimize your blog post for search engines by filling out these fields.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="metaTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="metaTitle">
                        Meta Title
                        <span className="ml-1 text-xs text-muted-foreground">(Optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="metaTitle"
                          placeholder="SEO title (defaults to post title if empty)"
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">
                        Characters: {field.value?.length || 0}/60
                        {field.value && field.value.length > 60 && (
                          <span className="text-destructive"> (Too long)</span>
                        )}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="keywords">
                        Keywords
                        <span className="ml-1 text-xs text-muted-foreground">(Optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          id="keywords"
                          placeholder="e.g. blog, tech, tutorial (comma separated)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="metaDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="metaDescription">
                      Meta Description
                      <span className="ml-1 text-xs text-muted-foreground">(Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        id="metaDescription"
                        placeholder="Brief description for search engines (150-160 characters recommended)"
                        className="resize-none h-20"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      Characters: {field.value?.length || 0}/160
                      {field.value && field.value.length > 160 && (
                        <span className="text-destructive"> (Too long)</span>
                      )}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="canonicalUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="canonicalUrl">
                      Canonical URL
                      <span className="ml-1 text-xs text-muted-foreground">(Optional)</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          id="canonicalUrl"
                          placeholder="https://example.com/original-post"
                          {...field}
                        />
                        <Link className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      Use this if this content appears elsewhere to avoid duplicate content issues.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </TabsContent>
            
            <TabsContent value="social" className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium">Social Media Preview</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Customize how your post appears when shared on social media.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Facebook / Open Graph</h3>
                  
                  <FormField
                    control={form.control}
                    name="ogTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="ogTitle">
                          OG Title
                          <span className="ml-1 text-xs text-muted-foreground">(Optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="ogTitle"
                            placeholder="Title for Facebook (defaults to post title if empty)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="ogDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="ogDescription">
                          OG Description
                          <span className="ml-1 text-xs text-muted-foreground">(Optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            id="ogDescription"
                            placeholder="Description for Facebook (defaults to meta description if empty)"
                            className="resize-none h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Twitter Card</h3>
                  
                  <FormField
                    control={form.control}
                    name="twitterTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="twitterTitle">
                          Twitter Title
                          <span className="ml-1 text-xs text-muted-foreground">(Optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            id="twitterTitle"
                            placeholder="Title for Twitter (defaults to post title if empty)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="twitterDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="twitterDescription">
                          Twitter Description
                          <span className="ml-1 text-xs text-muted-foreground">(Optional)</span>
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            id="twitterDescription"
                            placeholder="Description for Twitter (defaults to meta description if empty)"
                            className="resize-none h-20"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Social Preview</h3>
                <div className="border rounded-lg p-4">
                  <div className="max-w-md mx-auto">
                    <div className="border rounded-md overflow-hidden">
                      <div className="aspect-[1.91/1] bg-gray-100">
                        {coverImagePreview ? (
                          <img
                            src={coverImagePreview}
                            alt="Social preview"
                            className="w-full h-full object-cover"
                            onError={() => {}}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Image className="h-10 w-10 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="p-3 bg-gray-50">
                        <p className="font-medium text-blue-600 truncate">
                          {window.location.host}
                        </p>
                        <h4 className="font-bold truncate mt-1">
                          {form.watch("ogTitle") || form.watch("title") || "Your post title here"}
                        </h4>
                        <p className="text-gray-500 text-sm line-clamp-2 mt-1">
                          {form.watch("ogDescription") || form.watch("metaDescription") || form.watch("excerpt") || "Your post description will appear here. Make sure to write a compelling description."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium">Additional Settings</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure additional settings for your blog post.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* You can add more settings here when needed */}
                <div className="col-span-1 md:col-span-2">
                  <p className="text-muted-foreground text-sm">
                    Additional settings like commenting options, featured status, or other blog-specific options would be configured here.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                  Saving...
                </>
              ) : blog?.id ? "Update Post" : "Publish Post"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
