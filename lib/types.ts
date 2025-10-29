import * as z from "zod";
import type { UseFormReturn } from "react-hook-form";
import type { Doc, Id } from "@/convex/_generated/dataModel";

// ============================================================================
// CORE VALIDATION SCHEMAS (Source of truth)
// ============================================================================

// Base schemas that match Convex validators
const fileRefSchema = z.object({
  name: z.string(),
  size: z.number(),
  file: z.instanceof(File).optional(),
  storageId: z.string().optional(),
  mediaType: z.string().optional(),
});

const founderSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  designation: z.string().min(1, "Designation is required"),
});

// Analysis validators - match Convex schema validators
const sourceSchema = z.object({
  title: z.string(),
  url: z.string(),
  date: z.string(),
  confidence: z.number(),
  extractedFacts: z.array(z.string()),
});

const checkSchema = z.object({
  label: z.string(),
  status: z.enum(["pass", "warn"]),
  note: z.string().optional(),
});

const metricSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.number(),
  unit: z.string().optional(),
  peerMedian: z.number().optional(),
  sources: z.array(sourceSchema),
  checks: z.array(checkSchema),
});

const riskSchema = z.object({
  severity: z.enum(["low", "med", "high"]),
  label: z.string(),
  evidence: z.string(),
});

const agentAnalysisSchema = z.object({
  agentId: z.string(),
  agentName: z.string(),
  summary: z.string(),
  confidence: z.number(),
  keyFindings: z.array(z.string()),
  metrics: z.array(metricSchema),
  risks: z.array(riskSchema),
  sources: z.array(sourceSchema),
  recommendations: z.array(z.string()),
  lastUpdated: z.string(),
});

// Form validation schema
const formSchema = z.object({
  company: z.object({
    name: z.string().min(1, "Company name is required"),
    website: z.string().url("Valid website URL is required"),
    location: z.string().min(1, "Location is required"),
    oneLiner: z.string().min(1, "One-liner is required"),
    stage: z.string().min(1, "Stage is required"),
    whatDoYouDo: z.string().min(1, "Description is required"),
    whyNow: z.string().min(1, "Why now explanation is required"),
  }),
  team: z.object({
    founders: z.array(founderSchema).min(1, "At least one founder is required"),
    isFullTime: z.boolean(),
    howLongWorked: z.string().min(1, "Work duration is required"),
    relevantExperience: z.string().min(1, "Relevant experience is required"),
  }),
  product: z.object({
    description: z.string().min(1, "Product description is required"),
    demoUrl: z.string().url("Valid demo URL is required").or(z.literal("")),
    defensibility: z.string().min(1, "Defensibility explanation is required"),
    videoUrl: z.string().url("Valid video URL is required").or(z.literal("")),
  }),
  market: z.object({
    customer: z.string().min(1, "Customer description is required"),
    competitors: z.string().min(1, "Competitor analysis is required"),
    differentiation: z.string().min(1, "Differentiation is required"),
    gtm: z.string().min(1, "Go-to-market strategy is required"),
    tam: z.string(),
    sam: z.string(),
    som: z.string(),
  }),
  traction: z.object({
    isLaunched: z.string().min(1, "Launch status is required"),
    launchDate: z.string(),
    mrr: z.string(),
    growth: z.string(),
    activeUsersCount: z.string(),
    pilots: z.string(),
    kpis: z.string(),
  }),
  documents: z.object({
    pitchDeck: z.array(fileRefSchema),
    other: z.array(fileRefSchema),
  }),
});

// ============================================================================
// INFERRED TYPES (All derived from schemas - no duplication)
// ============================================================================

export type FileRef = z.infer<typeof fileRefSchema>;
export type Founder = Doc<"founderApplications">["team"]["founders"];
export type Source =
  Doc<"multiAgentAnalyses">["snapshot"]["agentAnalyses"][number]["sources"];
export type Check =
  Doc<"multiAgentAnalyses">["snapshot"]["consolidatedMetrics"][number]["checks"];
export type Metric =
  Doc<"multiAgentAnalyses">["snapshot"]["agentAnalyses"][number]["metrics"];
export type Risk =
  Doc<"multiAgentAnalyses">["snapshot"]["agentAnalyses"][number]["risks"];
export type AgentAnalysisResult =
  Doc<"multiAgentAnalyses">["snapshot"]["agentAnalyses"];
export type MultiAgentSnapshot = Doc<"multiAgentAnalyses">["snapshot"];

export type FormData = z.infer<typeof formSchema>;
export type CompanyFormData = z.infer<typeof formSchema.shape.company>;
export type TeamFormData = z.infer<typeof formSchema.shape.team>;
export type ProductFormData = z.infer<typeof formSchema.shape.product>;
export type MarketFormData = z.infer<typeof formSchema.shape.market>;
export type TractionFormData = z.infer<typeof formSchema.shape.traction>;
export type DocumentsFormData = z.infer<typeof formSchema.shape.documents>;

// ============================================================================
// FORM HOOK TYPES (Used in components)
// ============================================================================

export type CompanyTabForm = UseFormReturn<FormData>;
export type TeamTabForm = UseFormReturn<FormData>;
export type ProductTabForm = UseFormReturn<FormData>;
export type MarketTabForm = UseFormReturn<FormData>;
export type TractionTabForm = UseFormReturn<FormData>;
export type DocumentsTabForm = UseFormReturn<FormData>;

// ============================================================================
// UI/COMPONENT TYPES (Used in components)
// ============================================================================

/**
 * Sidebar application display
 */
export type SidebarApplication = {
  _id: Id<"founderApplications">;
  company: {
    name: string;
    location: string;
    oneLiner: string;
    stage: string;
  };
  traction: {
    mrr: string;
  };
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
};

/**
 * Company snapshot for visualization
 */
export type CompanySnapshot = {
  company: string;
  sector: string;
  stage: string;
  ask: string;
  summary: string;
  lastUpdated: string;
  metrics: Metric[];
  risks: Risk[];
};

/**
 * Company with ID for visualizations
 */
export type CompanyWithId = CompanySnapshot & {
  id: string;
  logo?: string;
  description: string;
};

/**
 * Visualization configuration
 */
export type Visualization = {
  type: "bar" | "line" | "area" | "pie" | "radar" | "scatter" | "composed";
  title: string;
  description: string;
  data?: Record<string, any>[];
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

/**
 * Pitch deck analysis result
 */
export type PitchDeckAnalysis = {
  company?: Partial<CompanyFormData>;
  team?: Partial<TeamFormData>;
  product?: Partial<ProductFormData>;
  market?: Partial<MarketFormData>;
  traction?: Partial<TractionFormData>;
};

/**
 * Agent status grid item
 */
export type AgentStatusItem = {
  agentId: string;
  agentName: string;
  status: string;
  startTime: number | null;
  endTime: number | null;
  toolCalls: number;
  toolResults: number;
  errors: number;
  lastActivity: number;
};

/**
 * Recent activity item for timeline
 */
export type ActivityItem = {
  _id: string;
  agentId: string;
  agentName: string;
  activityType:
    | "tool_call"
    | "tool_result"
    | "agent_start"
    | "agent_complete"
    | "agent_error";
  toolName?: string;
  toolInput?: any;
  toolOutput?: any;
  errorMessage?: string;
  executionTimeMs?: number;
  status: "pending" | "running" | "completed" | "error";
  timestamp: number;
  metadata?: any;
};

// ============================================================================
// EXPORTED VALIDATION SCHEMAS
// ============================================================================

export { formSchema, fileRefSchema };
