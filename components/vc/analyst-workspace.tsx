"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import Snapshot from "./snapshot"
import Benchmarks from "./benchmarks"
import FrameworksScorecard from "./frameworks-scorecard"
import Risks from "./risks"
import SourcesEvidence from "./sources-evidence"
import ReportBuilder from "./report-builder"

export default function VCWorkspace() {
  return (
    <Tabs defaultValue="snapshot">
      <TabsList className="grid grid-cols-6">
        <TabsTrigger value="snapshot">Snapshot</TabsTrigger>
        <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
        <TabsTrigger value="frameworks">Frameworks & Score</TabsTrigger>
        <TabsTrigger value="risks">Risks</TabsTrigger>
        <TabsTrigger value="sources">Sources & Evidence</TabsTrigger>
        <TabsTrigger value="report">Report</TabsTrigger>
      </TabsList>

      <TabsContent value="snapshot" className="mt-6">
        <Snapshot />
      </TabsContent>
      <TabsContent value="benchmarks" className="mt-6">
        <Benchmarks />
      </TabsContent>
      <TabsContent value="frameworks" className="mt-6">
        <FrameworksScorecard />
      </TabsContent>
      <TabsContent value="risks" className="mt-6">
        <Risks />
      </TabsContent>
      <TabsContent value="sources" className="mt-6">
        <SourcesEvidence />
      </TabsContent>
      <TabsContent value="report" className="mt-6">
        <ReportBuilder />
      </TabsContent>
    </Tabs>
  )
}
