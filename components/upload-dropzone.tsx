"use client"

import type React from "react"

import { useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"

type Props = {
  onFilesSelected: (files: { name: string; type: string; size: number }[]) => void
}

export function UploadDropzone({ onFilesSelected }: Props) {
  const onChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = Array.from(e.target.files || []).map((x) => ({
        name: x.name,
        type: x.type || "application/octet-stream",
        size: x.size,
      }))
      if (f.length) onFilesSelected(f)
    },
    [onFilesSelected],
  )

  return (
    <Card role="region" aria-label="Upload files" className="border-dashed">
      <CardContent className="flex h-40 flex-col items-center justify-center gap-3 text-center">
        <div className="text-sm text-muted-foreground">Drag & drop files here or click to select</div>
        <input
          type="file"
          className="cursor-pointer rounded-md border px-3 py-2 text-sm"
          multiple
          onChange={onChange}
          aria-label="Select files to upload"
        />
        <p className="text-xs text-muted-foreground">Supported: pdf, pptx, docx, txt, csv, jpg, png</p>
      </CardContent>
    </Card>
  )
}
