"use client"

import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { mockSnapshot } from "@/lib/mock"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts"

export default function Benchmarks() {
  const data = mockSnapshot.metrics.map((m) => ({
    name: m.label,
    company: m.value,
    peers: m.peerMedian ?? 0,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Benchmarks</CardTitle>
        <CardDescription>
          How the company compares to peer medians. Bars show company vs peers for each selected metric.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="company" fill="hsl(var(--primary))" />
              <Bar dataKey="peers" fill="hsl(var(--muted-foreground))" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
