"use client"

import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { mockSnapshot } from "@/lib/mock"
import ProvenanceBadge from "../shared/provenance-badge"

export default function SourcesEvidence() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sources & Evidence</CardTitle>
        <CardDescription>
          Every metric lists underlying documents and news links with confidence, extraction notes, and dates.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {mockSnapshot.metrics.map((m) => (
            <AccordionItem key={m.key} value={m.key}>
              <AccordionTrigger>
                <div className="flex w-full items-center justify-between">
                  <span>{m.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {m.value}
                    {m.unit ? m.unit : ""} • {m.sources.length} sources
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {m.sources.map((src) => (
                    <div key={src.url} className="rounded-md border p-3">
                      <div className="flex items-center justify-between">
                        <ProvenanceBadge title={src.title} url={src.url} confidence={src.confidence} />
                        <span className="text-xs text-muted-foreground">{src.date}</span>
                      </div>
                      <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                        {src.extractedFacts.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}
