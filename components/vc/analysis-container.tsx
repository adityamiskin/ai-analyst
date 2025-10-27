"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import AIVisualizations from "@/components/vc/ai-visualizations";
import Risks from "@/components/vc/risks";
import { SourcesEvidence } from "@/components/vc/vc-sources-evidence";
import AgentActivityDashboard from "@/components/vc/agent-activity-dashboard";
import FounderInformation from "@/components/vc/founder-information";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Response } from "@/components/ai-elements/response";
import type { MultiAgentSnapshot } from "@/lib/types";

export default function AnalysisContainer({
  application,
}: {
  application: Doc<"founderApplications">;
}) {
  const params = useParams<{ id?: string }>();
  const companyId = params?.id as Id<"founderApplications"> | undefined;

  // Multi-agent analysis
  const latestMultiAgent = useQuery(
    api.multi_agent_analysis.getLatestMultiAgentSnapshot,
    companyId ? { companyId: companyId } : "skip"
  );
  const startMultiAgent = useMutation(
    api.multi_agent_analysis.startMultiAgentAnalysis
  );
  const multiAgentJobStatus = useQuery(
    api.multi_agent_analysis.getJobStatus,
    companyId
      ? {
          companyId: companyId,
        }
      : "skip"
  );

  async function onRunMultiAgent() {
    if (!companyId) return;
    try {
      await startMultiAgent({
        companyId: companyId,
      });
    } catch (error) {
      console.error("Failed to start multi-agent analysis:", error);
    }
  }

  // Determine if analysis is running
  const isMultiAgentRunning =
    (multiAgentJobStatus &&
      ["queued", "running", "ingesting", "analyzing"].includes(
        multiAgentJobStatus.status
      )) ||
    false;

  const multiAgentSnapshot = latestMultiAgent
    ? latestMultiAgent.snapshot
    : undefined;
  const isLoadingMultiAgent = latestMultiAgent === undefined && !!companyId;
  const hasNoMultiAgentData = latestMultiAgent === null;

  const getRecommendation = (
    recommendation: MultiAgentSnapshot["investmentRecommendation"]
  ) => {
    switch (recommendation) {
      case "strong_buy":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          label: "Strong Buy",
        };
      case "buy":
        return {
          color: "bg-green-50 text-green-700 border-green-100",
          label: "Buy",
        };
      case "hold":
        return {
          color: "bg-yellow-50 text-yellow-700 border-yellow-100",
          label: "Hold",
        };
      case "sell":
        return {
          color: "bg-red-50 text-red-700 border-red-100",
          label: "Sell",
        };
      case "strong_sell":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          label: "Strong Sell",
        };
      default:
        return {
          color: "bg-gray-50 text-gray-700 border-gray-100",
          label: recommendation,
        };
    }
  };

  const getJobStatus = (status?: string) => {
    switch (status) {
      case "completed":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          label: "Completed",
        };
      case "failed":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          label: "Failed",
        };
      case "running":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          label: "Running",
        };
      case "ingesting":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          label: "Ingesting Data",
        };
      case "analyzing":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          label: "Analyzing",
        };
      case "queued":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          label: "Queued",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          label: "Unknown",
        };
    }
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          AI Analyst Report
        </h2>
        <div className="flex gap-2">
          <Button
            onClick={onRunMultiAgent}
            disabled={!companyId || isMultiAgentRunning}
            variant={multiAgentSnapshot ? "outline" : "default"}
            className={
              multiAgentJobStatus?.status === "failed"
                ? "bg-red-600 hover:bg-red-700"
                : multiAgentSnapshot
                ? ""
                : "bg-blue-600 hover:bg-blue-700"
            }
          >
            {isMultiAgentRunning
              ? multiAgentJobStatus?.message || "Running Multi-Agent…"
              : multiAgentJobStatus?.status === "failed"
              ? "Retry Analysis"
              : multiAgentSnapshot
              ? "Re-run Analysis"
              : "Start Multi-Agent Analysis"}
          </Button>
        </div>
      </div>

      {!companyId && (
        <div className="text-sm text-muted-foreground">
          Select a company to view analysis.
        </div>
      )}

      {companyId && (
        <Tabs defaultValue="founder-info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="founder-info">Founder Information</TabsTrigger>
            <TabsTrigger
              value="multi-agent"
              className="flex items-center gap-2"
            >
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  Multi-Agent Analysis
                  {multiAgentSnapshot && (
                    <Badge
                      className={
                        getRecommendation(
                          multiAgentSnapshot.investmentRecommendation
                        ).color
                      }
                    >
                      {
                        getRecommendation(
                          multiAgentSnapshot.investmentRecommendation
                        ).label
                      }
                    </Badge>
                  )}
                  {multiAgentJobStatus && (
                    <Badge
                      className={getJobStatus(multiAgentJobStatus.status).color}
                    >
                      {getJobStatus(multiAgentJobStatus.status).label}
                    </Badge>
                  )}
                </div>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="agent-activity"
              className="flex items-center gap-2"
            >
              <div className="flex flex-col items-start gap-1">
                <div className="flex items-center gap-2">
                  Agent Activity
                  {multiAgentJobStatus && (
                    <Badge
                      className={getJobStatus(multiAgentJobStatus.status).color}
                    >
                      {getJobStatus(multiAgentJobStatus.status).label}
                    </Badge>
                  )}
                </div>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="founder-info" className="mt-6">
            {application ? (
              <FounderInformation application={application} />
            ) : (
              <div className="text-sm text-muted-foreground">
                Loading founder information…
              </div>
            )}
          </TabsContent>

          <TabsContent value="multi-agent" className="mt-6">
            {isLoadingMultiAgent && (
              <div className="text-sm text-muted-foreground">
                Loading multi-agent analysis…
              </div>
            )}

            {isMultiAgentRunning && multiAgentJobStatus && (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      Analysis in Progress
                    </h3>
                    <Badge
                      className={getJobStatus(multiAgentJobStatus.status).color}
                    >
                      {getJobStatus(multiAgentJobStatus.status).label}
                    </Badge>
                  </div>
                  <Progress
                    value={multiAgentJobStatus.progress}
                    className="mb-2"
                  />
                  <p className="text-sm text-muted-foreground">
                    {multiAgentJobStatus.message}
                  </p>
                </CardContent>
              </Card>
            )}

            {hasNoMultiAgentData &&
              !isMultiAgentRunning &&
              multiAgentJobStatus?.status !== "failed" && (
                <div className="rounded-md border p-4 text-sm">
                  No multi-agent analysis found for this company. Click
                  "Multi-Agent Analysis" to generate one.
                </div>
              )}

            {multiAgentJobStatus?.status === "failed" &&
              !multiAgentSnapshot && (
                <Card className="mb-6 border-red-200">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-red-800">
                        Analysis Failed
                      </h3>
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        Failed
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {multiAgentJobStatus.error ||
                        "The multi-agent analysis encountered an error. Click 'Retry Analysis' to try again."}
                    </p>
                    <Button
                      onClick={onRunMultiAgent}
                      disabled={!companyId || isMultiAgentRunning}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Retry Analysis
                    </Button>
                  </CardContent>
                </Card>
              )}

            {multiAgentSnapshot && (
              <>
                {/* Investment Recommendation Card */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      Investment Recommendation
                      <Badge
                        className={
                          getRecommendation(
                            multiAgentSnapshot.investmentRecommendation
                          ).color
                        }
                      >
                        {
                          getRecommendation(
                            multiAgentSnapshot.investmentRecommendation
                          ).label
                        }
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Overall Confidence:{" "}
                      {Math.round(multiAgentSnapshot.overallConfidence * 100)}%
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Response className="text-sm">
                      {multiAgentSnapshot.recommendationReasoning}
                    </Response>
                  </CardContent>
                </Card>

                {/* Overall Summary */}
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Overall Analysis Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Response className="text-sm">
                      {multiAgentSnapshot.overallSummary}
                    </Response>
                  </CardContent>
                </Card>

                {/* Individual Agent Analyses */}
                <div className="grid gap-6">
                  {multiAgentSnapshot.agentAnalyses.map((agentAnalysis) => (
                    <Card key={agentAnalysis.agentId}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          {agentAnalysis.agentName}
                          <Badge variant="outline">
                            {Math.round(agentAnalysis.confidence * 100)}%
                            confidence
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Summary</h4>
                          <Response className="text-sm text-muted-foreground">
                            {agentAnalysis.summary}
                          </Response>
                        </div>

                        {agentAnalysis.keyFindings.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Key Findings</h4>
                            <ul className="text-sm space-y-1">
                              {agentAnalysis.keyFindings.map(
                                (finding: string, index: number) => (
                                  <li
                                    key={index}
                                    className="flex items-start gap-2"
                                  >
                                    <span className="text-blue-500 mt-1">
                                      •
                                    </span>
                                    <span>{finding}</span>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                        {agentAnalysis.recommendations.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">
                              Recommendations
                            </h4>
                            <ul className="text-sm space-y-1">
                              {agentAnalysis.recommendations.map(
                                (rec: string, index: number) => (
                                  <li
                                    key={index}
                                    className="flex items-start gap-2"
                                  >
                                    <span className="text-green-500 mt-1">
                                      →
                                    </span>
                                    <span>{rec}</span>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                        {agentAnalysis.risks.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Risks</h4>
                            <div className="space-y-2">
                              {agentAnalysis.risks.map(
                                (risk, index: number) => (
                                  <div
                                    key={index}
                                    className="flex items-start gap-2 p-2 rounded border"
                                  >
                                    <Badge
                                      variant={
                                        risk.severity === "high"
                                          ? "destructive"
                                          : risk.severity === "med"
                                          ? "default"
                                          : "secondary"
                                      }
                                      className="text-xs"
                                    >
                                      {risk.severity}
                                    </Badge>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">
                                        {risk.label}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {risk.evidence}
                                      </p>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Separator className="my-8" />

                {/* Consolidated Metrics and Risks */}
                <section id="consolidated-metrics" className="scroll-mt-24">
                  <AIVisualizations company={multiAgentSnapshot} />
                </section>
                <Separator className="my-8" />
                <section id="consolidated-risks" className="scroll-mt-24">
                  <Risks company={multiAgentSnapshot} />
                </section>
                <Separator className="my-8" />
                <section id="sources" className="scroll-mt-24">
                  <SourcesEvidence company={multiAgentSnapshot} />
                </section>
              </>
            )}
          </TabsContent>

          <TabsContent value="agent-activity" className="mt-6">
            {multiAgentJobStatus ? (
              <AgentActivityDashboard
                companyId={companyId as Id<"founderApplications">}
                jobId={multiAgentJobStatus._id}
              />
            ) : (
              <div className="text-sm text-muted-foreground">
                No multi-agent analysis job found. Start a multi-agent analysis
                to view agent activity.
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </main>
  );
}
