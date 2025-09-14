"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export default function FounderWorkspace() {
  const [files, setFiles] = useState<File[]>([])
  const [form, setForm] = useState({
    company: "Acme AI",
    sector: "Developer Tools",
    stage: "Seed",
    ask: "$1.5M for 15%",
    oneLiner: "Self-serve AI agents that automate post-merge QA.",
    traction: "MRR $28k, 16 logos, MoM 22%",
  })

  return (
    <Tabs defaultValue="upload">
      <TabsList className="grid grid-cols-4">
        <TabsTrigger value="upload">Upload</TabsTrigger>
        <TabsTrigger value="questions">Questionnaire</TabsTrigger>
        <TabsTrigger value="review">Data Review</TabsTrigger>
        <TabsTrigger value="submit">Submit</TabsTrigger>
      </TabsList>

      <TabsContent value="upload" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Upload Materials</CardTitle>
            <CardDescription>
              Pitch deck, financials, call transcripts, customer list, product screenshots. Formats: pdf, pptx, csv,
              txt, docx, png/jpg.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-dashed p-6 text-center">
              <input
                type="file"
                multiple
                className="hidden"
                id="founder-files"
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              />
              <Label htmlFor="founder-files" className="cursor-pointer">
                <div className="space-y-2">
                  <p className="font-medium">Drag & drop or click to select files</p>
                  <p className="text-sm text-muted-foreground">Max 25 files • Up to 50MB each</p>
                </div>
              </Label>
            </div>
            {files.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {files.map((f) => (
                  <Badge key={f.name} variant="secondary">
                    {f.name}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="questions" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Founder Questionnaire</CardTitle>
            <CardDescription>Short form to normalize key fields used downstream.</CardDescription>
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
              <Label>Fundraising Ask</Label>
              <Input value={form.ask} onChange={(e) => setForm((s) => ({ ...s, ask: e.target.value }))} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>One Liner</Label>
              <Input value={form.oneLiner} onChange={(e) => setForm((s) => ({ ...s, oneLiner: e.target.value }))} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>Traction Summary</Label>
              <Textarea
                value={form.traction}
                onChange={(e) => setForm((s) => ({ ...s, traction: e.target.value }))}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="review" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Data Review & Redactions</CardTitle>
            <CardDescription>
              We extract entities and redact sensitive fields before VC review. You can hide or edit any item.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-md border p-4">
                <h4 className="font-medium">Extracted Entities</h4>
                <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                  <li>MRR: $28,000</li>
                  <li>Employees: 9</li>
                  <li>Primary Market: QA Automation</li>
                  <li>ICP: Seed-stage SaaS, 20–200 eng headcount</li>
                </ul>
              </div>
              <div className="rounded-md border p-4">
                <h4 className="font-medium">Redactions</h4>
                <ul className="mt-2 list-disc pl-5 text-sm text-muted-foreground">
                  <li>Customer names replaced with initials</li>
                  <li>Bank account and addresses masked</li>
                  <li>Emails and phone numbers masked</li>
                </ul>
              </div>
            </div>
            <Separator />
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
            <CardDescription>
              Share a secure link with the VC. You’ll be notified when they start reviewing.
            </CardDescription>
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
