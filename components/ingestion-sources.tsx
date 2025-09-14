import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

type Props = {
  files: { name: string; type: string; size: number }[]
}

export function IngestionSources({ files }: Props) {
  const items = files.length
    ? files
    : [
        { name: "Pitch Deck.pdf", type: "application/pdf", size: 1_024_000 },
        { name: "Founder Call Transcript.txt", type: "text/plain", size: 84_000 },
        { name: "Hiring Data (public).csv", type: "text/csv", size: 12_000 },
      ]

  return (
    <ScrollArea className="h-64">
      <ul className="space-y-3 pr-3">
        {items.map((f, i) => (
          <li key={i} className="flex items-center justify-between rounded-md border p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{f.name}</p>
              <p className="truncate text-xs text-muted-foreground">{(f.size / 1000).toFixed(0)} KB</p>
            </div>
            <Badge variant="secondary">{f.type?.split("/")[1]?.toUpperCase() || "FILE"}</Badge>
          </li>
        ))}
      </ul>
    </ScrollArea>
  )
}
