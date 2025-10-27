"use client";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProvenanceBadge from "./provenance-badge";
import TrustChecks from "./trust-checks";

export type Source = {
  title: string;
  url: string;
  date: string;
  confidence: number;
  extractedFacts: string[];
};

export type Metric = {
  key: string;
  label: string;
  value: number;
  unit?: string;
  peerMedian?: number;
  sources: Source[];
  checks: { label: string; status: "pass" | "warn"; note?: string }[];
};

export type CompanySnapshot = {
  company: string;
  sector: string;
  stage: string;
  ask: string;
  summary: string;
  lastUpdated: string;
  metrics: Metric[];
  risks: {
    severity: "low" | "med" | "high";
    label: string;
    evidence: string;
  }[];
};

interface SnapshotProps {
  company: CompanySnapshot;
}

export default function Snapshot({ company }: SnapshotProps) {
  const s = company;
  const top = s.metrics.slice(0, 2);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Company Snapshot</CardTitle>
          <CardDescription>
            Quick summary for triage. Each headline metric links to evidence and
            trust checks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{s.stage}</Badge>
            <Badge variant="secondary">{s.sector}</Badge>
          </div>
          <div className="text-lg font-medium">{s.company}</div>
          <div className="text-sm text-muted-foreground">Ask: {s.ask}</div>
          <p className="mt-2 text-sm">{s.summary}</p>
          <p className="text-xs text-muted-foreground">
            Last updated {s.lastUpdated}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Headlines</CardTitle>
          <CardDescription>Top signals with provenance.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {top.map((m) => (
            <div key={m.key} className="rounded-md border p-3">
              <div className="flex items-center justify-between">
                <div className="font-medium">
                  {m.label}: {m.value}
                  {m.unit ? m.unit : ""}
                </div>
                <div className="text-xs text-muted-foreground">
                  Peer median {m.peerMedian}
                  {m.unit ? m.unit : ""}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {m.sources.slice(0, 2).map((src) => (
                  <ProvenanceBadge
                    key={src.url}
                    title={src.title}
                    url={src.url}
                    confidence={src.confidence}
                  />
                ))}
              </div>
              <div className="mt-2">
                <TrustChecks items={m.checks} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
