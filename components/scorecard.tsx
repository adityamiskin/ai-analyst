"use client"

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell } from "recharts"
import { Progress } from "@/components/ui/progress"

type Props = {
  weightedScore: number
  components: { name: string; value: number }[]
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--muted-foreground))", "hsl(var(--accent))", "hsl(var(--secondary))"]

export function Scorecard({ weightedScore, components }: Props) {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm text-muted-foreground">Overall Success Rate</div>
        <div className="mt-1 text-3xl font-semibold">{weightedScore}%</div>
        <Progress value={weightedScore} className="mt-2" />
      </div>
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={components} dataKey="value" nameKey="name" outerRadius={80} label>
              {components.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
