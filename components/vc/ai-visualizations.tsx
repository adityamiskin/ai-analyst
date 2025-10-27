"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ComposedChart,
  Legend,
} from "recharts";
import { api } from "@/convex/_generated/api";
import { useAction } from "convex/react";
import { CompanySnapshot } from "./snapshot";

// Define CompanyWithId type locally
export type CompanyWithId = CompanySnapshot & {
  id: string;
  logo?: string;
  description: string;
};
import { Loader2, TrendingUp, BarChart3 } from "lucide-react";

type VisualizationData = Record<string, any>[];

type Visualization = {
  type: "bar" | "line" | "area" | "pie" | "radar" | "scatter" | "composed";
  title: string;
  description: string;
  data: VisualizationData;
  config: {
    xAxis?: string;
    yAxis?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
    colors?: string[];
    showLegend?: boolean;
    showTooltip?: boolean;
  };
  insights: string[];
};

interface AIVisualizationsProps {
  company: CompanyWithId | CompanySnapshot;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7c7c",
  "#8dd1e1",
];

function renderChart(visualization: Visualization) {
  const { type, data, config } = visualization;
  const colors = config.colors || COLORS;

  switch (type) {
    case "bar":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey={config.xAxis || "name"} />
            <YAxis />
            {config.showTooltip && <Tooltip />}
            {config.showLegend && <Legend />}
            {Object.keys(data[0] || {})
              .filter((key) => key !== (config.xAxis || "name"))
              .map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={colors[index % colors.length]}
                  name={key.charAt(0).toUpperCase() + key.slice(1)}
                />
              ))}
          </BarChart>
        </ResponsiveContainer>
      );

    case "line":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey={config.xAxis || "name"} />
            <YAxis />
            {config.showTooltip && <Tooltip />}
            {config.showLegend && <Legend />}
            {Object.keys(data[0] || {})
              .filter((key) => key !== (config.xAxis || "name"))
              .map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  name={key.charAt(0).toUpperCase() + key.slice(1)}
                />
              ))}
          </LineChart>
        </ResponsiveContainer>
      );

    case "area":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <XAxis dataKey={config.xAxis || "name"} />
            <YAxis />
            {config.showTooltip && <Tooltip />}
            {config.showLegend && <Legend />}
            {Object.keys(data[0] || {})
              .filter((key) => key !== (config.xAxis || "name"))
              .map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stackId="1"
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  name={key.charAt(0).toUpperCase() + key.slice(1)}
                />
              ))}
          </AreaChart>
        </ResponsiveContainer>
      );

    case "pie":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: any) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry: any, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            {config.showTooltip && <Tooltip />}
            {config.showLegend && <Legend />}
          </PieChart>
        </ResponsiveContainer>
      );

    case "radar":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey={config.xAxis || "name"} />
            <PolarRadiusAxis />
            {Object.keys(data[0] || {})
              .filter((key) => key !== (config.xAxis || "name"))
              .map((key, index) => (
                <Radar
                  key={key}
                  name={key.charAt(0).toUpperCase() + key.slice(1)}
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.3}
                />
              ))}
            {config.showTooltip && <Tooltip />}
            {config.showLegend && <Legend />}
          </RadarChart>
        </ResponsiveContainer>
      );

    case "scatter":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart data={data}>
            <XAxis dataKey={config.xAxis || "x"} type="number" />
            <YAxis dataKey={config.yAxis || "y"} type="number" />
            {config.showTooltip && <Tooltip />}
            {config.showLegend && <Legend />}
            <Scatter name="Data Points" fill={colors[0]} />
          </ScatterChart>
        </ResponsiveContainer>
      );

    case "composed":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <XAxis dataKey={config.xAxis || "name"} />
            <YAxis />
            {config.showTooltip && <Tooltip />}
            {config.showLegend && <Legend />}
            {/* Render bars and lines based on data structure */}
            {Object.keys(data[0] || {})
              .filter((key) => key !== (config.xAxis || "name"))
              .map((key, index) => {
                if (index % 2 === 0) {
                  return (
                    <Bar
                      key={key}
                      dataKey={key}
                      fill={colors[index % colors.length]}
                      name={key}
                    />
                  );
                } else {
                  return (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={colors[index % colors.length]}
                      name={key}
                    />
                  );
                }
              })}
          </ComposedChart>
        </ResponsiveContainer>
      );

    default:
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Chart type not supported
        </div>
      );
  }
}

export default function AIVisualizations({ company }: AIVisualizationsProps) {
  const [visualizations, setVisualizations] = useState<Visualization[]>([]);
  const [loading, setLoading] = useState(true);
  const generateVisualizations = useAction(
    api.ai.generateCompanyVisualizations,
  );

  const selectedCompany = company;

  useEffect(() => {
    async function loadVisualizations() {
      try {
        setLoading(true);
        const result = await generateVisualizations({
          companyId: "id" in selectedCompany ? selectedCompany.id : undefined,
          companyData: {
            company: selectedCompany.company,
            sector: selectedCompany.sector,
            stage: selectedCompany.stage,
            metrics: selectedCompany.metrics.map((m) => ({
              key: m.key,
              label: m.label,
              value: m.value,
              unit: m.unit,
              peerMedian: m.peerMedian,
            })),
            risks: selectedCompany.risks,
          },
        });
        setVisualizations(result.visualizations);
      } catch (error) {
        console.error("Failed to generate visualizations:", error);
        // Fallback visualizations are handled in the action
      } finally {
        setLoading(false);
      }
    }

    loadVisualizations();
  }, [selectedCompany, generateVisualizations]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            AI-Generated Visualizations
          </CardTitle>
          <CardDescription>
            Generating insightful charts and visualizations...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center space-y-2">
              <BarChart3 className="h-8 w-8 mx-auto text-muted-foreground animate-pulse" />
              <p className="text-sm text-muted-foreground">
                Creating visualizations...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (visualizations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Visualizations</CardTitle>
          <CardDescription>
            Unable to generate visualizations at this time.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            AI-Generated Visualizations
          </CardTitle>
          <CardDescription>
            Smart insights and visualizations powered by AI analysis
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visualizations.map((viz, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{viz.title}</CardTitle>
              <CardDescription>{viz.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">{renderChart(viz)}</div>
              {viz.insights.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium">Key Insights:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {viz.insights.map((insight, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
