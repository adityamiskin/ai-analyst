"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts"

const data = [
  { name: "EV/Rev", Company: 8.2, Median: 7.4, P75: 9.1 },
  { name: "MRR %", Company: 11.0, Median: 7.0, P75: 10.5 },
  { name: "HC QoQ %", Company: 6.0, Median: 5.0, P75: 7.0 },
  { name: "GM %", Company: 68, Median: 70, P75: 75 },
]

export function BenchmarkChart() {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap={18}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Company" fill="hsl(var(--primary))" />
          <Bar dataKey="Median" fill="hsl(var(--muted-foreground))" />
          <Bar dataKey="P75" fill="hsl(var(--accent))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
