import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { v } from "convex/values";
import { z } from "zod";
import { generateObject, Output } from "ai";
import { google } from "@ai-sdk/google";
import {
  createFinanceAgent,
  createEvaluationAgent,
  createCompetitorAgent,
  createMarketAgent,
  createTechnicalAgent,
  createOrchestrationAgent,
} from "./ai";
import { api, internal } from "./_generated/api";
import { buildSectionText } from "./analysis";
import { groq } from "@ai-sdk/groq";
import { Thread } from "@convex-dev/agent";
import { openai } from "@ai-sdk/openai";
import { GenericActionCtx } from "convex/server";
import { DataModel, Id } from "./_generated/dataModel";

const agentAnalysisSchema = z.object({
  agentId: z
    .enum(["finance", "evaluation", "competitor", "market", "technical"])
    .describe(
      "Unique identifier for the agent type (e.g., 'finance', 'evaluation', 'competitor', 'market', 'technical')"
    ),
  agentName: z
    .string()
    .describe(
      "Human-readable name of the agent (e.g., 'Financial Analysis Agent', 'Investment Evaluation Agent')"
    ),
  summary: z
    .string()
    .describe(
      "Concise executive summary of the analysis findings and key conclusions"
    ),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .default(0.5)
    .describe(
      "Confidence level in the analysis (0.0 to 1.0, where 1.0 is highest confidence)"
    ),
  keyFindings: z
    .array(z.string())
    .describe(
      "Array of the most important findings and insights from the analysis"
    ),
  metrics: z
    .array(
      z.object({
        key: z
          .string()
          .describe(
            "Unique identifier for the metric (e.g., 'revenue_2024', 'tam_2024')"
          ),
        label: z
          .string()
          .describe(
            "Human-readable label for the metric (e.g., '2024 Revenue', 'Total Addressable Market')"
          ),
        value: z
          .number()
          .describe("The numeric value of the metric till 2 decimal places"),
        unit: z
          .string()
          .optional()
          .describe("Unit of measurement (e.g., 'USD', '%', 'users')"),
        peerMedian: z
          .number()
          .optional()
          .describe(
            "Median value from comparable companies or industry benchmarks"
          ),
        sources: z
          .array(
            z.object({
              title: z
                .string()
                .describe("Title or name of the source document or website"),
              url: z.string().describe("URL of the source if available"),
              date: z
                .string()
                .describe("Date when the source was accessed or published"),
              confidence: z
                .number()
                .describe(
                  "Confidence level in this specific source (0.0 to 1.0)"
                ),
              extractedFacts: z
                .array(z.string())
                .describe("Key facts extracted from this source"),
            })
          )
          .describe("Sources used to calculate or validate this metric"),
        checks: z
          .array(
            z.object({
              label: z
                .string()
                .describe(
                  "Name of the validation check (e.g., 'Revenue growth', 'Market validation')"
                ),
              status: z
                .enum(["pass", "warn"])
                .describe(
                  "Result of the check - 'pass' for good, 'warn' for concerning"
                ),
              note: z
                .string()
                .describe(
                  "Additional context or explanation for the check result"
                ),
            })
          )
          .describe("Validation checks performed on this metric"),
      })
    )
    .describe(
      "Key quantitative metrics with benchmarks, sources, and validation checks"
    ),
  risks: z
    .array(
      z.object({
        severity: z
          .enum(["low", "med", "high"])
          .describe(
            "Risk severity level: 'low' for minor concerns, 'med' for moderate impact, 'high' for major threats"
          ),
        label: z
          .string()
          .describe(
            "Brief name or title of the risk (e.g., 'Market competition', 'Technology risk')"
          ),
        evidence: z
          .string()
          .describe(
            "Specific evidence, data, or reasoning supporting this risk assessment"
          ),
      })
    )
    .describe("Identified risks with severity levels and supporting evidence"),
  sources: z
    .array(
      z.object({
        title: z
          .string()
          .describe("Title or name of the source document or website"),
        url: z.string().describe("URL of the source if available"),
        date: z
          .string()
          .describe("Date when the source was accessed or published"),
        confidence: z
          .number()
          .describe("Confidence level in this source (0.0 to 1.0)"),
        extractedFacts: z
          .array(z.string())
          .describe("Key facts extracted from this source"),
      })
    )
    .describe("External sources used in the analysis with confidence levels"),
  recommendations: z
    .array(z.string())
    .describe("Specific, actionable recommendations based on the analysis"),
  lastUpdated: z
    .string()
    .describe("Date when this analysis was last updated (YYYY-MM-DD format)"),
});

