import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const risks = [
  {
    id: "r1",
    title: "Metric inconsistency: ARR vs MRR mismatch",
    severity: "High",
    evidence: "ARR derived from materials implies $1.5M; MRR trend suggests $90k ($1.08M ARR).",
  },
  {
    id: "r2",
    title: "TAM inflation in bottom-up logic",
    severity: "Medium",
    evidence: "Survey conversion rates applied to total site traffic vs addressable ICP leads.",
  },
  {
    id: "r3",
    title: "Churn anomaly vs benchmark",
    severity: "Medium",
    evidence: "Logo churn at 6% monthly vs peer median 3.5% for Seed devtools.",
  },
  {
    id: "r4",
    title: "Team gap: no dedicated security lead",
    severity: "Low",
    evidence: "Roadmap includes SOC2 but no owner; hiring plan lists role in 2H.",
  },
]

function SeverityBadge({ level }: { level: "Low" | "Medium" | "High" }) {
  const variant = level === "High" ? "destructive" : level === "Medium" ? "default" : "secondary"
  return <Badge variant={variant}>{level}</Badge>
}

export function RiskList() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {risks.map((r) => (
        <AccordionItem key={r.id} value={r.id}>
          <AccordionTrigger className="text-left">
            <div className="flex w-full items-center justify-between gap-3">
              <span className="text-sm font-medium">{r.title}</span>
              <SeverityBadge level={r.severity as any} />
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground">{r.evidence}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
