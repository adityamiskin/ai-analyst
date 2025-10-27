"use client";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CompanySnapshot } from "@/lib/types";

interface RisksProps {
  company: CompanySnapshot;
}

export default function Risks({ company }: RisksProps) {
  const risks = company.risks;
  const color = (s: "low" | "med" | "high") =>
    s === "high" ? "destructive" : s === "med" ? "secondary" : "outline";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Analysis</CardTitle>
        <CardDescription>
          Structured risk list generated from rule-based checks + LLM reasoning
          with links to evidence where available.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {risks.map((r, idx) => (
          <div key={idx} className="rounded-md border p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{r.label}</div>
              <Badge variant={color(r.severity)} className="uppercase">
                {r.severity}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{r.evidence}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
