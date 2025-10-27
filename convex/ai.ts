import { action } from "./_generated/server";
import { v } from "convex/values";
import { api, components } from "./_generated/api";
import { Agent, createTool, stepCountIs } from "@convex-dev/agent";
import { RAG } from "@convex-dev/rag";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import {
  COMPANY_ANALYSIS_AGENT_INSTRUCTIONS,
  FINANCE_AGENT_INSTRUCTIONS,
  EVALUATION_AGENT_INSTRUCTIONS,
  COMPETITOR_AGENT_INSTRUCTIONS,
  MARKET_AGENT_INSTRUCTIONS,
  TECHNICAL_AGENT_INSTRUCTIONS,
  ORCHESTRATION_AGENT_INSTRUCTIONS,
} from "./prompt";
import { google } from "@ai-sdk/google";
import { generateObject, generateText, Output } from "ai";

type CompanyRagFilters = {
  domain: string;
  contentType: string;
};

export const companyRag = new RAG<CompanyRagFilters>(components.rag, {
  filterNames: ["domain", "contentType"],
  textEmbeddingModel: openai.embedding("text-embedding-3-small"),
  embeddingDimension: 1536,
});

// Create a factory function to create domain context tools with companyId injected
const createDomainContextTool = (companyId: string) =>
  createTool({
    description:
      "Retrieve domain-specific context from the company knowledge base. Use this to get targeted information relevant to your analysis domain.",
    args: z.object({
      domain: z
        .enum(["finance", "technical", "market", "evaluation", "competitor"])
        .describe("The domain to search for specific analysis data"),
      query: z
        .string()
        .describe(
          'Specific search query for the domain (e.g., "revenue metrics", "technology stack", "market size")',
        ),
      limit: z
        .number()
        .default(5)
        .describe("Maximum number of results to retrieve"),
    }),
    handler: async (ctx, args) => {
      try {
        // Perform both RAG search and document analysis in parallel
        const [ragResult, documents] = await Promise.all([
          companyRag
            .search(ctx, {
              namespace: companyId,
              query: `${args.domain}: ${args.query}`,
              limit: args.limit,
              chunkContext: { before: 1, after: 1 },
              filters: [
                { name: "domain", value: args.domain },
                { name: "contentType", value: "founderApplication" },
              ],
            })
            .catch(() => ({
              text: "RAG search failed or returned no results.",
            })),
          ctx
            .runQuery(api.founders.getCompanyDocuments, {
              companyId: companyId as any,
            })
            .catch(() => []),
        ]);

        let documentAnalysisResult = "No documents available for analysis.";

        // Analyze documents if available
        if (documents.length > 0) {
          const fileContents = await Promise.all(
            documents.map(async (doc) => {
              const fileData = await ctx.storage.get(doc.storageId);
              if (!fileData) {
                console.warn(`File not found in storage: ${doc.fileName}`);
                return null;
              }
              return {
                fileName: doc.fileName,
                fileData: new Uint8Array(await fileData.arrayBuffer()),
                mediaType: doc.mediaType,
              };
            }),
          );

          const validFiles = fileContents.filter((file) => file !== null);

          if (validFiles.length > 0) {
            const content = [
              {
                type: "text" as const,
                text: `Please analyze the uploaded documents and answer this specific question about the ${args.domain} domain: "${args.query}"

Focus on extracting relevant information from the documents that directly addresses this query. If the information is not available in the documents, clearly state that. Be specific and provide direct quotes or references from the documents when possible.`,
              },
              ...validFiles.map((doc) => ({
                type: "file" as const,
                data: doc!.fileData,
                mediaType: doc!.mediaType || "application/pdf",
                filename: doc!.fileName,
              })),
            ];

            const docResult = await generateText({
              model: google("gemini-flash-latest"),
              messages: [
                {
                  role: "user",
                  content,
                },
              ],
            });
            documentAnalysisResult = docResult.text;
          }
        }

        // Combine both results with Gemini Flash for final answer
        const combinedAnalysis = await generateText({
          model: google("gemini-flash-latest"),
          messages: [
            {
              role: "user",
              content: `Please provide a comprehensive answer to this question about the ${args.domain} domain: "${args.query}"

You have two sources of information:

1. RAG Search Results: ${ragResult.text}

2. Direct Document Analysis: ${documentAnalysisResult}

Please combine both sources to provide the most accurate and complete answer. Prioritize information from the direct document analysis when it's available and specific, but supplement with RAG results for additional context. If there are any conflicts, note them and explain which source you trust more. Provide a clear, concise final answer.`,
            },
          ],
        });

        return {
          success: true,
          context: combinedAnalysis.text,
          domain: args.domain,
          query: args.query,
          companyId: companyId,
          sourceCount:
            documents.length +
            (ragResult.text !== "RAG search failed or returned no results."
              ? ragResult.text.split("\n---\n").length
              : 0),
        };
      } catch (error) {
        console.warn(`Failed to retrieve ${args.domain} context:`, error);
        return {
          success: false,
          context: "",
          domain: args.domain,
          query: args.query,
          companyId: companyId,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  });

// Factory functions to create agents with company-specific tools
export const createCompanyAnalysisAgent = (companyId: string) =>
  new Agent(components.agent, {
    name: "CompanyAnalysisAgent",
    instructions: COMPANY_ANALYSIS_AGENT_INSTRUCTIONS,
    languageModel: openai.responses("gpt-5-mini"),
    stopWhen: stepCountIs(5),
    tools: {
      getDomainContext: createDomainContextTool(companyId),
    },
  });

export const createFinanceAgent = (companyId: string) =>
  new Agent(components.agent, {
    name: "FinanceAgent",
    instructions: FINANCE_AGENT_INSTRUCTIONS,
    languageModel: openai.responses("gpt-5-mini"),
    stopWhen: stepCountIs(5),
    tools: {
      web_search: openai.tools.webSearch({}),
      getDomainContext: createDomainContextTool(companyId),
    },
  });

export const createEvaluationAgent = (companyId: string) =>
  new Agent(components.agent, {
    name: "EvaluationAgent",
    instructions: EVALUATION_AGENT_INSTRUCTIONS,
    languageModel: openai.responses("gpt-5-mini"),
    stopWhen: stepCountIs(5),
    tools: {
      web_search: openai.tools.webSearch({}),
      getDomainContext: createDomainContextTool(companyId),
    },
  });

export const createCompetitorAgent = (companyId: string) =>
  new Agent(components.agent, {
    name: "CompetitorAgent",
    instructions: COMPETITOR_AGENT_INSTRUCTIONS,
    languageModel: openai.responses("gpt-5-mini"),
    stopWhen: stepCountIs(5),
    tools: {
      web_search: openai.tools.webSearch({}),
      getDomainContext: createDomainContextTool(companyId),
    },
  });

export const createMarketAgent = (companyId: string) =>
  new Agent(components.agent, {
    name: "MarketAgent",
    instructions: MARKET_AGENT_INSTRUCTIONS,
    languageModel: openai.responses("gpt-5-mini"),
    stopWhen: stepCountIs(5),
    tools: {
      web_search: openai.tools.webSearch({}),
      getDomainContext: createDomainContextTool(companyId),
    },
  });

export const createTechnicalAgent = (companyId: string) =>
  new Agent(components.agent, {
    name: "TechnicalAgent",
    instructions: TECHNICAL_AGENT_INSTRUCTIONS,
    languageModel: openai.responses("gpt-5-mini"),
    stopWhen: stepCountIs(5),
    tools: {
      web_search: openai.tools.webSearch({}),
      getDomainContext: createDomainContextTool(companyId),
    },
  });

export const createOrchestrationAgent = (companyId: string) =>
  new Agent(components.agent, {
    name: "OrchestrationAgent",
    instructions: ORCHESTRATION_AGENT_INSTRUCTIONS,
    languageModel: openai.responses("gpt-5-mini"),
    stopWhen: stepCountIs(2),
    tools: {
      web_search: openai.tools.webSearch({}),
      getDomainContext: createDomainContextTool(companyId),
    },
  });

// Visualization generation function
export const generateCompanyVisualizations = action({
  args: {
    companyId: v.optional(v.string()),
    companyData: v.object({
      company: v.string(),
      sector: v.string(),
      stage: v.string(),
      metrics: v.array(
        v.object({
          key: v.string(),
          label: v.string(),
          value: v.number(),
          unit: v.optional(v.string()),
          peerMedian: v.optional(v.number()),
        }),
      ),
      risks: v.array(
        v.object({
          severity: v.union(
            v.literal("low"),
            v.literal("med"),
            v.literal("high"),
          ),
          label: v.string(),
          evidence: v.string(),
        }),
      ),
    }),
  },
  handler: async (ctx, { companyId, companyData }) => {
    try {
      const prompt = `You are an expert data visualization analyst. Based on the following company data, generate 4-6 compelling and insightful visualizations that would be valuable for VC analysis.

Company Information:
- Name: ${companyData.company}
- Sector: ${companyData.sector}
- Stage: ${companyData.stage}

Available Metrics:
${companyData.metrics
  .map(
    (m) =>
      `- ${m.label}: ${m.value}${m.unit ? " " + m.unit : ""}${
        m.peerMedian ? ` (peer median: ${m.peerMedian})` : ""
      }`,
  )
  .join("\n")}

Risk Factors:
${companyData.risks
  .map((r) => `- ${r.label} (${r.severity}): ${r.evidence}`)
  .join("\n")}

Generate visualizations that:
1. Show meaningful comparisons and trends
2. Include industry benchmarks where available
3. Highlight key insights for investment decisions
4. Use appropriate chart types (bar, line, area, pie, radar, scatter, composed)
5. Provide actionable insights in the description

For each visualization, provide:
- Chart type and title
- Structured data suitable for the chart type
- Configuration options
- Key insights from the data

Ensure the data is realistic and based on the provided metrics. If data is insufficient, supplement with reasonable industry-standard data.

Return the response as a JSON object with this exact structure:
{
  "visualizations": [
    {
      "type": "bar|line|area|pie|radar|scatter|composed",
      "title": "Chart Title",
      "description": "Chart description",
      "data": [...],
      "config": {
        "xAxis": "field_name",
        "yAxis": "field_name",
        "xAxisLabel": "Label",
        "yAxisLabel": "Label",
        "colors": ["#color1", "#color2"],
        "showLegend": true,
        "showTooltip": true
      },
      "insights": ["insight1", "insight2"]
    }
  ]
}`;

      const result = await generateText({
        model: openai.responses("gpt-5-mini"),
        system:
          "You are a helpful assistant that generates visualizations for a company. Use the tools you have access to like web search to search about anything and getDomainContext tool to get context on the company.",
        experimental_output: Output.object({
          schema: z.object({
            visualizations: z.array(
              z.object({
                type: z.enum([
                  "bar",
                  "line",
                  "area",
                  "pie",
                  "radar",
                  "scatter",
                  "composed",
                ]),
                title: z.string(),
                description: z.string(),
                data: z.any(),
                config: z.object({
                  xAxis: z.optional(z.string()),
                  yAxis: z.optional(z.string()),
                  xAxisLabel: z.optional(z.string()),
                  yAxisLabel: z.optional(z.string()),
                  colors: z.optional(z.array(z.string())),
                  showLegend: z.optional(z.boolean()),
                  showTooltip: z.optional(z.boolean()),
                }),
                insights: z.array(z.string()),
              }),
            ),
          }),
        }),
        stopWhen: stepCountIs(5),
        tools: companyId
          ? {
              web_search: openai.tools.webSearch({}),
              getDomainContext: createDomainContextTool(companyId),
            }
          : {
              web_search: openai.tools.webSearch({}),
            },
        prompt,
      });

      return result.experimental_output;
    } catch (error) {
      console.error("Visualization generation failed:", error);
      // Return fallback visualizations
      return {
        visualizations: [
          {
            type: "bar" as const,
            title: "Key Metrics Comparison",
            description: "Comparison of company metrics against peer medians",
            data: companyData.metrics.map((m) => ({
              name: m.label,
              company: m.value,
              peers: m.peerMedian || 0,
            })),
            config: {
              xAxis: "name",
              yAxis: "value",
              xAxisLabel: "Metric",
              yAxisLabel: "Value",
              colors: ["hsl(var(--primary))", "hsl(var(--muted-foreground))"],
              showLegend: true,
              showTooltip: true,
            },
            insights: [
              "Shows relative performance against industry peers",
              "Identifies areas of strength and improvement",
            ],
          },
          {
            type: "pie" as const,
            title: "Risk Distribution",
            description: "Distribution of risk severity levels",
            data: [
              {
                name: "High Risk",
                value: companyData.risks.filter((r) => r.severity === "high")
                  .length,
              },
              {
                name: "Medium Risk",
                value: companyData.risks.filter((r) => r.severity === "med")
                  .length,
              },
              {
                name: "Low Risk",
                value: companyData.risks.filter((r) => r.severity === "low")
                  .length,
              },
            ],
            config: {
              colors: ["#ef4444", "#f97316", "#22c55e"],
              showLegend: true,
              showTooltip: true,
            },
            insights: [
              "Visual breakdown of risk exposure",
              "Helps prioritize risk mitigation efforts",
            ],
          },
        ],
      };
    }
  },
});
