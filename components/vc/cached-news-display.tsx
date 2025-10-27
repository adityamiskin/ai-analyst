"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, RefreshCw } from "lucide-react";

export function CachedNewsDisplay() {
  const cachedNews = useQuery(api.news_workflow.getCachedNews);

  if (cachedNews === undefined) {
    return (
      <Card className="w-full p-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading cached news...
        </div>
      </Card>
    );
  }

  if (!cachedNews) {
    return (
      <Card className="w-full p-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="font-medium text-sm">No cached news available</p>
            <p className="text-xs text-muted-foreground">
              News will be cached daily at 9:00 AM UTC
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Company News Cache</h3>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            Expires in 24 hours
          </Badge>
        </div>
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>Cached 24 hours ago</p>
        <p>
          {cachedNews.newsItems.length} news item
          {cachedNews.newsItems.length !== 1 ? "s" : ""} in cache
        </p>
      </div>

      <div className="grid gap-3">
        {cachedNews.newsItems.map((item, idx) => (
          <Card key={idx} className="p-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium text-sm leading-snug flex-1">
                  {item.title}
                </h4>
                {item.source && (
                  <Badge
                    variant="outline"
                    className="text-xs whitespace-nowrap"
                  >
                    {item.source}
                  </Badge>
                )}
              </div>

              {item.summary && (
                <p className="text-sm text-muted-foreground">{item.summary}</p>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">
                  {item.date}
                </span>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    Read more →
                  </a>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
