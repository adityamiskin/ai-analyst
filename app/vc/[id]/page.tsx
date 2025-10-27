import { notFound } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import AnalysisContainer from "@/components/vc/analysis-container";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { Id } from "@/convex/_generated/dataModel";
import { Suspense } from "react";

interface VCPageProps {
  params: Promise<{
    id: Id<"founderApplications">;
  }>;
}

export default async function VCPage({ params }: VCPageProps) {
  const { id } = await params;
  const app = await fetchQuery(api.founders.getApplication, {
    id: id,
  });

  if (!app) {
    notFound();
  }

  return (
    <>
      <header className="flex h-20 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="size-8" />
        <div className="flex items-center gap-4 px-4">
          <Suspense fallback={<div>Loading...</div>}>
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold">
                {app.company?.name ?? "Company"}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{app.company?.location ?? ""}</span>
                <span>•</span>
                <Badge>{app.company?.stage ?? ""}</Badge>
              </div>
            </div>
          </Suspense>
        </div>
      </header>
      <AnalysisContainer />
    </>
  );
}
