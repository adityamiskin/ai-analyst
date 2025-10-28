"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileList } from "@/components/founder/file-list";
import type { Doc } from "@/convex/_generated/dataModel";

export default function FounderInformation({
  application,
}: {
  application: Doc<"founderApplications">;
}) {
  const { company, team, product, market, traction, documents } = application;

  return (
    <div className="mx-auto w-full max-w-6xl ">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">
          Founder Information
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Complete information provided by the founders
        </p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Pitch Deck</h4>
              {documents.pitchDeck.length > 0 ? (
                <FileList files={documents.pitchDeck} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  No pitch deck uploaded
                </p>
              )}
            </div>
            <Separator />
            <div>
              <h4 className="font-medium mb-3">Other Documents</h4>

              {documents.other && documents.other.length > 0 ? (
                <FileList files={documents.other} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  No additional documents uploaded
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Company Name
                </label>
                <p className="text-sm mt-1">{company.name || "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Website
                </label>
                <p className="text-sm mt-1">
                  {company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {company.website}
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Location
                </label>
                <p className="text-sm mt-1">
                  {company.location || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Stage
                </label>
                <div className="mt-1">
                  <Badge variant="outline">
                    {company.stage || "Not provided"}
                  </Badge>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">
                  One-liner
                </label>
                <p className="text-sm mt-1">
                  {company.oneLiner || "Not provided"}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">
                  What do you do?
                </label>
                <p className="text-sm mt-1 whitespace-pre-wrap">
                  {company.whatDoYouDo || "Not provided"}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Why now?
                </label>
                <p className="text-sm mt-1 whitespace-pre-wrap">
                  {company.whyNow || "Not provided"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Founders</h4>
              <div className="space-y-3">
                {team.founders.length > 0 ? (
                  team.founders.map((founder, index) => (
                    <div key={index} className="p-3 border rounded-md">
                      <div className="grid gap-2 md:grid-cols-3">
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Name
                          </label>
                          <p className="text-sm mt-1">
                            {founder.name || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Email
                          </label>
                          <p className="text-sm mt-1">
                            {founder.email || "Not provided"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Designation
                          </label>
                          <p className="text-sm mt-1">
                            {founder.designation || "Not provided"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No founders listed
                  </p>
                )}
              </div>
            </div>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Full-time Founders
                </label>
                <div className="mt-1">
                  <Badge variant={team.isFullTime ? "default" : "secondary"}>
                    {team.isFullTime ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  How long worked together
                </label>
                <p className="text-sm mt-1">
                  {team.howLongWorked || "Not provided"}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Relevant Experience
                </label>
                <p className="text-sm mt-1 whitespace-pre-wrap">
                  {team.relevantExperience || "Not provided"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Description
              </label>
              <p className="text-sm mt-1 whitespace-pre-wrap">
                {product.description || "Not provided"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Demo URL
              </label>
              <p className="text-sm mt-1">
                {product.demoUrl ? (
                  <a
                    href={product.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {product.demoUrl}
                  </a>
                ) : (
                  "Not provided"
                )}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Defensibility
              </label>
              <p className="text-sm mt-1 whitespace-pre-wrap">
                {product.defensibility || "Not provided"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Video URL
              </label>
              <p className="text-sm mt-1">
                {product.videoUrl ? (
                  <a
                    href={product.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {product.videoUrl}
                  </a>
                ) : (
                  "Not provided"
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Customer
              </label>
              <p className="text-sm mt-1 whitespace-pre-wrap">
                {market.customer || "Not provided"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Competitors
              </label>
              <p className="text-sm mt-1 whitespace-pre-wrap">
                {market.competitors || "Not provided"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Differentiation
              </label>
              <p className="text-sm mt-1 whitespace-pre-wrap">
                {market.differentiation || "Not provided"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Go-to-Market Strategy
              </label>
              <p className="text-sm mt-1 whitespace-pre-wrap">
                {market.gtm || "Not provided"}
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  TAM
                </label>
                <p className="text-sm mt-1">{market.tam || "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  SAM
                </label>
                <p className="text-sm mt-1">{market.sam || "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  SOM
                </label>
                <p className="text-sm mt-1">{market.som || "Not provided"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Traction Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Launched
                </label>
                <div className="mt-1">
                  <Badge
                    variant={
                      traction.isLaunched === "yes"
                        ? "default"
                        : traction.isLaunched === "soon"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {traction.isLaunched === "yes"
                      ? "Yes"
                      : traction.isLaunched === "soon"
                      ? "Soon"
                      : traction.isLaunched === "no"
                      ? "No"
                      : "Not provided"}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Launch Date
                </label>
                <p className="text-sm mt-1">
                  {traction.launchDate || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  MRR
                </label>
                <p className="text-sm mt-1">{traction.mrr || "Not provided"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Growth
                </label>
                <p className="text-sm mt-1">
                  {traction.growth || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Active Users
                </label>
                <p className="text-sm mt-1">
                  {traction.activeUsersCount || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Pilots
                </label>
                <p className="text-sm mt-1">
                  {traction.pilots || "Not provided"}
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground">
                  KPIs
                </label>
                <p className="text-sm mt-1 whitespace-pre-wrap">
                  {traction.kpis || "Not provided"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