const multiAgentSnapshotSchema = z.object({
  company: z.string().describe("Name of the company being analyzed"),
  sector: z
    .string()
    .describe(
      "Industry sector the company operates in (e.g., 'Technology', 'Healthcare', 'Fintech')"
    ),
  stage: z
    .string()
    .describe(
      "Current funding stage of the company (e.g., 'Seed', 'Series A', 'Series B')"
    ),
  ask: z
    .string()
    .describe(
      "Current funding ask or valuation (e.g., '$5M at $25M pre-money')"
    ),
  overallSummary: z
    .string()
    .describe(
      "Executive summary synthesizing all agent analyses and key investment conclusions"
    ),
  overallConfidence: z
    .number()
    .min(0)
    .max(1)
    .describe("Overall confidence level in the complete analysis (0.0 to 1.0)"),
  lastUpdated: z
    .string()
    .describe("Date when this snapshot was last updated (YYYY-MM-DD format)"),
  agentAnalyses: z
    .array(agentAnalysisSchema)
    .describe(
      "Complete analysis results from all specialized agents (finance, evaluation, competitor, market, technical)"
    ),
  consolidatedMetrics: z
    .array(
      z.object({
        key: z
          .string()
          .describe("Unique identifier for the consolidated metric"),
        label: z.string().describe("Human-readable label for the metric"),
        value: z.number().default(0).describe("The consolidated numeric value"),
        unit: z.string().optional().describe("Unit of measurement"),
        peerMedian: z
          .number()
          .optional()
          .describe("Industry or peer median for comparison"),
        sources: z
          .array(
            z.object({
              title: z
                .string()
                .default("Unknown")
                .describe("Source document or website title"),
              url: z.string().default("").describe("URL of the source"),
              date: z
                .string()
                .default(new Date().toISOString().split("T")[0])
                .describe("Date when source was accessed"),
              confidence: z
                .number()
                .default(0.5)
                .describe("Confidence in this source"),
              extractedFacts: z
                .array(z.string())
                .default([])
                .describe("Key facts from this source"),
            })
          )
          .default([])
          .describe("Sources supporting this consolidated metric"),
        checks: z
          .array(
            z.object({
              label: z.string().describe("Validation check name"),
              status: z
                .enum(["pass", "warn"])
                .default("pass")
                .describe("Check result status"),
              note: z
                .string()
                .optional()
                .describe("Additional context for the check"),
            })
          )
          .default([])
          .describe("Validation checks for this consolidated metric"),
      })
    )
    .describe("Cross-agent consolidated metrics with sources and validation"),
  consolidatedRisks: z
    .array(
      z.object({
        severity: z
          .enum(["low", "med", "high"])
          .default("low")
          .describe("Risk severity level across all analyses"),
        label: z.string().describe("Consolidated risk name or title"),
        evidence: z
          .string()
          .describe("Combined evidence from multiple agent analyses"),
      })
    )
    .describe("Consolidated risks identified across all agent analyses"),
  investmentRecommendation: z
    .enum(["strong_buy", "buy", "hold", "sell", "strong_sell"])
    .describe("Final investment recommendation based on all agent analyses"),
  recommendationReasoning: z
    .string()
    .describe(
      "Detailed reasoning behind the investment recommendation, citing key factors from all analyses"
    ),
});

