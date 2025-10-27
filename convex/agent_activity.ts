import {
  action,
  internalAction,
  internalMutation,
  mutation,
  query,
} from "./_generated/server";
import { v } from "convex/values";
import { listMessages } from "@convex-dev/agent";
import { components } from "./_generated/api";
import { api, internal } from "./_generated/api";

// Helper function to save agent messages
export const saveAgentMessage = internalMutation({
  args: {
    companyId: v.id("founderApplications"),
    jobId: v.id("analysisJobs"),
    agentId: v.string(),
    agentName: v.string(),
    threadId: v.string(),
    messageId: v.string(),
    role: v.string(),
    content: v.any(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("agentMessages", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

// Helper function to log agent activity
export const logAgentActivity = internalMutation({
  args: {
    companyId: v.id("founderApplications"),
    jobId: v.id("analysisJobs"),
    agentId: v.string(),
    agentName: v.string(),
    threadId: v.string(),
    activityType: v.union(
      v.literal("tool_call"),
      v.literal("tool_result"),
      v.literal("agent_start"),
      v.literal("agent_complete"),
      v.literal("agent_error")
    ),
    toolName: v.optional(v.string()),
    toolInput: v.optional(v.any()),
    toolOutput: v.optional(v.any()),
    errorMessage: v.optional(v.string()),
    executionTimeMs: v.optional(v.number()),
    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("error")
    ),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("agentActivity", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

// Function to extract tool calls and results from agent thread messages
export const extractAgentActivity = internalAction({
  args: {
    companyId: v.id("founderApplications"),
    jobId: v.id("analysisJobs"),
    agentId: v.string(),
    agentName: v.string(),
    threadId: v.string(),
    skipStartLog: v.optional(v.boolean()),
  },
  handler: async (
    ctx,
    { companyId, jobId, agentId, agentName, threadId, skipStartLog }
  ) => {
    try {
      // Log agent start (unless already logged)
      if (!skipStartLog) {
        await ctx.runMutation(internal.agent_activity.logAgentActivity, {
          companyId,
          jobId,
          agentId,
          agentName,
          threadId,
          activityType: "agent_start",
          status: "running",
        });
      }

      // Fetch all messages from the thread
      const messagesResult = await listMessages(ctx, components.agent, {
        threadId,
        paginationOpts: { cursor: null, numItems: 100 },
      });

      // Save all messages as one consolidated message per agent
      await ctx.runMutation(internal.agent_activity.saveAgentMessage, {
        companyId,
        jobId,
        agentId,
        agentName,
        threadId,
        messageId: `consolidated_${agentId}_${threadId}_${Date.now()}`,
        role: "agent",
        content: messagesResult.page, // Save the entire array of messages
        metadata: {
          messageCount: messagesResult.page.length,
          consolidated: true,
          firstMessageId: messagesResult.page[0]?.id,
          lastMessageId:
            messagesResult.page[messagesResult.page.length - 1]?.id,
        },
      });

      // Extract tool calls from saved messages
      await ctx.runAction(
        internal.agent_activity.extractToolCallsFromMessages,
        {
          companyId,
          jobId,
          agentId,
          agentName,
          threadId,
        }
      );

      // Log agent completion
      await ctx.runMutation(internal.agent_activity.logAgentActivity, {
        companyId,
        jobId,
        agentId,
        agentName,
        threadId,
        activityType: "agent_complete",
        status: "completed",
      });
    } catch (error) {
      // Log agent error
      await ctx.runMutation(internal.agent_activity.logAgentActivity, {
        companyId,
        jobId,
        agentId,
        agentName,
        threadId,
        activityType: "agent_error",
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
});

// Extract tool calls from thread messages directly
export const extractToolCallsFromMessages = internalAction({
  args: {
    companyId: v.id("founderApplications"),
    jobId: v.id("analysisJobs"),
    agentId: v.string(),
    agentName: v.string(),
    threadId: v.string(),
  },
  handler: async (ctx, { companyId, jobId, agentId, agentName, threadId }) => {
    try {
      // Get all messages directly from the thread using listMessages
      const messagesResult = await listMessages(ctx, components.agent, {
        threadId,
        paginationOpts: { cursor: null, numItems: 100 },
      });

      // Process each message to extract tool calls and results
      for (const message of messagesResult.page) {
        const messageContent = message.message;

        // Check if this is an assistant message with tool calls
        if (
          messageContent &&
          typeof messageContent === "object" &&
          "content" in messageContent &&
          Array.isArray(messageContent.content)
        ) {
          // Look for tool calls and results in the content array
          for (const item of messageContent.content) {
            if (item.type === "tool-call") {
              await ctx.runMutation(internal.agent_activity.logAgentActivity, {
                companyId,
                jobId,
                agentId,
                agentName,
                threadId,
                activityType: "tool_call",
                toolName: item.toolName,
                toolInput: item.args,
                status: "completed",
                metadata: {
                  messageId: message._id,
                  toolCallId: item.toolCallId,
                },
              });
            } else if (item.type === "tool-result") {
              await ctx.runMutation(internal.agent_activity.logAgentActivity, {
                companyId,
                jobId,
                agentId,
                agentName,
                threadId,
                activityType: "tool_result",
                toolName: item.toolName,
                toolOutput: item.output,
                status: "completed",
                metadata: {
                  messageId: message._id,
                  toolCallId: item.toolCallId,
                },
              });
            }
          }
        }

        // Check for tool messages with role "tool"
        if (
          messageContent &&
          typeof messageContent === "object" &&
          "role" in messageContent &&
          messageContent.role === "tool"
        ) {
          // Handle tool result messages
          if (messageContent.content && Array.isArray(messageContent.content)) {
            for (const item of messageContent.content) {
              if (item.type === "tool-result") {
                await ctx.runMutation(
                  internal.agent_activity.logAgentActivity,
                  {
                    companyId,
                    jobId,
                    agentId,
                    agentName,
                    threadId,
                    activityType: "tool_result",
                    toolName: item.toolName,
                    toolOutput: item.result || item.output,
                    status: "completed",
                    metadata: {
                      messageId: message._id,
                      toolCallId: item.toolCallId,
                    },
                  }
                );
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error extracting tool calls from messages:", error);
    }
  },
});

// Query to get agent messages
export const getAgentMessages = query({
  args: {
    companyId: v.id("founderApplications"),
    jobId: v.id("analysisJobs"),
    agentId: v.string(),
  },
  handler: async (ctx, { companyId, jobId, agentId }) => {
    return await ctx.db
      .query("agentMessages")
      .withIndex("by_companyId_jobId", (q) =>
        q.eq("companyId", companyId).eq("jobId", jobId)
      )
      .filter((q) => q.eq(q.field("agentId"), agentId))
      .order("asc")
      .collect();
  },
});

// Query to get agent activity for a specific job
export const getAgentActivity = query({
  args: {
    companyId: v.id("founderApplications"),
    jobId: v.id("analysisJobs"),
    agentId: v.optional(v.string()),
    activityType: v.optional(
      v.union(
        v.literal("tool_call"),
        v.literal("tool_result"),
        v.literal("agent_start"),
        v.literal("agent_complete"),
        v.literal("agent_error")
      )
    ),
  },
  handler: async (ctx, { companyId, jobId, agentId, activityType }) => {
    let query = ctx.db
      .query("agentActivity")
      .withIndex("by_companyId_jobId", (q) =>
        q.eq("companyId", companyId).eq("jobId", jobId)
      );

    if (agentId) {
      query = query.filter((q) => q.eq(q.field("agentId"), agentId));
    }

    if (activityType) {
      query = query.filter((q) => q.eq(q.field("activityType"), activityType));
    }

    return await query.order("asc").collect();
  },
});

// Query to get all agents for a job with their status
export const getAgentsStatus = query({
  args: {
    companyId: v.id("founderApplications"),
    jobId: v.id("analysisJobs"),
  },
  handler: async (ctx, { companyId, jobId }) => {
    const activities = await ctx.db
      .query("agentActivity")
      .withIndex("by_companyId_jobId", (q) =>
        q.eq("companyId", companyId).eq("jobId", jobId)
      )
      .order("asc")
      .collect();

    // Group by agent and determine status
    const agentStatuses = new Map();

    for (const activity of activities) {
      const { agentId, agentName, activityType, status, timestamp } = activity;

      if (!agentStatuses.has(agentId)) {
        agentStatuses.set(agentId, {
          agentId,
          agentName,
          status: "pending",
          startTime: null,
          endTime: null,
          toolCalls: 0,
          toolResults: 0,
          errors: 0,
          lastActivity: timestamp,
        });
      }

      const agentStatus = agentStatuses.get(agentId);
      agentStatus.lastActivity = Math.max(agentStatus.lastActivity, timestamp);

      switch (activityType) {
        case "agent_start":
          agentStatus.status = "running";
          agentStatus.startTime = timestamp;
          break;
        case "agent_complete":
          agentStatus.status = "completed";
          agentStatus.endTime = timestamp;
          break;
        case "agent_error":
          agentStatus.status = "error";
          agentStatus.endTime = timestamp;
          agentStatus.errors++;
          break;
        case "tool_call":
          agentStatus.toolCalls++;
          break;
        case "tool_result":
          agentStatus.toolResults++;
          break;
      }
    }

    return Array.from(agentStatuses.values()).sort(
      (a, b) => a.lastActivity - b.lastActivity
    );
  },
});

// Query to get tool calls for a specific agent
export const getAgentToolCalls = query({
  args: {
    companyId: v.id("founderApplications"),
    jobId: v.id("analysisJobs"),
    agentId: v.string(),
  },
  handler: async (ctx, { companyId, jobId, agentId }) => {
    const toolCalls = await ctx.db
      .query("agentActivity")
      .withIndex("by_companyId_jobId", (q) =>
        q.eq("companyId", companyId).eq("jobId", jobId)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("agentId"), agentId),
          q.eq(q.field("activityType"), "tool_call")
        )
      )
      .order("asc")
      .collect();

    const toolResults = await ctx.db
      .query("agentActivity")
      .withIndex("by_companyId_jobId", (q) =>
        q.eq("companyId", companyId).eq("jobId", jobId)
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("agentId"), agentId),
          q.eq(q.field("activityType"), "tool_result")
        )
      )
      .order("asc")
      .collect();

    // Combine tool calls with their results
    const combined = [];
    const resultsMap = new Map();

    // Create a map of tool results by tool call ID
    for (const result of toolResults) {
      const toolCallId = result.metadata?.toolCallId;
      if (toolCallId) {
        resultsMap.set(toolCallId, result);
      }
    }

    // Combine tool calls with their results
    for (const toolCall of toolCalls) {
      const toolCallId = toolCall.metadata?.toolCallId;
      const result = toolCallId ? resultsMap.get(toolCallId) : null;

      combined.push({
        ...toolCall,
        result,
        executionTimeMs:
          result && toolCall.timestamp
            ? result.timestamp - toolCall.timestamp
            : null,
      });
    }

    return combined;
  },
});

// Query to get real-time activity updates
export const getRecentActivity = query({
  args: {
    companyId: v.id("founderApplications"),
    jobId: v.id("analysisJobs"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { companyId, jobId, limit = 50 }) => {
    return await ctx.db
      .query("agentActivity")
      .withIndex("by_companyId_jobId", (q) =>
        q.eq("companyId", companyId).eq("jobId", jobId)
      )
      .order("desc")
      .take(limit);
  },
});
