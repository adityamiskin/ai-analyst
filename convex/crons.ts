import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

/**
 * Daily news cache job.
 * Runs every day at 9:00 AM UTC to fetch and cache company news.
 */
crons.cron(
  "fetchAndCacheNews",
  "0 9 * * *",
  internal.actions.news.fetchAndCacheNewsDaily,
);

/**
 * Daily cache cleanup job.
 * Runs every day at 10:00 PM UTC to clean up expired cache entries.
 */
crons.cron(
  "cleanupExpiredCache",
  "0 22 * * *",
  internal.news_workflow.cleanupExpiredCache,
);

export default crons;