async function generateStructuredResult(
  thread: Thread<any>,
  resultText: string
) {
  const structuredResult = await thread.generateObject({
    prompt:
      resultText +
      "\n\nGive the summary in proper markdown format without the markdown tags",
    model: openai.responses("gpt-4.1"),
    schema: agentAnalysisSchema,
  });

  return structuredResult.object;
}

async function runFinanceAnalysis(
  ctx: GenericActionCtx<DataModel>,
  companyId: Id<"founderApplications">,
  baselineContext: string,
  jobId: Id<"analysisJobs">
) {
  const financeAgent = createFinanceAgent(companyId);
  const { thread } = await financeAgent.createThread(ctx, {
    title: `Finance Analysis ${companyId}`,
  });

  const today = new Date().toISOString().split("T")[0];

  const prompt = `Analyze the company's financial aspects comprehensively using your specialized tools and knowledge.

Company baseline context: ${baselineContext}`;

  try {
    await ctx.runMutation(internal.agent_activity.logAgentActivity, {
      companyId,
      jobId,
      agentId: "finance",
      agentName: "Financial Analysis Agent",
      threadId: thread.threadId,
      activityType: "agent_start",
      status: "running",
    });

    const result = await thread.generateText(
      {
        prompt,
      },
      {
        storageOptions: { saveMessages: "all" },
      }
    );

    const structuredResult = await generateStructuredResult(
      thread,
      result.text
    );

    await ctx.runAction(internal.agent_activity.extractAgentActivity, {
      companyId,
      jobId,
      agentId: "finance",
      agentName: "Financial Analysis Agent",
      threadId: thread.threadId,
      skipStartLog: true,
    });

    return structuredResult;
  } catch (error) {
    console.error("Finance analysis failed:", error);

    // Log agent error
    await ctx.runMutation(internal.agent_activity.logAgentActivity, {
      companyId,
      jobId,
      agentId: "finance",
      agentName: "Financial Analysis Agent",
      threadId: thread.threadId,
      activityType: "agent_error",
      status: "error",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });

    // Return a fallback analysis
    return {
      agentId: "finance",
      agentName: "Financial Analysis Agent",
      summary:
        "Financial analysis could not be completed due to an error. Please try again.",
      confidence: 0.1,
      keyFindings: ["Analysis failed - insufficient data"],
      metrics: [],
      risks: [
        {
          severity: "high" as const,
          label: "Analysis Error",
          evidence: "Unable to complete financial analysis",
        },
      ],
      sources: [],
      recommendations: ["Retry analysis with more complete data"],
      lastUpdated: today,
    };
  }
}

async function runEvaluationAnalysis(
  ctx: GenericActionCtx<DataModel>,
  companyId: Id<"founderApplications">,
  baselineContext: string,
  jobId: Id<"analysisJobs">
) {
  const evaluationAgent = createEvaluationAgent(companyId);
  const { thread } = await evaluationAgent.createThread(ctx, {
    title: `Evaluation Analysis ${companyId}`,
  });

  const today = new Date().toISOString().split("T")[0];

  const prompt = `Evaluate the investment opportunity comprehensively using your specialized tools and knowledge.

Company baseline context: ${baselineContext}`;

  try {
    // Log agent start before execution
    await ctx.runMutation(internal.agent_activity.logAgentActivity, {
      companyId,
      jobId,
      agentId: "evaluation",
      agentName: "Investment Evaluation Agent",
      threadId: thread.threadId,
      activityType: "agent_start",
      status: "running",
    });

    const result = await thread.generateText(
      {
        prompt,
      },
      {
        storageOptions: { saveMessages: "all" },
      }
    );

    const structuredResult = await generateStructuredResult(
      thread,
      result.text
    );

    // Extract agent activity after completion (skip start log since we already logged it)
    await ctx.runAction(internal.agent_activity.extractAgentActivity, {
      companyId,
      jobId,
      agentId: "evaluation",
      agentName: "Investment Evaluation Agent",
      threadId: thread.threadId,
      skipStartLog: true,
    });

    return structuredResult;
  } catch (error) {
    console.error("Evaluation analysis failed:", error);

    // Log agent error
    await ctx.runMutation(internal.agent_activity.logAgentActivity, {
      companyId,
      jobId,
      agentId: "evaluation",
      agentName: "Investment Evaluation Agent",
      threadId: thread.threadId,
      activityType: "agent_error",
      status: "error",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });

    // Return a fallback analysis
    return {
      agentId: "evaluation",
      agentName: "Investment Evaluation Agent",
      summary:
        "Investment evaluation could not be completed due to an error. Please try again.",
      confidence: 0.1,
      keyFindings: ["Analysis failed - insufficient data"],
      metrics: [],
      risks: [
        {
          severity: "high" as const,
          label: "Analysis Error",
          evidence: "Unable to complete investment evaluation",
        },
      ],
      sources: [],
      recommendations: ["Retry analysis with more complete data"],
      lastUpdated: today,
    };
  }
}

