"use client";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import type { MultiAgentSnapshot } from "@/lib/types";

interface SourcesEvidenceProps {
  company: MultiAgentSnapshot;
}

export function SourcesEvidence({ company }: SourcesEvidenceProps) {
  const metrics = company.consolidatedMetrics;

  // Transform company metrics into sources data structure
  const DATA = metrics.map((metric) => ({
    metric: metric.label,
    value: `${metric.value}${metric.unit || ""}`,
    sources: metric.sources.map((source) => ({
      title: source.title,
      url: source.url,
      date: source.date,
      confidence: source.confidence,
      extracted: source.extractedFacts,
    })),
    checks: metric.checks.map((check) => ({
      label: check.label,
      status: check.status === "pass" ? "pass" : ("warn" as "pass" | "warn"),
    })),
  }));
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sources & Evidence</CardTitle>
        <CardDescription>
          Per-metric provenance: clickable sources with confidence, dates, and
          extraction notes. Trust checks summarize automated validations so
          investors can audit the data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {DATA.map((item) => (
            <AccordionItem key={item.metric} value={item.metric}>
              <AccordionTrigger>
                <div className="flex w-full items-center justify-between">
                  <span>{item.metric}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.value} • {item.sources.length} sources
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 text-xs">
                    {item.checks.map((c) => (
                      <Badge
                        key={c.label}
                        variant={
                          c.status === "pass" ? "secondary" : "destructive"
                        }
                      >
                        {c.label}
                      </Badge>
                    ))}
                  </div>
                  {item.sources.map((s) => (
                    <div key={s.url} className="rounded-md border p-3">
                      <div className="flex items-center justify-between">
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium underline"
                        >
                          {s.title}
                        </a>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(s.confidence * 100)}% • {s.date}
                        </span>
                      </div>
                      <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                        {s.extracted.map((e, i) => (
                          <li key={i}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <p className="mt-4 text-xs text-muted-foreground">
          Tab brief: Use this to verify claims. Each metric clearly shows where
          data comes from, how confident we are, and what automated checks
          passed or flagged issues.
        </p>
      </CardContent>
    </Card>
  );
}
