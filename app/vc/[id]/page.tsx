"use client";

import { notFound } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import AnalysisContainer from "@/components/vc/analysis-container";
import { FloatingChatWidget } from "@/components/vc/floating-chat-widget";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { Doc, Id } from "@/convex/_generated/dataModel";

export default function VCPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as Id<"founderApplications">;

  const app = useQuery(api.founders.getApplication, { id });

  // Still loading
  if (app === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // Loaded but not found
  if (app === null) {
    return notFound();
  }

  return (
    <>
      <header className="flex h-16 md:h-20 shrink-0 items-center gap-2 border-b px-4 md:sticky top-0 bg-background z-10">
        <SidebarTrigger className="size-8" />
        <div className="flex items-center gap-4 px-4">
          <div className="flex md:flex-col gap-2">
            <h1 className="text-xl font-semibold">
              {app.company?.name ?? "Company"}
            </h1>
            <div className="items-center gap-2 text-sm text-muted-foreground flex">
              <span className="hidden md:block">
                {app.company?.location ?? ""}
              </span>
              <span className="hidden md:block">•</span>
              <Badge>{app.company?.stage ?? ""}</Badge>
            </div>
          </div>
        </div>
      </header>
      <AnalysisContainer application={app} />
      <FloatingChatWidget companyId={id} />
    </>
  );
}
