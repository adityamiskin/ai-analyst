"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { api, internal } from "../_generated/api";
import { companyRag } from "../ai";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export const askCompany = action({
  args: {
    companyId: v.id("founderApplications"),
    question: v.string(),
    // optional history for light context
    history: v.optional(
      v.array(
        v.object({
          role: v.union(v.literal("user"), v.literal("assistant")),
          content: v.string(),
        })
      )
    ),
  },
  handler: async (
    ctx,
    { companyId, question, history }
  ): Promise<{
    answer: string;
    sources: Array<{
      id: number;
      title: string;
      url: string | null;
      snippet: string;
    }>;
  }> => {
    // 1) Retrieve founder application and latest snapshot
    const [applicationDoc, latestSnapshotDoc] = await Promise.all([
      ctx.runQuery(internal.founders.getApplicationById, { id: companyId }),
      ctx.runQuery(api.multi_agent_analysis.getLatestMultiAgentSnapshot, {
        companyId,
      }),
    ]);

    // 2) RAG search scoped to the company namespace
    const rag = await companyRag
      .search(ctx, {
        namespace: companyId,
        query: question,
        limit: 6,
        chunkContext: { before: 1, after: 1 },
        filters: [{ name: "contentType", value: "founderApplication" }],
      })
      .catch(() => ({ text: "" } as any));

    const ragText = (rag?.text ?? "").slice(0, 6000);

    // 3) Build compact context
    const companyContext = applicationDoc
      ? `Company:
- Name: ${applicationDoc.company.name}
- Website: ${applicationDoc.company.website}
- Location: ${applicationDoc.company.location}
- Stage: ${applicationDoc.company.stage}
- One-liner: ${applicationDoc.company.oneLiner}
- What we do: ${applicationDoc.company.whatDoYouDo}
- Why now: ${applicationDoc.company.whyNow}

Team:
- Full-time: ${applicationDoc.team.isFullTime ? "Yes" : "No"}
- Worked together: ${applicationDoc.team.howLongWorked}
- Experience: ${applicationDoc.team.relevantExperience}
- Founders: ${applicationDoc.team.founders
          .map((f: any) => `${f.name} (${f.designation})`)
          .join(", ")}

Product:
- Description: ${applicationDoc.product.description}
- Defensibility: ${applicationDoc.product.defensibility}
- Demo: ${applicationDoc.product.demoUrl || "-"}
- Video: ${applicationDoc.product.videoUrl || "-"}

Market:
- Customer: ${applicationDoc.market.customer}
- Competitors: ${applicationDoc.market.competitors}
- Differentiation: ${applicationDoc.market.differentiation}
- GTM: ${applicationDoc.market.gtm}
- TAM/SAM/SOM: ${applicationDoc.market.tam}/${applicationDoc.market.sam}/${
          applicationDoc.market.som
        }

Traction:
- Launched: ${applicationDoc.traction.isLaunched}
- Launch date: ${applicationDoc.traction.launchDate}
- MRR: ${applicationDoc.traction.mrr}
- Growth: ${applicationDoc.traction.growth}
- Users: ${applicationDoc.traction.activeUsersCount}
- Pilots: ${applicationDoc.traction.pilots}
- KPIs: ${applicationDoc.traction.kpis}
`
      : "";

    const snapshot = latestSnapshotDoc?.snapshot;
    const snapshotContext = snapshot
      ? `Latest AI Snapshot:
- Sector: ${snapshot.sector}
- Stage: ${snapshot.stage}
- Ask: ${snapshot.ask}
- Recommendation: ${snapshot.investmentRecommendation} (confidence ${Math.round(
          snapshot.overallConfidence * 100
        )}%)
- Overall summary: ${snapshot.overallSummary}`
      : "";

    // 4) Compose prompt
    const system = `You are a precise VC analyst. Answer using ONLY the provided company context and retrieved notes. If unknown, say you don't have that information. Be concise, structured, and cite key facts inline (e.g., [Source 1]).`;

    const userPrompt = `Question: ${question}

Context (Founder Application):
${companyContext}

Context (Latest AI Snapshot):
${snapshotContext}

Retrieved Notes (RAG):
${ragText}`;

    // 5) Generate answer
    const { text } = await generateText({
      model: google("gemini-flash-latest"),
      system,
      prompt: userPrompt,
    });

    // 6) Return answer and simple sources
    return {
      answer: text,
      sources: (rag?.chunks || []).slice(0, 6).map((c: any, i: number) => ({
        id: i + 1,
        title: c?.metadata?.title || "Founder application",
        url: c?.metadata?.url || null,
        snippet: c?.text?.slice(0, 300) || "",
      })),
    } as const;
  },
});
