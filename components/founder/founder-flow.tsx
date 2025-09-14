"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { UploadDropzone } from "@/components/upload-dropzone"
import { IngestionSources } from "@/components/ingestion-sources"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"

type FileItem = { name: string; type: string; size: number }

export default function FounderFlow() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [progress, setProgress] = useState(0)
  const [form, setForm] = useState({
    company: "Acme AI",
    sector: "DevTools / AI Agents",
    stage: "Seed",
    ask: "$2.0M",
    oneLiner: "Agents that automate post-merge QA for web apps.",
    traction: "MRR $28k, 16 logos, MoM 22%",
  })

  function onUpload(selected: FileItem[]) {
    setFiles((prev) => [...prev, ...selected])
    setProgress(0)
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(id)
          return 100
        }
        return p + 15
      })
    }, 350)
  }

  return (
    <Tabs defaultValue="upload">
      <TabsList className="grid grid-cols-4">
        <TabsTrigger value="upload">Upload</TabsTrigger>
        <TabsTrigger value="questions">Questionnaire</TabsTrigger>
        <TabsTrigger value="review">Review & Redact</TabsTrigger>
        <TabsTrigger value="submit">Submit</TabsTrigger>
      </TabsList>

      <TabsContent value="upload" className="mt-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Upload Founder Materials</CardTitle>
              <CardDescription>
                Decks, financials, transcripts, customer proof. pdf, pptx, docx, csv, png/jpg.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UploadDropzone onFilesSelected={onUpload} />
              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Parsing & normalization</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} aria-label="Ingestion progress" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button variant="secondary" disabled={progress < 100}>
                  Run Accelerator Qs
                </Button>
                <Button disabled={progress < 100}>Generate Draft Notes</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sources</CardTitle>
              <CardDescription>All uploaded items and public datasets linked</CardDescription>
            </CardHeader>
            <CardContent>
              <IngestionSources files={files} />
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="questions" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Normalization Questionnaire</CardTitle>
            <CardDescription>Short form used to structure downstream analysis.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Company</Label>
              <Input value={form.company} onChange={(e) => setForm((s) => ({ ...s, company: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Sector</Label>
              <Input value={form.sector} onChange={(e) => setForm((s) => ({ ...s, sector: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Stage</Label>
              <Input value={form.stage} onChange={(e) => setForm((s) => ({ ...s, stage: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Ask</Label>
              <Input value={form.ask} onChange={(e) => setForm((s) => ({ ...s, ask: e.target.value }))} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>One-liner</Label>
              <Input value={form.oneLiner} onChange={(e) => setForm((s) => ({ ...s, oneLiner: e.target.value }))} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Traction Summary</Label>
              <Textarea
                rows={4}
                value={form.traction}
                onChange={(e) => setForm((s) => ({ ...s, traction: e.target.value }))}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="review" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Review & Redact</CardTitle>
            <CardDescription>
              Inspect extracted entities and hide sensitive fields before sharing with VC.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-md border p-4">
                <h4 className="font-medium">Extracted Entities</h4>
                <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                  <li>MRR: $28,000</li>
                  <li>Headcount: 9</li>
                  <li>Primary Market: QA Automation</li>
                  <li>ICP: Seed-stage SaaS</li>
                </ul>
              </div>
              <div className="rounded-md border p-4">
                <h4 className="font-medium">Redactions</h4>
                <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                  <li>Customer names replaced with initials</li>
                  <li>Bank and address masked</li>
                  <li>Emails and phone numbers masked</li>
                </ul>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-end gap-2">
              <Button variant="secondary">Download JSON</Button>
              <Button>Approve for VC Review</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="submit" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Submit</CardTitle>
            <CardDescription>Generate a secure review link for investors.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <Input readOnly value="https://app.example.com/review/acme-ai" />
            <Button>Copy Link</Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
