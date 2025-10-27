import { action } from "./_generated/server";
import { v } from "convex/values";
import { companyRag } from "./ai";
import { api } from "./_generated/api";

// Helper function to build section-specific text (optional sections => include all)
export function buildSectionText(app: any, sections?: string[]): string {
  const parts: string[] = [];
  if (!app) return "";

  const c = app.company ?? {};
  const t = app.team ?? {};
  const p = app.product ?? {};
  const m = app.market ?? {};
  const tr = app.traction ?? {};
  const includeAll = !sections || sections.length === 0;

  if (includeAll || sections.includes("company")) {
    parts.push(`# Company`);
    parts.push(`Name: ${c.name}`);
    parts.push(`Website: ${c.website}`);
    parts.push(`Location: ${c.location}`);
    parts.push(`Stage: ${c.stage}`);
    parts.push(`One-liner: ${c.oneLiner}`);
    parts.push(`What do you do: ${c.whatDoYouDo}`);
    parts.push(`Why now: ${c.whyNow}`);
  }

  if (includeAll || sections.includes("team")) {
    parts.push(`\n# Team`);
    parts.push(
      `Founders: ${(t.founders ?? [])
        .map((f: any) => `${f.name} <${f.email}> (${f.designation})`)
        .join("; ")}`,
    );
    parts.push(`Full-time: ${t.isFullTime}`);
    parts.push(`How long worked: ${t.howLongWorked}`);
    parts.push(`Relevant experience: ${t.relevantExperience}`);
  }

  if (includeAll || sections.includes("product")) {
    parts.push(`\n# Product`);
    parts.push(`Description: ${p.description}`);
    parts.push(`Demo URL: ${p.demoUrl}`);
    parts.push(`Defensibility: ${p.defensibility}`);
  }

  if (includeAll || sections.includes("market")) {
    parts.push(`\n# Market`);
    parts.push(`Customer: ${m.customer}`);
    parts.push(`Competitors: ${m.competitors}`);
    parts.push(`Differentiation: ${m.differentiation}`);
    parts.push(`GTM: ${m.gtm}`);
    parts.push(`TAM: ${m.tam}`);
    parts.push(`SAM: ${m.sam}`);
    parts.push(`SOM: ${m.som}`);
  }

  if (includeAll || sections.includes("traction")) {
    parts.push(`\n# Traction`);
    parts.push(`Launched: ${tr.isLaunched}`);
    parts.push(`Launch date: ${tr.launchDate}`);
    parts.push(`MRR: ${tr.mrr}`);
    parts.push(`Growth: ${tr.growth}`);
    parts.push(`Active users: ${tr.activeUsersCount}`);
    parts.push(`Pilots: ${tr.pilots}`);
    parts.push(`KPIs: ${tr.kpis}`);
  }

  return parts.filter(Boolean).join("\n");
}

export const ingestCompanyApplication = action({
  args: { companyId: v.id("founderApplications") },
  handler: async (ctx, { companyId }) => {
    const app = await ctx.runQuery(api.founders.getApplication, {
      id: companyId,
    });
    if (!app) throw new Error("Application not found");

    // Ingest different sections with domain-specific filters for hybrid RAG approach
    const sections = [
      { domain: "baseline", text: buildSectionText(app) },
      {
        domain: "finance",
        text: buildSectionText(app, ["company", "team", "traction"]),
      },
      {
        domain: "evaluation",
        text: buildSectionText(app, ["company", "team", "product", "market"]),
      },
      {
        domain: "competitor",
        text: buildSectionText(app, ["company", "market"]),
      },
      { domain: "market", text: buildSectionText(app, ["company", "market"]) },
      {
        domain: "technical",
        text: buildSectionText(app, ["company", "product"]),
      },
    ];

    // Add each section with domain filtering
    for (const section of sections) {
      await companyRag.add(ctx, {
        namespace: `${companyId}`,
        key: `founderApplication:${companyId}:${section.domain}`,
        text: section.text,
        filterValues: [
          { name: "domain", value: section.domain },
          { name: "contentType", value: "founderApplication" },
        ],
      });
    }

    return { ok: true };
  },
});
