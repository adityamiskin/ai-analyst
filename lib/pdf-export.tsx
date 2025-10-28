"use client";

import React from "react";
import type { MultiAgentSnapshot } from "@/lib/types";
import type { Doc } from "@/convex/_generated/dataModel";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 12,
    fontFamily: "Helvetica",
    color: "#1f2937",
  },
  brandBar: {
    height: 6,
    backgroundColor: "#1e40af",
    marginBottom: 12,
    borderRadius: 3,
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: "#e5e7eb",
    borderBottomStyle: "solid",
    paddingBottom: 14,
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    lineHeight: 1.5,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 1.5,
  },
  meta: {
    marginTop: 10,
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "solid",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
  },
  chipText: { fontSize: 9, color: "#374151", lineHeight: 1.5 },
  section: { marginTop: 14, marginBottom: 16 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e40af",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    borderBottomStyle: "solid",
    paddingBottom: 6,
    marginBottom: 8,
    lineHeight: 1.5,
  },
  recommendationBox: {
    borderLeftWidth: 4,
    borderLeftColor: "#22c55e",
    backgroundColor: "#f0fdf4",
    padding: 12,
    borderRadius: 4,
  },
  recommendationLabel: {
    fontSize: 12,
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 4,
    letterSpacing: 0.5,
    lineHeight: 1.5,
  },
  recommendationValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#22c55e",
    marginBottom: 4,
    lineHeight: 1.5,
  },
  confidence: { fontSize: 12, color: "#6b7280", lineHeight: 1.5 },
  content: { fontSize: 12, lineHeight: 1.5, color: "#374151" },
  companyInfo: {
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderStyle: "solid",
    padding: 10,
    borderRadius: 4,
  },
  infoRow: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 6,
  },
  infoLabel: {
    width: 70,
    fontWeight: "bold",
    color: "#1e40af",
    lineHeight: 1.5,
  },
  infoValue: { flex: 1, color: "#374151", fontSize: 12, lineHeight: 1.5 },
  findingsLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
    textTransform: "uppercase",
    marginBottom: 4,
    lineHeight: 1.5,
  },
  findingItem: {
    fontSize: 12,
    color: "#4b5563",
    marginBottom: 2,
    lineHeight: 1.5,
  },
  metricsGrid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  metricBox: {
    flexBasis: "48%",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "solid",
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 3,
    lineHeight: 1.5,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e40af",
    lineHeight: 1.5,
  },
  riskItem: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "solid",
    borderRadius: 4,
    marginBottom: 6,
    backgroundColor: "#ffffff",
  },
  riskSeverity: {
    minWidth: 42,
    textAlign: "center",
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 3,
    fontSize: 12,
    fontWeight: "bold",
    color: "#991b1b",
    backgroundColor: "#fecaca",
    lineHeight: 1.5,
  },
  riskLabel: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
    lineHeight: 1.5,
  },
  riskEvidence: {
    fontSize: 12,
    color: "#4b5563",
    marginTop: 2,
    lineHeight: 1.5,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    borderTopStyle: "solid",
    paddingTop: 8,
    color: "#9ca3af",
    fontSize: 8,
    textAlign: "center",
    lineHeight: 1.5,
  },
});