async function runCompetitorAnalysis(
  ctx: GenericActionCtx<DataModel>,
  companyId: Id<"founderApplications">,
  baselineContext: string,
  jobId: Id<"analysisJobs">
) {
  const competitorAgent = createCompetitorAgent(companyId);
  const { thread } = await competitorAgent.createThread(ctx, {
    title: `Competitor Analysis ${companyId}`,
  });

  const today = new Date().toISOString().split("T")[0];

  const prompt = `Analyze the competitive landscape comprehensively using your specialized tools and knowledge.

Company baseline context: ${baselineContext}`;

  try {
    // Log agent start before execution
    await ctx.runMutation(internal.agent_activity.logAgentActivity, {
      companyId,
      jobId,
      agentId: "competitor",
      agentName: "Competitor Analysis Agent",
      threadId: thread.threadId,
      activityType: "agent_start",
      status: "running",
    });

    const result = await thread.generateText(
      {
        prompt,
      },
      {
        storageOptions: { saveMessages: "all" },
      }
    );

    const structuredResult = await generateStructuredResult(
      thread,
      result.text
    );

    // Extract agent activity after completion (skip start log since we already logged it)
    await ctx.runAction(internal.agent_activity.extractAgentActivity, {
      companyId,
      jobId,
      agentId: "competitor",
      agentName: "Competitive Analysis Agent",
      threadId: thread.threadId,
      skipStartLog: true,
    });

    console.log("Competitor analysis completed");

    return structuredResult;
  } catch (error) {
    console.error("Competitor analysis failed:", error);

    // Log agent error
    await ctx.runMutation(internal.agent_activity.logAgentActivity, {
      companyId,
      jobId,
      agentId: "competitor",
      agentName: "Competitive Analysis Agent",
      threadId: thread.threadId,
      activityType: "agent_error",
      status: "error",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });

    // Return a fallback analysis
    return {
      agentId: "competitor",
      agentName: "Competitive Analysis Agent",
      summary:
        "Competitive analysis could not be completed due to an error. Please try again.",
      confidence: 0.1,
      keyFindings: ["Analysis failed - insufficient data"],
      metrics: [],
      risks: [
        {
          severity: "high" as const,
          label: "Analysis Error",
          evidence: "Unable to complete competitive analysis",
        },
      ],
      sources: [],
      recommendations: ["Retry analysis with more complete data"],
      lastUpdated: today,
    };
  }
}

