import { Badge } from "@/components/ui/badge";

export default function ProvenanceBadge({
  title,
  url,
  confidence,
}: {
  title: string;
  url: string;
  confidence: number;
}) {
  const pct = Math.round(confidence * 100);
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2"
    >
      <Badge variant="secondary">{title}</Badge>
      <span className="text-xs text-muted-foreground">{pct}% confidence</span>
    </a>
  );
}
