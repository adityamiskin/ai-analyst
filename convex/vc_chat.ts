import { query, mutation, internalAction, action } from "./_generated/server";
import { v } from "convex/values";
import {
  listUIMessages,
  syncStreams,
  vStreamArgs,
  saveMessage,
} from "@convex-dev/agent";
import { components, internal, api } from "./_generated/api";
import { paginationOptsValidator } from "convex/server";
import { createVCChatAgent, companyRag } from "./ai";

// Query to list messages for a thread with streaming support
export const listThreadMessages = query({
  args: {
    threadId: v.string(),
    paginationOpts: paginationOptsValidator,
    streamArgs: v.optional(vStreamArgs),
  },
  handler: async (ctx, args) => {
    const paginated = await listUIMessages(ctx, components.agent, {
      threadId: args.threadId,
      paginationOpts: args.paginationOpts,
    });

    const streams = args.streamArgs
      ? await syncStreams(ctx, components.agent, {
          threadId: args.threadId,
          streamArgs: args.streamArgs,
        })
      : undefined;

    return { ...paginated, streams };
  },
});

// Action to create or continue thread (needed because agent methods require action context)
export const ensureThread = action({
  args: {
    companyId: v.id("founderApplications"),
    threadId: v.optional(v.string()),
  },
  handler: async (ctx, { companyId, threadId }) => {
    const agent = createVCChatAgent(companyId);
    if (threadId) {
      const result = await agent.continueThread(ctx, { threadId });
      return { threadId: result.thread.threadId };
    } else {
      const result = await agent.createThread(ctx, {
        title: `VC Chat: ${companyId}`,
      });
      return { threadId: result.thread.threadId };
    }
  },
});

// Mutation to send a user message with optimistic updates
export const sendMessage = mutation({
  args: {
    threadId: v.string(),
    question: v.string(),
    companyId: v.id("founderApplications"),
  },
  handler: async (ctx, { threadId, question, companyId }) => {
    // Save user message
    const messageContent = [{ type: "text" as const, text: question }];
    const { messageId } = await saveMessage(ctx, components.agent, {
      threadId,
      message: {
        role: "user",
        content: messageContent,
      },
    });

    // Schedule the async response generation
    await ctx.scheduler.runAfter(0, internal.vc_chat.generateResponse, {
      companyId,
      threadId,
      messageId,
      question,
    });

    return { threadId, messageId };
  },
});

// Internal action to generate the AI response asynchronously
export const generateResponse = internalAction({
  args: {
    companyId: v.id("founderApplications"),
    threadId: v.string(),
    messageId: v.string(),
    question: v.string(),
  },
  handler: async (ctx, { companyId, threadId, messageId, question }) => {
    // 1) Retrieve founder application and latest snapshot
    const [applicationDoc, latestSnapshotDoc, documents] = await Promise.all([
      ctx.runQuery(internal.founders.getApplicationById, { id: companyId }),
      ctx.runQuery(api.multi_agent_analysis.getLatestMultiAgentSnapshot, {
        companyId,
      }),
      ctx.runQuery(api.founders.getCompanyDocuments, { companyId: companyId }),
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

    // 4) Retrieve document files from storage for file parts
    const fileParts = [];
    if (documents && documents.length > 0) {
      for (const doc of documents) {
        try {
          const fileData = await ctx.storage.get(doc.storageId);
          if (fileData) {
            const fileBuffer = new Uint8Array(await fileData.arrayBuffer());
            fileParts.push({
              type: "file" as const,
              data: fileBuffer,
              mediaType: doc.mediaType,
              filename: doc.fileName,
            });
          }
        } catch (error) {
          console.error(`Failed to retrieve document ${doc.fileName}:`, error);
        }
      }
    }

    // 5) Build compact context
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

    // 6) Compose prompt with context for the agent
    const contextPrompt = `Context (Founder Application):
${companyContext}

Context (Latest AI Snapshot):
${snapshotContext}

Retrieved Notes (RAG):
${ragText}`;

    // 7) Create agent and continue thread
    const agent = createVCChatAgent(companyId);
    await agent.continueThread(ctx, { threadId });

    // 8) Stream text with saveStreamDeltas enabled
    const systemContext = `${contextPrompt}\n\nIMPORTANT: The above context is for your reference only. When answering, DO NOT repeat or echo this context back. Only provide your answer based on this context.`;

    await agent.streamText(
      ctx,
      { threadId },
      {
        promptMessageId: messageId,
        system: systemContext,
      },
      {
        saveStreamDeltas: true,
      }
    );
  },
});
