import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

// Query to get cached news if it's still valid (not expired)
export const getCachedNews = query({
  args: {},
  handler: async (ctx) => {
    // Get the most recent cached news that hasn't expired
    const cached = await ctx.db
      .query("cachedNews")
      .withIndex("by_expiresAt", (q) => q.gt("expiresAt", Date.now()))
      .order("desc")
      .first();

    return cached;
  },
});

// Mutation to cache news (called by the workflow)
export const cacheNews = internalMutation({
  args: {
    newsItems: v.array(
      v.object({
        title: v.string(),
        source: v.optional(v.string()),
        date: v.string(),
        url: v.optional(v.string()),
        summary: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, { newsItems }) => {
    const now = Date.now();
    const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

    // Insert new cached news
    const cachedNewsId = await ctx.db.insert("cachedNews", {
      newsItems,
      cachedAt: now,
      expiresAt: now + CACHE_DURATION_MS,
    });

    // Clean up old expired cache entries (optional, but good for storage)
    const expiredEntries = await ctx.db
      .query("cachedNews")
      .withIndex("by_expiresAt", (q) => q.lt("expiresAt", now))
      .collect();

    for (const entry of expiredEntries) {
      await ctx.db.delete(entry._id);
    }

    return cachedNewsId;
  },
});

// Mutation to clear expired cache entries
export const cleanupExpiredCache = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expiredEntries = await ctx.db
      .query("cachedNews")
      .withIndex("by_expiresAt", (q) => q.lt("expiresAt", now))
      .collect();

    let deletedCount = 0;
    for (const entry of expiredEntries) {
      await ctx.db.delete(entry._id);
      deletedCount++;
    }

    return { deletedCount };
  },
});
