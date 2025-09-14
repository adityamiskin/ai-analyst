import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

type Company = {
  name: string
  stage: string
  sector: string
  ask: string
}

type Metrics = {
  team: number
  productMoat: number
  marketTiming: number
  traction: number
}

export function ReportPreview({
  company,
  metrics,
  weightedScore,
}: {
  company: Company
  metrics: Metrics
  weightedScore: number
}) {
  const recommendation = weightedScore >= 75 ? "Yes" : weightedScore >= 60 ? "Maybe" : "No"

  return (
    <div className="rounded-md border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-pretty">{company.name}</h3>
          <p className="text-sm text-muted-foreground">
            {company.stage} • {company.sector} • Ask: {company.ask}
          </p>
        </div>
        <Badge
          variant={recommendation === "Yes" ? "default" : recommendation === "Maybe" ? "secondary" : "destructive"}
        >
          Recommendation: {recommendation}
        </Badge>
      </div>

      <Separator className="my-4" />

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Team", value: metrics.team },
          { label: "Product & Moat", value: metrics.productMoat },
          { label: "Market & Timing", value: metrics.marketTiming },
          { label: "Traction", value: metrics.traction },
        ].map((m) => (
          <div key={m.label} className="rounded-md border p-3">
            <div className="text-xs text-muted-foreground">{m.label}</div>
            <div className="mt-1 text-xl font-semibold">{m.value}</div>
          </div>
        ))}
      </section>

      <div className="mt-4 rounded-md bg-muted p-3 text-sm text-muted-foreground">
        Final deliverable includes: snapshot, bullet summaries per framework, peer benchmarks, tagged risks with
        evidence, and recommendation logic.
      </div>
    </div>
  )
}
