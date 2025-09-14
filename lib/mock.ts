export type Source = {
  title: string
  url: string
  date: string
  confidence: number // 0-1
  extractedFacts: string[]
}

export type Metric = {
  key: string
  label: string
  value: number
  unit?: string
  peerMedian?: number
  sources: Source[]
  checks: { label: string; status: "pass" | "warn"; note?: string }[]
}

export type CompanySnapshot = {
  company: string
  sector: string
  stage: string
  ask: string
  summary: string
  lastUpdated: string
  metrics: Metric[]
  risks: { severity: "low" | "med" | "high"; label: string; evidence: string }[]
}

export const mockSnapshot: CompanySnapshot = {
  company: "Acme AI",
  sector: "Developer Tools",
  stage: "Seed",
  ask: "$1.5M for 15%",
  summary:
    "Self-serve AI agents that automate post-merge QA for web apps. 16 paying customers, strong founder-market fit.",
  lastUpdated: "2025-08-30",
  metrics: [
    {
      key: "mrr",
      label: "MRR",
      value: 28,
      unit: "k",
      peerMedian: 22,
      sources: [
        {
          title: "Stripe Revenue Export (Jul 2025)",
          url: "https://example.com/stripe-export",
          date: "2025-07-31",
          confidence: 0.92,
          extractedFacts: ["Recurring revenue lines sum to $27,846", "Net of refunds is $27,331"],
        },
        {
          title: "Founder Update (Aug 2025)",
          url: "https://example.com/founder-update",
          date: "2025-08-10",
          confidence: 0.7,
          extractedFacts: ["Stated MRR $28k"],
        },
      ],
      checks: [
        { label: "ARR vs MRR consistency", status: "pass" },
        { label: "Outlier vs peer median", status: "pass" },
        { label: "Data freshness (<60 days)", status: "pass" },
      ],
    },
    {
      key: "growth",
      label: "MoM Growth",
      value: 22,
      unit: "%",
      peerMedian: 12,
      sources: [
        {
          title: "Bank Statements (Q3 snapshots)",
          url: "https://example.com/bank",
          date: "2025-08-01",
          confidence: 0.8,
          extractedFacts: ["Deposits trend +21.9% month over month"],
        },
      ],
      checks: [
        { label: "Seasonality adjusted", status: "warn", note: "July promo drove +4% uplift" },
        { label: "Variance vs benchmark", status: "pass" },
      ],
    },
    {
      key: "tam",
      label: "TAM (Top-down)",
      value: 4.2,
      unit: "B",
      peerMedian: 3.1,
      sources: [
        {
          title: "Gartner QA Market 2024",
          url: "https://example.com/gartner",
          date: "2024-12-15",
          confidence: 0.6,
          extractedFacts: ["Application testing tools CAGR 13%"],
        },
        {
          title: "Bottom-up model",
          url: "https://example.com/model",
          date: "2025-08-28",
          confidence: 0.7,
          extractedFacts: ["100k targets x $35/mo -> $42M SAM"],
        },
      ],
      checks: [{ label: "Top-down vs bottom-up parity", status: "warn", note: "Bottom-up more conservative" }],
    },
  ],
  risks: [
    { severity: "med", label: "Churn spikes in SMB cohort", evidence: "Month 2 churn 7.9% vs benchmark 3–5%" },
    { severity: "high", label: "Team gap: no FT CTO", evidence: "Product led by contractor, FT hire in pipeline" },
  ],
}
