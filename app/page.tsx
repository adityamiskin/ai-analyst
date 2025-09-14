"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { YCQuestionnaire } from "@/components/questionnaire/yc-questionnaire"

export default function Page() {
  return (
    <main className="container mx-auto max-w-5xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold text-pretty">Founder Questionnaire</h1>
        <p className="text-muted-foreground mt-1">
          YC-style application to capture everything in one place. Upload your deck and key docs inline as you answer.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Tell us about your company</CardTitle>
          <CardDescription>
            Keep answers clear and concise. You can download your responses as JSON at any time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <YCQuestionnaire />
        </CardContent>
      </Card>
    </main>
  )
}
