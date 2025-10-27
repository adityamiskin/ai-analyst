"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import type { AgentStatusItem } from "@/lib/types";

interface AgentStatusGridProps {
  agentsStatus: AgentStatusItem[];
}

export function AgentStatusGrid({ agentsStatus }: AgentStatusGridProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "running":
        return <Activity className="h-4 w-4 text-blue-600 animate-pulse" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      case "running":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAgentIcon = (agentId: string) => {
    switch (agentId) {
      case "finance":
        return "💰";
      case "evaluation":
        return "📊";
      case "competitor":
        return "🏆";
      case "market":
        return "📈";
      case "technical":
        return "⚙️";
      case "orchestration":
        return "🎯";
      default:
        return "🤖";
    }
  };

  const getExecutionTime = (agent: AgentStatusItem) => {
    if (!agent.startTime) return null;
    const endTime = agent.endTime || Date.now();
    return Math.round((endTime - agent.startTime) / 1000);
  };

  const getProgress = (agent: AgentStatusItem) => {
    if (agent.status === "completed") return 100;
    if (agent.status === "error") return 100;
    if (agent.status === "pending") return 0;
    if (agent.status === "running") {
      // Estimate progress based on tool calls vs expected
      const expectedToolCalls = 10; // Rough estimate
      return Math.min(90, (agent.toolCalls / expectedToolCalls) * 100);
    }
    return 0;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {agentsStatus.map((agent) => (
        <Card key={agent.agentId} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getAgentIcon(agent.agentId)}</span>
                <div>
                  <CardTitle className="text-sm font-medium">
                    {agent.agentName}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {agent.toolCalls} calls • {agent.toolResults} results
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {getStatusIcon(agent.status)}
                <Badge
                  className={`text-xs ${getStatusColor(agent.status)}`}
                  variant="outline"
                >
                  {agent.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span>{Math.round(getProgress(agent))}%</span>
                </div>
                <Progress value={getProgress(agent)} className="h-2" />
              </div>

              {/* Execution Time */}
              {agent.startTime && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Execution Time</span>
                  <span>{getExecutionTime(agent)}s</span>
                </div>
              )}

              {/* Error Count */}
              {agent.errors > 0 && (
                <div className="flex justify-between text-xs text-red-600">
                  <span>Errors</span>
                  <span>{agent.errors}</span>
                </div>
              )}

              {/* Last Activity */}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Last Activity</span>
                <span>{new Date(agent.lastActivity).toLocaleTimeString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
