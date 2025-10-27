"use client";

import { useEffect, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { NewsItem } from "@/convex/actions/news";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CachedNewsDisplay } from "@/components/vc/cached-news-display";

export default function VCPage() {
  // NEW: Use cached news instead of fetching fresh news
  const cachedNews = useQuery(api.news_workflow.getCachedNews);

  // Keep companies query for empty state messaging
  const companies = useQuery(api.founders.listAllApplications);

  // Fallback: Use Convex action to fetch news if cache is empty (for development/testing)
  const fetchNews = useAction(api.actions.news.fetchCompanyNews);

  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  useEffect(() => {
    async function loadNews() {
      try {
        setNewsLoading(true);
        setNewsError(null);

        // Try to use cached news first
        if (cachedNews) {
          setNews(cachedNews.newsItems);
          setNewsLoading(false);
          return;
        }

        // Fallback to fresh fetch if no cache (for dev/testing)
        console.log("No cached news available, fetching fresh...");
        const fetchedNews = await fetchNews();
        setNews(fetchedNews);
      } catch (error) {
        console.error("Failed to fetch news:", error);
        setNewsError("Failed to load news");
        setNews([]);
      } finally {
        setNewsLoading(false);
      }
    }

    // Only load news if cache is loaded (undefined means loading)
    if (cachedNews !== undefined) {
      loadNews();
    }
  }, [cachedNews, fetchNews]);

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          Portfolio News
        </h1>
        <p className="text-muted-foreground">
          Latest updates and developments from your portfolio companies
        </p>
      </header>

      {newsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-lg text-muted-foreground mb-2">
              Loading latest news...
            </div>
            <div className="text-sm text-muted-foreground">
              Searching across the web for updates
            </div>
          </div>
        </div>
      ) : newsError ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-lg text-destructive mb-2">
              Failed to load news
            </div>
            <div className="text-sm text-muted-foreground">{newsError}</div>
          </div>
        </div>
      ) : news.length > 0 ? (
        <>
          {/* Show cached news display when using cache */}
          {/* {cachedNews && (
						<div className='mb-6'>
							<CachedNewsDisplay />
						</div>
					)} */}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.map((n, i) => (
              <div
                key={i}
                className="rounded-xl border bg-card p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer"
                onClick={() => setSelectedNews(n)}
              >
                <div className="space-y-3">
                  <h3 className="font-semibold text-base leading-tight line-clamp-3">
                    {n.title}
                  </h3>
                  {n.summary && (
                    <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed">
                      {n.summary}
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-primary">
                        {n.source}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {n.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        Click to expand
                      </span>
                      {n.url && (
                        <a
                          href={n.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Read →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-lg text-muted-foreground mb-2">
              No recent news found
            </div>
            <div className="text-sm text-muted-foreground">
              {companies && companies.length > 0
                ? "No recent updates found for your portfolio companies."
                : "Add companies to your portfolio to see their latest news."}
            </div>
          </div>
        </div>
      )}

      {/* News Detail Modal */}
      <Dialog open={!!selectedNews} onOpenChange={() => setSelectedNews(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-xl leading-tight pr-8">
              {selectedNews?.title}
            </DialogTitle>
            <DialogDescription className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-4">
                <span className="font-medium text-primary">
                  {selectedNews?.source}
                </span>
                <span className="text-muted-foreground">
                  {selectedNews?.date}
                </span>
              </div>
              {selectedNews?.url && (
                <a
                  href={selectedNews.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium"
                >
                  Read Full Article →
                </a>
              )}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] mt-4">
            <div className="space-y-4">
              {selectedNews?.summary && (
                <div className="text-foreground leading-relaxed">
                  <p className="text-base">{selectedNews.summary}</p>
                </div>
              )}

              <div className="border-t pt-4 mt-6">
                <h4 className="font-semibold text-sm text-muted-foreground mb-3">
                  SOURCE INFORMATION
                </h4>
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Source:</span>
                    <span className="font-medium">{selectedNews?.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">{selectedNews?.date}</span>
                  </div>
                  {selectedNews?.url && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">URL:</span>
                      <a
                        href={selectedNews.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate max-w-xs"
                      >
                        {selectedNews.url}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
