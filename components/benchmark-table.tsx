import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const rows = [
  { metric: "EV/Revenue", company: 8.2, median: 7.4, p75: 9.1, direction: "up" },
  { metric: "MRR Growth %", company: 11.0, median: 7.0, p75: 10.5, direction: "up" },
  { metric: "Headcount QoQ %", company: 6.0, median: 5.0, p75: 7.0, direction: "flat" },
  { metric: "Gross Margin %", company: 68, median: 70, p75: 75, direction: "down" },
]

export function BenchmarkTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Metric</TableHead>
          <TableHead className="text-right">Company</TableHead>
          <TableHead className="text-right">Peer Median</TableHead>
          <TableHead className="text-right">P75</TableHead>
          <TableHead className="text-right">Signal</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r) => (
          <TableRow key={r.metric}>
            <TableCell className="font-medium">{r.metric}</TableCell>
            <TableCell className="text-right">{r.company}</TableCell>
            <TableCell className="text-right">{r.median}</TableCell>
            <TableCell className="text-right">{r.p75}</TableCell>
            <TableCell className="text-right">
              <Badge variant={r.direction === "up" ? "default" : r.direction === "down" ? "destructive" : "secondary"}>
                {r.direction === "up" ? "Above" : r.direction === "down" ? "Below" : "Inline"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
