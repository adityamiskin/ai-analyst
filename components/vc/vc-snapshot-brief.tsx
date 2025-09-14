"use client"

import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function SnapshotBrief({
  company,
}: {
  company: { name: string; stage: string; sector: string; ask: string }
}) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Company Snapshot</CardTitle>
          <CardDescription>Auto-filled from parsed materials</CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Company</span>
              <span className="font-medium">{company.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Stage</span>
              <span className="font-medium">{company.stage}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Sector</span>
              <span className="font-medium">{company.sector}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Ask</span>
              <span className="font-medium">{company.ask}</span>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Tab brief: quick triage of company, stage, sector, and ask. Links in other tabs provide proof with
            citations, confidence, and freshness.
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Framework Outputs</CardTitle>
          <CardDescription>Quantified metrics for comparison</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: "Team", value: 78 },
              { label: "Product & Moat", value: 72 },
              { label: "Market & Timing", value: 65 },
              { label: "Traction", value: 58 },
            ].map((m) => (
              <div key={m.label} className="rounded-md border p-4">
                <div className="text-sm text-muted-foreground">{m.label}</div>
                <div className="mt-2 text-2xl font-semibold">{m.value}</div>
                <Progress value={m.value} className="mt-2" aria-label={`${m.label} score`} />
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Tab brief: these are normalized scores derived from McKinsey 7S, Porter’s Five Forces, Defensibility, 5
            Whys, and SWOT. Use Benchmarks and Sources tabs to validate.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