async function runMarketAnalysis(
  ctx: GenericActionCtx<DataModel>,
  companyId: Id<"founderApplications">,
  baselineContext: string,
  jobId: Id<"analysisJobs">
) {
  const marketAgent = createMarketAgent(companyId);
  const { thread } = await marketAgent.createThread(ctx, {
    title: `Market Analysis ${companyId}`,
  });

  const today = new Date().toISOString().split("T")[0];

  const prompt = `Analyze the market opportunity comprehensively using your specialized tools and knowledge.

Company baseline context: ${baselineContext}`;

  try {
    // Log agent start before execution
    await ctx.runMutation(internal.agent_activity.logAgentActivity, {
      companyId,
      jobId,
      agentId: "market",
      agentName: "Market Analysis Agent",
      threadId: thread.threadId,
      activityType: "agent_start",
      status: "running",
    });

    const result = await thread.generateText(
      {
        prompt,
      },
      {
        storageOptions: { saveMessages: "all" },
      }
    );

    const structuredResult = await generateStructuredResult(
      thread,
      result.text
    );

    // Extract agent activity after completion (skip start log since we already logged it)
    await ctx.runAction(internal.agent_activity.extractAgentActivity, {
      companyId,
      jobId,
      agentId: "market",
      agentName: "Market Analysis Agent",
      threadId: thread.threadId,
      skipStartLog: true,
    });

    console.log("Market analysis completed");

    return structuredResult;
  } catch (error) {
    console.error("Market analysis failed:", error);

    // Log agent error
    await ctx.runMutation(internal.agent_activity.logAgentActivity, {
      companyId,
      jobId,
      agentId: "market",
      agentName: "Market Analysis Agent",
      threadId: thread.threadId,
      activityType: "agent_error",
      status: "error",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });

    // Return a fallback analysis
    return {
      agentId: "market",
      agentName: "Market Analysis Agent",
      summary:
        "Market analysis could not be completed due to an error. Please try again.",
      confidence: 0.1,
      keyFindings: ["Analysis failed - insufficient data"],
      metrics: [],
      risks: [
        {
          severity: "high" as const,
          label: "Analysis Error",
          evidence: "Unable to complete market analysis",
        },
      ],
      sources: [],
      recommendations: ["Retry analysis with more complete data"],
      lastUpdated: today,
    };
  }
}

async function runTechnicalAnalysis(
  ctx: GenericActionCtx<DataModel>,
  companyId: Id<"founderApplications">,
  baselineContext: string,
  jobId: Id<"analysisJobs">
) {
  const technicalAgent = createTechnicalAgent(companyId);
  const { thread } = await technicalAgent.createThread(ctx, {
    title: `Technical Analysis ${companyId}`,
  });

  const today = new Date().toISOString().split("T")[0];

  const prompt = `Analyze the technical aspects comprehensively using your specialized tools and knowledge.

Company baseline context: ${baselineContext}`;

  try {
    // Log agent start before execution
    await ctx.runMutation(internal.agent_activity.logAgentActivity, {
      companyId,
      jobId,
      agentId: "technical",
      agentName: "Technical Analysis Agent",
      threadId: thread.threadId,
      activityType: "agent_start",
      status: "running",
    });

    const result = await thread.generateText(
      {
        prompt,
      },
      {
        storageOptions: { saveMessages: "all" },
      }
    );

    const structuredResult = await generateStructuredResult(
      thread,
      result.text
    );

    // Extract agent activity after completion (skip start log since we already logged it)
    await ctx.runAction(internal.agent_activity.extractAgentActivity, {
      companyId,
      jobId,
      agentId: "technical",
      agentName: "Technical Analysis Agent",
      threadId: thread.threadId,
      skipStartLog: true,
    });

    console.log("Technical analysis completed");

    return structuredResult;
  } catch (error) {
    console.error("Technical analysis failed:", error);

    // Log agent error
    await ctx.runMutation(internal.agent_activity.logAgentActivity, {
      companyId,
      jobId,
      agentId: "technical",
      agentName: "Technical Analysis Agent",
      threadId: thread.threadId,
      activityType: "agent_error",
      status: "error",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });

    // Return a fallback analysis
    return {
      agentId: "technical",
      agentName: "Technical Analysis Agent",
      summary:
        "Technical analysis could not be completed due to an error. Please try again.",
      confidence: 0.1,
      keyFindings: ["Analysis failed - insufficient data"],
      metrics: [],
      risks: [
        {
          severity: "high" as const,
          label: "Analysis Error",
          evidence: "Unable to complete technical analysis",
        },
      ],
      sources: [],
      recommendations: ["Retry analysis with more complete data"],
      lastUpdated: today,
    };
  }
}

