"use client"

import { useMemo, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { BenchmarkChart } from "@/components/benchmark-chart"
import { BenchmarkTable } from "@/components/benchmark-table"
import { RiskList } from "@/components/risk-list"
import { WeightingPanel, defaultWeights, type Weights } from "@/components/weighting-panel"
import { Scorecard } from "@/components/scorecard"
import { ReportPreview } from "@/components/report-preview"
import { SourcesEvidence } from "./vc-sources-evidence"
import { SnapshotBrief } from "./vc-snapshot-brief"

const COMPANY = {
  name: "Acme AI",
  stage: "Seed",
  sector: "DevTools / AI Agents",
  ask: "$2.0M",
}

const METRICS = {
  team: 78,
  productMoat: 72,
  marketTiming: 65,
  traction: 58,
}

export default function VCFlow() {
  const [weights, setWeights] = useState<Weights>(defaultWeights)

  const weightedScore = useMemo(() => {
    const total =
      METRICS.team * weights.team +
      METRICS.productMoat * weights.product +
      METRICS.marketTiming * weights.market +
      METRICS.traction * weights.traction
    return Math.round(total / (weights.team + weights.product + weights.market + weights.traction))
  }, [weights])

  return (
    <Tabs defaultValue="snapshot">
      <TabsList className="grid grid-cols-6">
        <TabsTrigger value="snapshot">Snapshot</TabsTrigger>
        <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
        <TabsTrigger value="sources">Sources & Evidence</TabsTrigger>
        <TabsTrigger value="risks">Risks</TabsTrigger>
        <TabsTrigger value="scoring">Frameworks & Score</TabsTrigger>
        <TabsTrigger value="report">Report</TabsTrigger>
      </TabsList>

      <TabsContent value="snapshot" className="mt-6">
        <SnapshotBrief company={COMPANY} />
      </TabsContent>

      <TabsContent value="benchmarks" className="mt-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Benchmarks vs Peers</CardTitle>
              <CardDescription>Financial multiples, hiring velocity, traction signals</CardDescription>
            </CardHeader>
            <CardContent>
              <BenchmarkTable />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Visual Comparison</CardTitle>
              <CardDescription>Peer median and quartiles</CardDescription>
            </CardHeader>
            <CardContent>
              <BenchmarkChart />
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="sources" className="mt-6">
        <SourcesEvidence />
      </TabsContent>

      <TabsContent value="risks" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Risk Identification & Quality Flags</CardTitle>
            <CardDescription>
              Rule-based checks + LLM reasoning with explicit evidence links and data freshness indicators.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RiskList />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="scoring" className="mt-6">
        <section className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Adjust Weightings</CardTitle>
              <CardDescription>Tune Team, Product, Market, Traction to reflect investment thesis.</CardDescription>
            </CardHeader>
            <CardContent>
              <WeightingPanel value={weights} onChange={setWeights} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Scorecard</CardTitle>
              <CardDescription>Overall growth potential & success rate</CardDescription>
            </CardHeader>
            <CardContent>
              <Scorecard
                weightedScore={weightedScore}
                components={[
                  { name: "Team", value: METRICS.team },
                  { name: "Product", value: METRICS.productMoat },
                  { name: "Market", value: METRICS.marketTiming },
                  { name: "Traction", value: METRICS.traction },
                ]}
              />
            </CardContent>
          </Card>
        </section>
      </TabsContent>

      <TabsContent value="report" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Investor-Ready Deliverable</CardTitle>
            <CardDescription>Snapshot, frameworks, benchmarks, risks, and a clear recommendation.</CardDescription>
          </CardHeader>
          <CardContent>
            <ReportPreview company={COMPANY} metrics={METRICS} weightedScore={weightedScore} />
            <Separator className="my-4" />
            <div className="text-sm text-muted-foreground">
              Note: PDF export will include citations from Sources & Evidence and trust checks per metric.
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
