"use client"

import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { mockSnapshot } from "@/lib/mock"

export default function ReportBuilder() {
  const s = mockSnapshot
  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Builder</CardTitle>
        <CardDescription>
          Generates a detailed PDF with snapshot, framework outputs, benchmarks, risks, and recommendation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <section>
          <h3 className="font-semibold">Snapshot</h3>
          <p className="text-sm text-muted-foreground">
            {s.company} • {s.stage} • {s.sector} • Ask: {s.ask}
          </p>
        </section>

        <Separator />

        <section>
          <h3 className="font-semibold">Framework Outputs</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
            <li>McKinsey 7S: Team/Structure strengths; Systems/processes maturing</li>
            <li>
              Porter’s Five Forces: Moderate rivalry; buyer power medium; switching costs rising with agent integrations
            </li>
            <li>5 Whys: Churn anomaly traced to onboarding gaps</li>
          </ul>
        </section>

        <section>
          <h3 className="mt-4 font-semibold">Benchmarks</h3>
          <p className="text-sm text-muted-foreground">
            MRR and growth above median; TAM conservative on bottom-up model.
          </p>
        </section>

        <section>
          <h3 className="mt-4 font-semibold">Risks</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
            {s.risks.map((r, i) => (
              <li key={i}>
                {r.label} — {r.evidence}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="mt-4 font-semibold">Recommendation</h3>
          <p className="text-sm">
            Proceed to partner meeting; target safe terms with milestone-based release due to CTO gap.
          </p>
        </section>

        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary">Export JSON</Button>
          <Button>Generate PDF</Button>
        </div>
      </CardContent>
    </Card>
  )
}
