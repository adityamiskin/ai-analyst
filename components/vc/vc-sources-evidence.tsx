"use client"

import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

type Source = {
  title: string
  url: string
  date: string
  confidence: number // 0..1
  extracted: string[]
}

const DATA: {
  metric: string
  value: string
  sources: Source[]
  checks: { label: string; status: "pass" | "warn" }[]
}[] = [
  {
    metric: "MRR",
    value: "$28k",
    sources: [
      {
        title: "Stripe Revenue Export (Jul 2025)",
        url: "https://example.com/stripe",
        date: "2025-07-31",
        confidence: 0.92,
        extracted: ["Recurring revenue lines sum to $27,846", "Net after refunds $27,331"],
      },
      {
        title: "Founder Update (Aug 2025)",
        url: "https://example.com/update",
        date: "2025-08-10",
        confidence: 0.7,
        extracted: ["Stated MRR $28k"],
      },
    ],
    checks: [
      { label: "ARR vs MRR consistency", status: "pass" },
      { label: "Data freshness (<60 days)", status: "pass" },
    ],
  },
  {
    metric: "MoM Growth",
    value: "22%",
    sources: [
      {
        title: "Bank Statements (Q3 snapshots)",
        url: "https://example.com/bank",
        date: "2025-08-01",
        confidence: 0.8,
        extracted: ["Deposits trend +21.9% month over month"],
      },
    ],
    checks: [
      { label: "Seasonality adjusted", status: "warn" },
      { label: "Variance vs benchmark", status: "pass" },
    ],
  },
  {
    metric: "TAM (Top-down)",
    value: "$4.2B",
    sources: [
      {
        title: "Gartner QA Market 2024",
        url: "https://example.com/gartner",
        date: "2024-12-15",
        confidence: 0.6,
        extracted: ["Application testing tools CAGR 13%"],
      },
      {
        title: "Bottom-up model",
        url: "https://example.com/model",
        date: "2025-08-28",
        confidence: 0.7,
        extracted: ["100k targets x $35/mo → $42M SAM"],
      },
    ],
    checks: [{ label: "Top-down vs bottom-up parity", status: "warn" }],
  },
]

export function SourcesEvidence() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sources & Evidence</CardTitle>
        <CardDescription>
          Per-metric provenance: clickable sources with confidence, dates, and extraction notes. Trust checks summarize
          automated validations so investors can audit the data.
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
                      <Badge key={c.label} variant={c.status === "pass" ? "secondary" : "destructive"}>
                        {c.label}
                      </Badge>
                    ))}
                  </div>
                  {item.sources.map((s) => (
                    <div key={s.url} className="rounded-md border p-3">
                      <div className="flex items-center justify-between">
                        <a href={s.url} target="_blank" rel="noreferrer" className="font-medium underline">
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
          Tab brief: Use this to verify claims. Each metric clearly shows where data comes from, how confident we are,
          and what automated checks passed or flagged issues.
        </p>
      </CardContent>
    </Card>
  )
}
