// Simple mock data used by the VC report UI. Replace with real data later.

export type Provenance = "founder" | "public" | "rag" | "analyst"

export const snapshot = {
  company: "Acme AI",
  stage: "Seed",
  sector: "DevTools / AI Infra",
  ask: "$2.5M SAFE",
  website: "https://acme.example",
  oneLiner: "LLM-native developer workflow to ship reliable agents.",
  metrics: [
    { label: "MRR", value: "$42k", source: "founder", confidence: 0.8, dated: "2025-08-10" },
    { label: "Growth MoM", value: "18%", source: "public", confidence: 0.7, dated: "2025-08-31" },
    { label: "Headcount", value: "12", source: "founder", confidence: 0.9, dated: "2025-08-01" },
    { label: "Churn", value: "2.3%", source: "rag", confidence: 0.65, dated: "2025-08-31" },
  ] as {
    label: string
    value: string
    source: Provenance
    confidence: number
    dated: string
  }[],
}

export const peers = [
  { name: "Peer A", mrr: 40000, growth: 12, headcount: 15, churn: 3.5 },
  { name: "Peer B", mrr: 60000, growth: 15, headcount: 20, churn: 2.1 },
  { name: "Peer C", mrr: 30000, growth: 10, headcount: 10, churn: 4.0 },
]

export const benchmarks = [
  { metric: "MRR", company: 42000, median: 43333 },
  { metric: "Growth MoM %", company: 18, median: 12.3 },
  { metric: "Churn %", company: 2.3, median: 3.2 },
]

export const checks = [
  { id: "consistency", label: "ARR vs MRR consistency", passed: true },
  {
    id: "tam_logic",
    label: "TAM logic cross-checked (bottom-up vs top-down)",
    passed: false,
    note: "Top-down addressable overstated vs ICP count.",
  },
  { id: "traction", label: "Traction vs team size anomaly", passed: true },
]

export const risks = [
  {
    id: "moat",
    title: "Shallow moat vs incumbents",
    severity: "High",
    evidence: "Similar feature set by larger devtool vendors; pricing pressure likely.",
    source: "public",
    link: "https://news.example/report",
  },
  {
    id: "team",
    title: "Missing dedicated PM",
    severity: "Medium",
    evidence: "Team page & LinkedIn scan show no PM; roadmap slippage reported.",
    source: "rag",
    link: "https://linkedin.example/acme",
  },
  {
    id: "market",
    title: "Procurement cycles slow in enterprise",
    severity: "Low",
    evidence: "Sales cycle > 100 days for 60% of pipeline.",
    source: "founder",
    link: "",
  },
] as const

export const sources = [
  { id: "deck", type: "Pitch deck", where: "Founder upload", date: "2025-08-10", items: 32, url: "#" },
  { id: "call", type: "Call transcript", where: "Founder call", date: "2025-08-15", items: 1, url: "#" },
  { id: "news", type: "News", where: "Public web", date: "2025-08-28", items: 4, url: "https://news.example" },
  { id: "dataset", type: "VC portfolios", where: "RAG index", date: "2025-08-31", items: 1, url: "#" },
]

export const frameworks = {
  weights: { team: 0.3, product: 0.25, market: 0.2, traction: 0.15, riskDeduction: 0.1 },
  scores: { team: 0.72, product: 0.68, market: 0.8, traction: 0.6, riskDeduction: 0.15 },
}
