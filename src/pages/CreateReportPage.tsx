import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useCreateReportTemplate } from "@/hooks/useReports";
import { ReportTemplate } from "@/types/report";
import { toast } from "sonner";

const CreateReportPage = () => {
  const navigate = useNavigate();
  const { mutate: createReportTemplate } = useCreateReportTemplate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    chart_type: "line",
    chart_config: {
      title: "",
      xAxisLabel: "",
      yAxisLabel: "",
      showLegend: true,
    },
    sql_query: "",
    is_public: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.chart_type || !formData.sql_query) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    const templateData: Omit<ReportTemplate, "id" | "created_at" | "updated_at"> = {
      name: formData.name,
      description: formData.description || "",
      chart_type: formData.chart_type,
      chart_config: formData.chart_config,
      sql_query: formData.sql_query,
      is_public: formData.is_public
    };
    
    try {
      await createReportTemplate(templateData);
      navigate("/admin/reports");
    } catch (error) {
      console.error("Error creating report:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChartConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      chart_config: {
        ...prev.chart_config,
        [name]: type === "checkbox" ? checked : value,
      },
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      chart_type: value,
    }));
  };

  return (
    <Layout>
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle>Create Report Template</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="chart_type">Chart Type</Label>
                  <Select onValueChange={handleSelectChange}>
                    <SelectTrigger id="chart_type">
                      <SelectValue placeholder="Select a chart type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="line">Line</SelectItem>
                      <SelectItem value="bar">Bar</SelectItem>
                      <SelectItem value="pie">Pie</SelectItem>
                      <SelectItem value="donut">Donut</SelectItem>
                      <SelectItem value="area">Area</SelectItem>
                      <SelectItem value="scatter">Scatter</SelectItem>
                      <SelectItem value="heatmap">Heatmap</SelectItem>
                      <SelectItem value="funnel">Funnel</SelectItem>
                      <SelectItem value="radar">Radar</SelectItem>
                      <SelectItem value="table">Table</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="chart_config_title">Chart Title</Label>
                  <Input
                    type="text"
                    id="chart_config_title"
                    name="title"
                    value={formData.chart_config.title || ""}
                    onChange={handleChartConfigChange}
                  />
                </div>
                <div>
                  <Label htmlFor="chart_config_xAxisLabel">X Axis Label</Label>
                  <Input
                    type="text"
                    id="chart_config_xAxisLabel"
                    name="xAxisLabel"
                    value={formData.chart_config.xAxisLabel || ""}
                    onChange={handleChartConfigChange}
                  />
                </div>
                <div>
                  <Label htmlFor="chart_config_yAxisLabel">Y Axis Label</Label>
                  <Input
                    type="text"
                    id="chart_config_yAxisLabel"
                    name="yAxisLabel"
                    value={formData.chart_config.yAxisLabel || ""}
                    onChange={handleChartConfigChange}
                  />
                </div>
                <div>
                  <Label htmlFor="chart_config_showLegend">Show Legend</Label>
                  <Switch
                    id="chart_config_showLegend"
                    name="showLegend"
                    checked={formData.chart_config.showLegend || false}
                    onCheckedChange={(checked) => {
                      setFormData(prev => ({
                        ...prev,
                        chart_config: {
                          ...prev.chart_config,
                          showLegend: checked,
                        },
                      }));
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="sql_query">SQL Query</Label>
                  <Textarea
                    id="sql_query"
                    name="sql_query"
                    value={formData.sql_query}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="is_public">Is Public</Label>
                  <Switch
                    id="is_public"
                    name="is_public"
                    checked={formData.is_public}
                    onCheckedChange={(checked) => {
                      setFormData(prev => ({
                        ...prev,
                        is_public: checked,
                      }));
                    }}
                  />
                </div>
                <CardFooter>
                  <Button type="submit">Create Report</Button>
                </CardFooter>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default CreateReportPage;
