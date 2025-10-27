import { cn } from "@/lib/utils";

export default function TrustChecks({
  items,
}: {
  items: { label: string; status: "pass" | "warn"; note?: string }[];
}) {
  return (
    <ul className="space-y-1">
      {items.map((i) => (
        <li
          key={i.label}
          className={cn(
            "text-sm",
            i.status === "pass" ? "text-muted-foreground" : "text-amber-600",
          )}
        >
          • {i.label}
          {i.note ? ` — ${i.note}` : ""}
        </li>
      ))}
    </ul>
  );
}
