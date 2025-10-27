"use node";

import { generateText, generateObject, stepCountIs } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
import { action, internalAction } from "../_generated/server";
import { api, internal } from "../_generated/api";

export interface NewsItem {
  title: string;
  source?: string;
  date: string;
  url?: string;
  summary?: string;
}

export interface CompanyInfo {
  name: string;
  oneLiner: string;
  stage: string;
  location: string;
  mrr: string;
}

// Schema for structured news output
const newsItemSchema = z.object({
  title: z.string().describe("The news headline or title"),
  summary: z.string().describe("Brief summary of the news item"),
  source: z
    .string()
    .describe("Source of the news (website, publication, etc.)"),
  date: z
    .string()
    .describe(
      "Date of the news item (YYYY-MM-DD format if available, otherwise approximate)",
    ),
  url: z
    .string()
    .url({ message: "Invalid URL" })
    .describe("URL to the full article if available")
    .optional(),
});

const structuredNewsSchema = z.object({
  news: z.array(newsItemSchema).describe("List of structured news items"),
});

export const fetchCompanyNews = action({
  args: {},
  handler: async (ctx): Promise<NewsItem[]> => {
    const newsItems: NewsItem[] = [];

    // Fetch companies directly from Convex
    const companies = await ctx.runQuery(api.founders.listAllApplications);

    if (!companies || companies.length === 0) {
      return [];
    }

    // Extract company information
    const companyInfo: CompanyInfo[] = companies.map((company) => ({
      name: company.company.name,
      oneLiner: company.company.oneLiner,
      stage: company.company.stage,
      location: company.company.location,
      mrr: company.traction.mrr,
    }));

    // Process companies in batches to avoid rate limits
    const batchSize = 2;
    for (let i = 0; i < companyInfo.length; i += batchSize) {
      const batch = companyInfo.slice(i, i + batchSize);

      // Process each company in the batch concurrently
      const batchPromises = batch.map(async (company) => {
        try {
          // Step 1: Get raw news using web search
          const searchPrompt = `Find recent news about "${company.name}" from the past 30 days.

Company Context:
- One-liner: ${company.oneLiner}
- Stage: ${company.stage}
- Location: ${company.location}
- Current MRR: ${company.mrr}

Search the web for recent business news, funding, partnerships, product launches, acquisitions, or significant milestones specifically about this company. Return up to 3 most relevant recent news items with their headlines, sources, dates, and brief summaries.

List them in a clear, readable format.`;

          const searchResult = await generateText({
            model: google("gemini-2.5-pro"),
            prompt: searchPrompt,
            tools: {
              google_search: google.tools.googleSearch({}),
            },
            stopWhen: stepCountIs(5),
          });

          const rawNews = searchResult.text;

          // Step 2: Structure the news using generateObject
          const structurePrompt = `Take this raw news text and extract up to 3 structured news items.

Raw news text:
${rawNews}

Extract the key information from each news item and structure it properly. If no valid news items are found, return an empty news array.`;

          const structureResult = await generateObject({
            model: google("gemini-flash-latest"),
            schema: structuredNewsSchema,
            prompt: structurePrompt,
          });

          // Transform the structured response to our NewsItem format
          return structureResult.object.news.map((item) => ({
            title: item.title,
            source: item.source,
            date: item.date,
            url: item.url,
            summary: item.summary,
          }));
        } catch (error) {
          console.error(`Error fetching news for ${company.name}:`, error);
          return [];
        }
      });

      const batchResults = await Promise.all(batchPromises);
      newsItems.push(...batchResults.flat());

      // Small delay between batches to be respectful to the API
      if (i + batchSize < companyInfo.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // Return up to 10 most recent/relevant news items
    return newsItems.slice(0, 10);
  },
});

/**
 * Scheduled action that runs daily in the morning to fetch and cache news.
 * This action is triggered by a cron job and stores the news in the cache table.
 */
export const fetchAndCacheNewsDaily = internalAction({
  args: {},
  handler: async (
    ctx,
  ): Promise<{ success: boolean; newsCount?: number; error?: string }> => {
    try {
      console.log(
        "Starting daily news cache job at:",
        new Date().toISOString(),
      );

      // Get the companies from the database and fetch their news
      const newsItems: NewsItem[] = [];

      // Fetch companies directly from Convex
      const companies = await ctx.runQuery(api.founders.listAllApplications);

      if (!companies || companies.length === 0) {
        console.log("No companies found");
        return { success: true, newsCount: 0 };
      }

      // Extract company information
      const companyInfo: CompanyInfo[] = companies.map((company) => ({
        name: company.company.name,
        oneLiner: company.company.oneLiner,
        stage: company.company.stage,
        location: company.company.location,
        mrr: company.traction.mrr,
      }));

      // Process companies in batches to avoid rate limits
      const batchSize = 2;
      for (let i = 0; i < companyInfo.length; i += batchSize) {
        const batch = companyInfo.slice(i, i + batchSize);

        // Process each company in the batch concurrently
        const batchPromises = batch.map(async (company) => {
          try {
            // Step 1: Get raw news using web search
            const searchPrompt = `Find recent news about "${company.name}" from the past 30 days.

Company Context:
- One-liner: ${company.oneLiner}
- Stage: ${company.stage}
- Location: ${company.location}
- Current MRR: ${company.mrr}

Search the web for recent business news, funding, partnerships, product launches, acquisitions, or significant milestones specifically about this company. Return up to 3 most relevant recent news items with their headlines, sources, dates, and brief summaries.

List them in a clear, readable format.`;

            const searchResult = await generateText({
              model: google("gemini-2.5-pro"),
              prompt: searchPrompt,
              tools: {
                google_search: google.tools.googleSearch({}),
              },
              stopWhen: stepCountIs(5),
            });

            const rawNews = searchResult.text;

            // Step 2: Structure the news using generateObject
            const structurePrompt = `Take this raw news text and extract up to 3 structured news items.

Raw news text:
${rawNews}

Extract the key information from each news item and structure it properly. If no valid news items are found, return an empty news array.`;

            const structureResult = await generateObject({
              model: google("gemini-flash-latest"),
              schema: structuredNewsSchema,
              prompt: structurePrompt,
            });

            // Transform the structured response to our NewsItem format
            return structureResult.object.news.map((item) => ({
              title: item.title,
              source: item.source,
              date: item.date,
              url: item.url,
              summary: item.summary,
            }));
          } catch (error) {
            console.error(`Error fetching news for ${company.name}:`, error);
            return [];
          }
        });

        const batchResults = await Promise.all(batchPromises);
        newsItems.push(...batchResults.flat());

        // Small delay between batches to be respectful to the API
        if (i + batchSize < companyInfo.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      if (!newsItems || newsItems.length === 0) {
        console.log("No news items fetched");
        return { success: true, newsCount: 0 };
      }

      // Cache the news using the cacheNews mutation
      const cachedNewsId = await ctx.runMutation(
        internal.news_workflow.cacheNews,
        {
          newsItems,
        },
      );

      console.log(
        `Successfully cached ${newsItems.length} news items with ID: ${cachedNewsId}`,
      );

      return { success: true, newsCount: newsItems.length };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error in daily news cache job:", errorMessage);
      return { success: false, error: errorMessage };
    }
  },
});
