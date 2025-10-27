"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { Activity, CheckCircle, XCircle, Wrench, Play } from "lucide-react";
import React from "react";

interface ActivityItem {
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
}

interface RecentActivityProps {
  recentActivity: ActivityItem[];
  getToolIcon: (toolName: string) => React.ReactNode;
  getAgentIcon: (agentId: string) => string;
}

export function RecentActivity({
  recentActivity,
  getToolIcon,
  getAgentIcon,
}: RecentActivityProps) {
  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case "agent_start":
        return <Play className="h-4 w-4 text-blue-600" />;
      case "agent_complete":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "agent_error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "tool_call":
        return <Wrench className="h-4 w-4 text-orange-600" />;
      case "tool_result":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case "agent_start":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "agent_complete":
        return "bg-green-100 text-green-800 border-green-200";
      case "agent_error":
        return "bg-red-100 text-red-800 border-red-200";
      case "tool_call":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "tool_result":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getActivityLabel = (activityType: string) => {
    switch (activityType) {
      case "agent_start":
        return "Agent Started";
      case "agent_complete":
        return "Agent Completed";
      case "agent_error":
        return "Agent Error";
      case "tool_call":
        return "Tool Call";
      case "tool_result":
        return "Tool Result";
      default:
        return activityType;
    }
  };

  // Group tool calls with their results for combined display
  const processedActivities = React.useMemo(() => {
    const activities = recentActivity;
    const result: Array<
      | ActivityItem
      | {
          type: "tool_combined";
          toolCall: ActivityItem;
          toolResult?: ActivityItem;
        }
    > = [];

    // Create a map of tool results by toolCallId
    const toolResultsMap = new Map<string, ActivityItem>();
    const processedToolCallIds = new Set<string>();

    // First pass: collect tool results
    for (const activity of activities) {
      if (
        activity.activityType === "tool_result" &&
        activity.metadata?.toolCallId
      ) {
        toolResultsMap.set(activity.metadata.toolCallId, activity);
      }
    }

    // Second pass: process activities
    for (const activity of activities) {
      if (
        activity.activityType === "tool_call" &&
        activity.metadata?.toolCallId
      ) {
        const toolCallId = activity.metadata.toolCallId;
        if (!processedToolCallIds.has(toolCallId)) {
          const toolResult = toolResultsMap.get(toolCallId);
          result.push({
            type: "tool_combined",
            toolCall: activity,
            toolResult,
          });
          processedToolCallIds.add(toolCallId);
        }
      } else if (
        activity.activityType !== "tool_result" ||
        !activity.metadata?.toolCallId ||
        !toolResultsMap.has(activity.metadata.toolCallId)
      ) {
        result.push(activity);
      }
    }

    return result;
  }, [recentActivity]);

  const getToolStatus = (toolCall: ActivityItem, toolResult?: ActivityItem) => {
    if (toolResult) {
      return toolResult.status === "error"
        ? "output-error"
        : "output-available";
    }
    return "input-available";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
          {recentActivity.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {recentActivity.length} activities
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Real-time feed of agent activities and tool usage
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {processedActivities.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-4">
              No recent activity
            </div>
          ) : (
            processedActivities.map((activity, index) => {
              // Handle combined tool calls
              if ("type" in activity && activity.type === "tool_combined") {
                const { toolCall, toolResult } = activity;
                const status = getToolStatus(toolCall, toolResult);

                return (
                  <div key={toolCall._id}>
                    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                      <div className="shrink-0 mt-0.5">
                        <Wrench className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="w-full">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">
                            {getAgentIcon(toolCall.agentId)}
                          </span>
                          <span className="text-sm font-medium">
                            {toolCall.agentName}
                          </span>
                          <Badge
                            className="text-xs bg-orange-100 text-orange-800 border-orange-200"
                            variant="outline"
                          >
                            Tool Call
                          </Badge>
                          {toolCall.toolName && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              {getToolIcon(toolCall.toolName)}
                              <span>{toolCall.toolName}</span>
                            </div>
                          )}
                        </div>

                        <div className="text-xs text-muted-foreground mb-2">
                          {new Date(toolCall.timestamp).toLocaleString()}
                        </div>

                        <div className="w-full">
                          <Tool defaultOpen={false} className="w-full">
                            <ToolHeader
                              type={`tool-${toolCall.toolName || "unknown"}`}
                              state={status as any}
                              className="w-full"
                            />
                            <ToolContent>
                              <ToolInput input={toolCall.toolInput || {}} />

                              {toolResult && (
                                <ToolOutput
                                  output={toolResult.toolOutput}
                                  errorText={
                                    toolResult.status === "error"
                                      ? toolResult.errorMessage ||
                                        "Tool execution failed"
                                      : undefined
                                  }
                                />
                              )}
                            </ToolContent>
                          </Tool>
                        </div>
                      </div>
                    </div>
                    {index < processedActivities.length - 1 && (
                      <Separator className="my-2" />
                    )}
                  </div>
                );
              }

              const regularActivity = activity as ActivityItem;
              return (
                <div key={regularActivity._id}>
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">
                          {getAgentIcon(regularActivity.agentId)}
                        </span>
                        <span className="text-sm font-medium">
                          {regularActivity.agentName}
                        </span>
                        <Badge
                          className={`text-xs ${getActivityColor(
                            regularActivity.activityType,
                          )}`}
                          variant="outline"
                        >
                          {getActivityLabel(regularActivity.activityType)}
                        </Badge>
                      </div>

                      {/* Agent error details */}
                      {regularActivity.activityType === "agent_error" &&
                        regularActivity.errorMessage && (
                          <div className="text-xs bg-red-50 text-red-700 p-2 rounded">
                            <div className="font-medium mb-1">Error:</div>
                            {regularActivity.errorMessage}
                          </div>
                        )}

                      {regularActivity.executionTimeMs && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Execution time: {regularActivity.executionTimeMs}ms
                        </div>
                      )}
                    </div>
                  </div>
                  {index < processedActivities.length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