export const updateJobStatus = internalMutation({
  args: {
    jobId: v.id("analysisJobs"),
    status: v.union(
      v.literal("queued"),
      v.literal("running"),
      v.literal("ingesting"),
      v.literal("analyzing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    progress: v.number(),
    message: v.string(),
    completedAt: v.optional(v.number()),
    error: v.optional(v.string()),
  },
  handler: async (
    ctx,
    { jobId, status, progress, message, completedAt, error }
  ) => {
    await ctx.db.patch(jobId, {
      status,
      progress,
      message,
      updatedAt: Date.now(),
      ...(completedAt && { completedAt }),
      ...(error && { error }),
    });
  },
});

export const runMultiAgentAnalysis = internalAction({
  args: { companyId: v.id("founderApplications"), jobId: v.id("analysisJobs") },
  handler: async (ctx, { companyId, jobId }) => {
    try {
      // Update job status to running
      await ctx.runMutation(internal.multi_agent_analysis.updateJobStatus, {
        jobId,
        status: "running",
        progress: 5,
        message: "Starting multi-agent analysis...",
      });

      // Ingest latest application text into RAG
      try {
        await ctx.runMutation(internal.multi_agent_analysis.updateJobStatus, {
          jobId,
          status: "ingesting",
          progress: 10,
          message: "Ingesting company data...",
        });

        await ctx.runAction(api.analysis.ingestCompanyApplication, {
          companyId,
        });
      } catch (e) {
        // continue; not fatal if already ingested
      }

      // Update job status for retrieval phase
      await ctx.runMutation(internal.multi_agent_analysis.updateJobStatus, {
        jobId,
        status: "analyzing",
        progress: 20,
        message: "Retrieving company context...",
      });

      // Get baseline company data for shared context
      const companyDoc = await ctx.runQuery(
        internal.founders.getApplicationById,
        {
          id: companyId,
        }
      );

      const baselineContext = buildSectionText(companyDoc);

      // Update job status for agent analysis phase
      await ctx.runMutation(internal.multi_agent_analysis.updateJobStatus, {
        jobId,
        status: "analyzing",
        progress: 40,
        message: "Running agent analyses...",
      });

      // Run all agent analyses in parallel
      const [
        financeAnalysis,
        evaluationAnalysis,
        competitorAnalysis,
        marketAnalysis,
        technicalAnalysis,
      ] = await Promise.all([
        runFinanceAnalysis(ctx, companyId, baselineContext, jobId),
        runEvaluationAnalysis(ctx, companyId, baselineContext, jobId),
        runCompetitorAnalysis(ctx, companyId, baselineContext, jobId),
        runMarketAnalysis(ctx, companyId, baselineContext, jobId),
        runTechnicalAnalysis(ctx, companyId, baselineContext, jobId),
      ]);

      // Update job status for orchestration phase
      await ctx.runMutation(internal.multi_agent_analysis.updateJobStatus, {
        jobId,
        status: "analyzing",
        progress: 80,
        message: "Synthesizing agent insights...",
      });

      // Run orchestration agent to synthesize results
      const orchestrationAgent = createOrchestrationAgent(companyId);
      const { thread } = await orchestrationAgent.createThread(ctx, {
        title: `Orchestration Analysis ${companyId}`,
      });

      const today = new Date().toISOString().split("T")[0];

      const orchestrationPrompt = `Synthesize all agent analyses and provide a comprehensive investment recommendation using your specialized tools and knowledge.

Agent analyses summaries:
Finance: ${financeAnalysis.summary}
Evaluation: ${evaluationAnalysis.summary}
Competitor: ${competitorAnalysis.summary}
Market: ${marketAnalysis.summary}
Technical: ${technicalAnalysis.summary}`;

      try {
        // Log orchestration agent start before execution
        await ctx.runMutation(internal.agent_activity.logAgentActivity, {
          companyId,
          jobId,
          agentId: "orchestration",
          agentName: "Orchestration Agent",
          threadId: thread.threadId,
          activityType: "agent_start",
          status: "running",
        });

        const orchestrationResult = await thread.generateText(
          {
            prompt: orchestrationPrompt,
          },
          {
            storageOptions: { saveMessages: "all" },
          }
        );

        const structuredResult = await thread.generateObject({
          prompt: orchestrationResult.text,
          model: google("gemini-flash-latest"),
          schema: multiAgentSnapshotSchema,
        });

        // Ensure lastUpdated
        if (!structuredResult.object?.lastUpdated)
          structuredResult.object.lastUpdated = today;

        // Update job status for saving
        await ctx.runMutation(internal.multi_agent_analysis.updateJobStatus, {
          jobId,
          status: "analyzing",
          progress: 95,
          message: "Saving analysis results...",
        });

        await ctx.runMutation(api.multi_agent_analysis.saveMultiAgentSnapshot, {
          companyId,
          snapshot: structuredResult.object,
        });

        // Extract orchestration agent activity (skip start log since we already logged it)
        await ctx.runAction(internal.agent_activity.extractAgentActivity, {
          companyId,
          jobId,
          agentId: "orchestration",
          agentName: "Orchestration Agent",
          threadId: thread.threadId,
          skipStartLog: true,
        });

        // Mark job as completed
        await ctx.runMutation(internal.multi_agent_analysis.updateJobStatus, {
          jobId,
          status: "completed",
          progress: 100,
          message: "Multi-agent analysis completed successfully",
          completedAt: Date.now(),
        });
      } catch (error) {
        console.error("Orchestration failed:", error);

        // Mark job as completed with partial results
        await ctx.runMutation(internal.multi_agent_analysis.updateJobStatus, {
          jobId,
          status: "completed",
          progress: 100,
          message: "Multi-agent analysis completed with partial results",
          completedAt: Date.now(),
        });
      }
    } catch (error) {
      console.error("Multi-agent analysis failed:", error);
      await ctx.runMutation(internal.multi_agent_analysis.updateJobStatus, {
        jobId,
        status: "failed",
        progress: 0,
        message: "Multi-agent analysis failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  },
});

export const saveMultiAgentSnapshot = mutation({
  args: {
    companyId: v.id("founderApplications"),
    snapshot: v.object({
      company: v.string(),
      sector: v.string(),
      stage: v.string(),
      ask: v.string(),
      overallSummary: v.string(),
      overallConfidence: v.number(),
      lastUpdated: v.string(),
      agentAnalyses: v.array(
        v.object({
          agentId: v.union(
            v.literal("finance"),
            v.literal("technical"),
            v.literal("market"),
            v.literal("evaluation"),
            v.literal("competitor")
          ),
          agentName: v.string(),
          summary: v.string(),
          confidence: v.number(),
          keyFindings: v.array(v.string()),
          metrics: v.array(
            v.object({
              key: v.string(),
              label: v.string(),
              value: v.number(),
              unit: v.optional(v.string()),
              peerMedian: v.optional(v.number()),
              sources: v.array(
                v.object({
                  title: v.string(),
                  url: v.string(),
                  date: v.string(),
                  confidence: v.number(),
                  extractedFacts: v.array(v.string()),
                })
              ),
              checks: v.array(
                v.object({
                  label: v.string(),
                  status: v.union(v.literal("pass"), v.literal("warn")),
                  note: v.optional(v.string()),
                })
              ),
            })
          ),
          risks: v.array(
            v.object({
              severity: v.union(
                v.literal("low"),
                v.literal("med"),
                v.literal("high")
              ),
              label: v.string(),
              evidence: v.string(),
            })
          ),
          sources: v.array(
            v.object({
              title: v.string(),
              url: v.string(),
              date: v.string(),
              confidence: v.number(),
              extractedFacts: v.array(v.string()),
            })
          ),
          recommendations: v.array(v.string()),
          lastUpdated: v.string(),
        })
      ),
      consolidatedMetrics: v.array(
        v.object({
          key: v.string(),
          label: v.string(),
          value: v.number(),
          unit: v.optional(v.string()),
          peerMedian: v.optional(v.number()),
          sources: v.array(
            v.object({
              title: v.string(),
              url: v.string(),
              date: v.string(),
              confidence: v.number(),
              extractedFacts: v.array(v.string()),
            })
          ),
          checks: v.array(
            v.object({
              label: v.string(),
              status: v.union(v.literal("pass"), v.literal("warn")),
              note: v.optional(v.string()),
            })
          ),
        })
      ),
      consolidatedRisks: v.array(
        v.object({
          severity: v.union(
            v.literal("low"),
            v.literal("med"),
            v.literal("high")
          ),
          label: v.string(),
          evidence: v.string(),
        })
      ),
      investmentRecommendation: v.union(
        v.literal("strong_buy"),
        v.literal("buy"),
        v.literal("hold"),
        v.literal("sell"),
        v.literal("strong_sell")
      ),
      recommendationReasoning: v.string(),
    }),
  },
  handler: async (ctx, { companyId, snapshot }) => {
    await ctx.db.insert("multiAgentAnalyses", {
      companyId,
      snapshot,
      createdAt: Date.now(),
    });
    return true;
  },
});

export const startMultiAgentAnalysis = mutation({
  args: { companyId: v.id("founderApplications") },
  handler: async (ctx, { companyId }) => {
    // Create a job record
    const jobId = await ctx.db.insert("analysisJobs", {
      companyId,
      status: "queued",
      progress: 0,
      message: "Multi-agent analysis job queued",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    await ctx.scheduler.runAfter(
      0,
      internal.multi_agent_analysis.runMultiAgentAnalysis,
      {
        companyId,
        jobId,
      }
    );
    return { started: true, jobId };
  },
});

export const getLatestMultiAgentSnapshot = query({
  args: { companyId: v.id("founderApplications") },
  handler: async (ctx, { companyId }) => {
    const doc = await ctx.db
      .query("multiAgentAnalyses")
      .withIndex("by_companyId_createdAt", (q) => q.eq("companyId", companyId))
      .order("desc")
      .first();
    return doc ?? null;
  },
});

export const getJobStatus = query({
  args: {
    companyId: v.id("founderApplications"),
  },
  handler: async (ctx, { companyId }) => {
    const doc = await ctx.db
      .query("analysisJobs")
      .withIndex("by_companyId_createdAt", (q) => q.eq("companyId", companyId))
      .order("desc")
      .first();
    return doc ?? null;
  },
});

export const getAllLatestRecommendations = query({
  args: {},
  handler: async (ctx) => {
    // Get all analyses
    const allAnalyses = await ctx.db.query("multiAgentAnalyses").collect();

    // Group by companyId and keep only the latest for each
    const latestByCompany = new Map<
      Id<"founderApplications">,
      { recommendation: string; confidence: number; createdAt: number }
    >();

    for (const analysis of allAnalyses) {
      const existing = latestByCompany.get(analysis.companyId);
      if (!existing || analysis.createdAt > existing.createdAt) {
        latestByCompany.set(analysis.companyId, {
          recommendation: analysis.snapshot.investmentRecommendation,
          confidence: analysis.snapshot.overallConfidence,
          createdAt: analysis.createdAt,
        });
      }
    }

    // Convert to a simple object of companyId -> { recommendation, confidence }
    const result: Record<
      string,
      { recommendation: string; confidence: number }
    > = {};
    for (const [companyId, data] of latestByCompany.entries()) {
      result[companyId] = {
        recommendation: data.recommendation,
        confidence: data.confidence,
      };
    }

    return result;
  },
});
