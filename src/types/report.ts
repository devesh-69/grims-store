
export type ChartType = 
  | "line" 
  | "bar" 
  | "pie" 
  | "donut" 
  | "area" 
  | "scatter" 
  | "heatmap" 
  | "funnel" 
  | "radar" 
  | "table";

export interface ChartConfig {
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  colors?: string[];
  stacked?: boolean;
  showLegend?: boolean;
  legendPosition?: "top" | "right" | "bottom" | "left";
  customOptions?: Record<string, any>;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description?: string;
  chart_type: ChartType;
  chart_config: ChartConfig;
  sql_query: string;
  created_by?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduledReport {
  id: string;
  template_id: string;
  name: string;
  description?: string;
  schedule: string;
  recipients: {
    email: string;
    name?: string;
  }[];
  format: ("PDF" | "EXCEL" | "CSV" | "DOCX")[];
  last_run_at?: string;
  next_run_at?: string;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ReportShare {
  id: string;
  template_id: string;
  share_token: string;
  expires_at?: string;
  created_by?: string;
  created_at: string;
}

export interface ReportComment {
  id: string;
  template_id: string;
  user_id: string;
  content: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  user?: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
  replies?: ReportComment[];
}

export interface ReportExport {
  id: string;
  template_id?: string;
  scheduled_id?: string;
  format: string;
  file_path: string;
  size_bytes?: number;
  created_by?: string;
  downloaded_count?: number;
  created_at: string;
}

export interface AlertRule {
  id: string;
  name: string;
  description?: string;
  metric_name: string;
  condition: string;
  threshold: number;
  channels: {
    email: boolean;
    slack: boolean;
    in_app: boolean;
  };
  recipients: {
    email?: string;
    slack_channel?: string;
    user_id?: string;
  }[];
  is_active: boolean;
  last_triggered_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface KpiMetric {
  metric: string;
  value: number;
  change_percentage: number;
  period: string;
}

export interface CohortAnalysis {
  cohort_month: string;
  total_users: number;
  total_spend: number | null;
  avg_spend: number | null;
}
