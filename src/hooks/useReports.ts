
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  ReportTemplate, 
  ScheduledReport, 
  ReportComment, 
  ReportShare,
  KpiMetric,
  CohortAnalysis
} from "@/types/report";

export const useReportTemplates = () => {
  return useQuery({
    queryKey: ["reportTemplates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("report_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to fetch report templates");
        throw error;
      }
      
      return data as ReportTemplate[];
    }
  });
};

export const useReportTemplate = (id?: string) => {
  return useQuery({
    queryKey: ["reportTemplate", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("report_templates")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast.error("Failed to fetch report template");
        throw error;
      }
      
      return data as ReportTemplate;
    },
    enabled: !!id
  });
};

export const useCreateReportTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (template: Omit<ReportTemplate, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("report_templates")
        .insert({
          name: template.name,
          description: template.description,
          chart_type: template.chart_type,
          chart_config: template.chart_config as any, // Cast to any to resolve type issues
          sql_query: template.sql_query,
          is_public: template.is_public
        })
        .select()
        .single();

      if (error) {
        toast.error("Failed to create report template");
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      toast.success("Report template created successfully");
      queryClient.invalidateQueries({ queryKey: ["reportTemplates"] });
    }
  });
};

export const useUpdateReportTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      template 
    }: { 
      id: string, 
      template: Partial<Omit<ReportTemplate, "id" | "created_at" | "updated_at">> 
    }) => {
      const updateData: any = {
        ...template,
        updated_at: new Date().toISOString()
      };
      
      // Ensure chart_config is properly handled
      if (template.chart_config) {
        updateData.chart_config = template.chart_config;
      }

      const { data, error } = await supabase
        .from("report_templates")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        toast.error("Failed to update report template");
        throw error;
      }
      
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success("Report template updated successfully");
      queryClient.invalidateQueries({ queryKey: ["reportTemplates"] });
      queryClient.invalidateQueries({ queryKey: ["reportTemplate", variables.id] });
    }
  });
};

export const useDeleteReportTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("report_templates")
        .delete()
        .eq("id", id);

      if (error) {
        toast.error("Failed to delete report template");
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Report template deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["reportTemplates"] });
    }
  });
};

export const useScheduledReports = () => {
  return useQuery({
    queryKey: ["scheduledReports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scheduled_reports")
        .select("*, report_templates(name)")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to fetch scheduled reports");
        throw error;
      }
      
      return data as (ScheduledReport & { report_templates: { name: string } })[];
    }
  });
};

export const useCreateScheduledReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (report: Omit<ScheduledReport, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("scheduled_reports")
        .insert(report)
        .select()
        .single();

      if (error) {
        toast.error("Failed to create scheduled report");
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      toast.success("Scheduled report created successfully");
      queryClient.invalidateQueries({ queryKey: ["scheduledReports"] });
    }
  });
};

export const useReportComments = (templateId?: string) => {
  return useQuery({
    queryKey: ["reportComments", templateId],
    queryFn: async () => {
      if (!templateId) return [];
      
      const { data, error } = await supabase
        .from("report_comments")
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq("template_id", templateId)
        .order("created_at", { ascending: true });

      if (error) {
        toast.error("Failed to fetch report comments");
        throw error;
      }
      
      // Structure comments as a tree with proper type handling
      const comments = data.map(comment => ({
        ...comment,
        user: comment.profiles ? {
          first_name: comment.profiles.first_name,
          last_name: comment.profiles.last_name, 
          avatar_url: comment.profiles.avatar_url
        } : undefined,
        replies: []
      }));
      
      const commentMap = new Map();
      const rootComments: ReportComment[] = [];
      
      comments.forEach(comment => {
        commentMap.set(comment.id, comment);
      });
      
      comments.forEach(comment => {
        if (comment.parent_id) {
          const parent = commentMap.get(comment.parent_id);
          if (parent) {
            parent.replies = parent.replies || [];
            parent.replies.push(comment);
          }
        } else {
          rootComments.push(comment);
        }
      });
      
      return rootComments;
    },
    enabled: !!templateId
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (comment: Omit<ReportComment, "id" | "created_at" | "updated_at" | "user" | "replies">) => {
      const { data, error } = await supabase
        .from("report_comments")
        .insert(comment)
        .select()
        .single();

      if (error) {
        toast.error("Failed to add comment");
        throw error;
      }
      
      return data;
    },
    onSuccess: (_, variables) => {
      toast.success("Comment added successfully");
      queryClient.invalidateQueries({ queryKey: ["reportComments", variables.template_id] });
    }
  });
};

export const useCreateShareLink = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      templateId, 
      expiresAt 
    }: { 
      templateId: string, 
      expiresAt?: Date 
    }) => {
      const shareToken = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);
      
      const { data, error } = await supabase
        .from("report_shares")
        .insert({
          template_id: templateId,
          share_token: shareToken,
          expires_at: expiresAt ? expiresAt.toISOString() : null
        })
        .select()
        .single();

      if (error) {
        toast.error("Failed to create share link");
        throw error;
      }
      
      return data;
    },
    onSuccess: () => {
      toast.success("Share link created successfully");
      queryClient.invalidateQueries({ queryKey: ["reportShares"] });
    }
  });
};

export const useUserKpis = () => {
  return useQuery({
    queryKey: ["userKpis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_user_kpis');

      if (error) {
        toast.error("Failed to fetch user KPIs");
        throw error;
      }
      
      return data as KpiMetric[];
    }
  });
};

export const useCohortAnalysis = () => {
  return useQuery({
    queryKey: ["cohortAnalysis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_cohorts")
        .select("*")
        .order("cohort_month", { ascending: true });

      if (error) {
        toast.error("Failed to fetch cohort analysis");
        throw error;
      }
      
      return data as CohortAnalysis[];
    }
  });
};