function AnalysisPDFDocument({
  snapshot,
  application,
}: {
  snapshot: MultiAgentSnapshot;
  application: Doc<"founderApplications">;
}) {
  const recommendationColors: Record<string, string> = {
    strong_buy: "#22c55e",
    buy: "#84cc16",
    hold: "#eab308",
    sell: "#f97316",
    strong_sell: "#ef4444",
  };

  const recColor =
    recommendationColors[snapshot.investmentRecommendation] || "#6b7280";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{snapshot.company}</Text>
          <View style={styles.meta}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>Sector:</Text>
              <Text style={styles.chipText}>{snapshot.sector}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>Stage:</Text>
              <Text style={styles.chipText}>{snapshot.stage}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>Ask:</Text>
              <Text style={styles.chipText}>{snapshot.ask}</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>Date:</Text>
              <Text style={styles.chipText}>
                {new Date().toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Company Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Company Information</Text>
          <View style={styles.companyInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{application.company.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Website:</Text>
              <Text style={styles.infoValue}>
                {application.company.website}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoValue}>
                {application.company.location}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Stage:</Text>
              <Text style={styles.infoValue}>{application.company.stage}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>One-liner:</Text>
              <Text style={styles.infoValue}>
                {application.company.oneLiner}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Description:</Text>
              <Text style={styles.infoValue}>
                {application.company.whatDoYouDo}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Why Now:</Text>
              <Text style={styles.infoValue}>{application.company.whyNow}</Text>
            </View>
          </View>
        </View>

        {/* Team Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team</Text>
          <View style={styles.companyInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Full-time:</Text>
              <Text style={styles.infoValue}>
                {application.team.isFullTime ? "Yes" : "No"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Duration:</Text>
              <Text style={styles.infoValue}>
                {application.team.howLongWorked}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Experience:</Text>
              <Text style={styles.infoValue}>
                {application.team.relevantExperience}
              </Text>
            </View>
            <View style={{ marginTop: 8 }}>
              <Text style={styles.findingsLabel}>Founders</Text>
              {application.team.founders.map((founder, i) => (
                <Text
                  key={i}
                  style={{ fontSize: 11, color: "#4b5563", marginBottom: 4 }}
                >
                  • {founder.name} ({founder.designation}) - {founder.email}
                </Text>
              ))}
            </View>
          </View>
        </View>

        {/* Product Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product</Text>
          <View style={styles.companyInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Description:</Text>
              <Text style={styles.infoValue}>
                {application.product.description}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Defensibility:</Text>
              <Text style={styles.infoValue}>
                {application.product.defensibility}
              </Text>
            </View>
            {application.product.demoUrl && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Demo URL:</Text>
                <Text style={styles.infoValue}>
                  {application.product.demoUrl}
                </Text>
              </View>
            )}
            {application.product.videoUrl && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Video URL:</Text>
                <Text style={styles.infoValue}>
                  {application.product.videoUrl}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Market Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Market</Text>
          <View style={styles.companyInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Customer:</Text>
              <Text style={styles.infoValue}>
                {application.market.customer}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Competitors:</Text>
              <Text style={styles.infoValue}>
                {application.market.competitors}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Differentiation:</Text>
              <Text style={styles.infoValue}>
                {application.market.differentiation}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>GTM:</Text>
              <Text style={styles.infoValue}>{application.market.gtm}</Text>
            </View>
            {application.market.tam && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>TAM:</Text>
                <Text style={styles.infoValue}>{application.market.tam}</Text>
              </View>
            )}
            {application.market.sam && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>SAM:</Text>
                <Text style={styles.infoValue}>{application.market.sam}</Text>
              </View>
            )}
            {application.market.som && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>SOM:</Text>
                <Text style={styles.infoValue}>{application.market.som}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Traction Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Traction</Text>
          <View style={styles.companyInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Launched:</Text>
              <Text style={styles.infoValue}>
                {application.traction.isLaunched}
              </Text>
            </View>
            {application.traction.launchDate && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Launch Date:</Text>
                <Text style={styles.infoValue}>
                  {application.traction.launchDate}
                </Text>
              </View>
            )}
            {application.traction.mrr && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>MRR:</Text>
                <Text style={styles.infoValue}>{application.traction.mrr}</Text>
              </View>
            )}
            {application.traction.growth && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Growth:</Text>
                <Text style={styles.infoValue}>
                  {application.traction.growth}
                </Text>
              </View>
            )}
            {application.traction.activeUsersCount && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Active Users:</Text>
                <Text style={styles.infoValue}>
                  {application.traction.activeUsersCount}
                </Text>
              </View>
            )}
            {application.traction.pilots && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Pilots:</Text>
                <Text style={styles.infoValue}>
                  {application.traction.pilots}
                </Text>
              </View>
            )}
            {application.traction.kpis && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>KPIs:</Text>
                <Text style={styles.infoValue}>
                  {application.traction.kpis}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Recommendation */}
        <View style={[styles.recommendationBox, { borderLeftColor: recColor }]}>
          <Text style={styles.recommendationLabel}>
            Investment Recommendation
          </Text>
          <Text style={[styles.recommendationValue, { color: recColor }]}>
            {snapshot.investmentRecommendation.replace(/_/g, " ").toUpperCase()}
          </Text>
          <Text style={styles.confidence}>
            Overall Confidence: {Math.round(snapshot.overallConfidence * 100)}%
          </Text>
        </View>

        {/* Recommendation Reasoning */}
        <View style={styles.section}>
          <Text style={{ fontSize: 9, fontWeight: "bold", marginBottom: 6 }}>
            Reasoning:
          </Text>
          <Text style={styles.content}>{snapshot.recommendationReasoning}</Text>
        </View>

        {/* Executive Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <Text style={styles.content}>{snapshot.overallSummary}</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>
            Generated on {new Date().toLocaleString()} | ©
            {new Date().getFullYear()} AI Analyst
          </Text>
        </View>
      </Page>

      {/* Agent Analyses - Each on separate pages */}
      {snapshot.agentAnalyses.map((agent, idx) => (
        <Page key={idx} size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>{agent.agentName}</Text>
            <Text style={styles.confidence}>
              Confidence: {Math.round(agent.confidence * 100)}%
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.content}>{agent.summary}</Text>
          </View>

          {agent.keyFindings.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.findingsLabel}>Key Findings</Text>
              {agent.keyFindings.map((finding, i) => (
                <Text key={i} style={styles.findingItem}>
                  • {finding}
                </Text>
              ))}
            </View>
          )}

          {agent.metrics.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Metrics</Text>
              <View style={styles.metricsGrid}>
                {agent.metrics.slice(0, 4).map((metric, i) => (
                  <View key={i} style={styles.metricBox}>
                    <Text style={styles.metricLabel}>{metric.label}</Text>
                    <Text style={styles.metricValue}>{metric.value}</Text>
                    {metric.unit && (
                      <Text style={{ fontSize: 8, color: "#9ca3af" }}>
                        {metric.unit}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {agent.risks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.findingsLabel}>Identified Risks</Text>
              {agent.risks.map((risk, i) => (
                <View key={i} style={styles.riskItem}>
                  <Text style={styles.riskSeverity}>
                    {risk.severity.toUpperCase()}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.riskLabel}>{risk.label}</Text>
                    <Text style={styles.riskEvidence}>{risk.evidence}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.footer} fixed>
            <Text>
              Generated on {new Date().toLocaleString()} | Page {idx + 2}
            </Text>
          </View>
        </Page>
      ))}

      {/* Consolidated Metrics Page */}
      {snapshot.consolidatedMetrics.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>Consolidated Metrics</Text>
          </View>

          <View style={styles.metricsGrid}>
            {snapshot.consolidatedMetrics.map((metric, i) => (
              <View key={i} style={styles.metricBox}>
                <Text style={styles.metricLabel}>{metric.label}</Text>
                <Text style={styles.metricValue}>{metric.value}</Text>
                {metric.unit && (
                  <Text style={{ fontSize: 8, color: "#9ca3af" }}>
                    {metric.unit}
                  </Text>
                )}
                {metric.peerMedian && (
                  <Text
                    style={{
                      fontSize: 7,
                      color: "#9ca3af",
                      marginTop: 3,
                    }}
                  >
                    Peer Median: {metric.peerMedian}
                  </Text>
                )}
              </View>
            ))}
          </View>

          <View style={styles.footer} fixed>
            <Text>Generated on {new Date().toLocaleString()}</Text>
          </View>
        </Page>
      )}

      {/* Consolidated Risks Page */}
      {snapshot.consolidatedRisks.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>Consolidated Risks</Text>
          </View>

          {snapshot.consolidatedRisks.map((risk, i) => (
            <View key={i} style={styles.riskItem}>
              <Text style={styles.riskSeverity}>
                {risk.severity.toUpperCase()}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.riskLabel}>{risk.label}</Text>
                <Text style={styles.riskEvidence}>{risk.evidence}</Text>
              </View>
            </View>
          ))}

          <View style={styles.footer} fixed>
            <Text>Generated on {new Date().toLocaleString()}</Text>
          </View>
        </Page>
      )}
    </Document>
  );
}

export async function exportAnalysisToPDF(
  snapshot: MultiAgentSnapshot,
  application: Doc<"founderApplications">,
  filename?: string
) {
  // Only run on client side
  if (typeof window === "undefined") {
    throw new Error("PDF export can only be used in browser");
  }

  const doc = (
    <AnalysisPDFDocument snapshot={snapshot} application={application} />
  );

  const fileName =
    filename ||
    `${snapshot.company}-analysis-${
      new Date().toISOString().split("T")[0]
    }.pdf`;

  const blob = await pdf(doc).toBlob();

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
