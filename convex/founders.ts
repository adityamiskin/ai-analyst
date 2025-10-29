import { mutation, query, action, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import { api, internal } from "./_generated/api";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";

// Import fileRef from schema instead of defining locally
const fileRef = v.object({
  name: v.string(),
  size: v.number(),
  storageId: v.optional(v.id("_storage")),
  mediaType: v.optional(v.string()),
});

const founder = v.object({
  name: v.string(),
  email: v.string(),
  designation: v.string(),
});

const company = v.object({
  name: v.string(),
  website: v.string(),
  location: v.string(),
  oneLiner: v.string(),
  stage: v.string(),
  whatDoYouDo: v.string(),
  whyNow: v.string(),
});

const team = v.object({
  founders: v.array(founder),
  isFullTime: v.boolean(),
  howLongWorked: v.string(),
  relevantExperience: v.string(),
});

const product = v.object({
  description: v.string(),
  demoUrl: v.string(),
  defensibility: v.string(),
  videoUrl: v.string(),
});

const market = v.object({
  customer: v.string(),
  competitors: v.string(),
  differentiation: v.string(),
  gtm: v.string(),
  tam: v.string(),
  sam: v.string(),
  som: v.string(),
});

const traction = v.object({
  isLaunched: v.string(),
  launchDate: v.string(),
  mrr: v.string(),
  growth: v.string(),
  activeUsersCount: v.string(),
  pilots: v.string(),
  kpis: v.string(),
});

const documents = v.object({
  pitchDeck: v.array(fileRef),
  other: v.array(fileRef),
});

export const createApplication = mutation({
  args: {
    company,
    team,
    product,
    market,
    traction,
    documents,
    primaryEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("founderApplications", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });

    // Automatically start multi-agent analysis
    try {
      await ctx.runMutation(api.multi_agent_analysis.startMultiAgentAnalysis, {
        companyId: id,
      });
    } catch (error) {
      console.error("Failed to start automatic analysis:", error);
      // Don't fail the application creation if analysis fails to start
    }

    return id;
  },
});

export const updateApplication = mutation({
  args: {
    id: v.id("founderApplications"),
    company: v.optional(company),
    team: v.optional(team),
    product: v.optional(product),
    market: v.optional(market),
    traction: v.optional(traction),
    documents: v.optional(documents),
    primaryEmail: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...rest }) => {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Application not found");
    await ctx.db.patch(id, { ...rest, updatedAt: Date.now() });
    return id;
  },
});

export const getApplicationById = internalQuery({
  args: { id: v.id("founderApplications") },
  handler: async (ctx, args) => {
    const application = await ctx.db.get(args.id);
    if (!application) {
      throw new Error("Application not found");
    }
    return application;
  },
});

export const getApplication = query({
  args: { id: v.id("founderApplications") },
  handler: async (ctx, { id }) => {
    const application: Doc<"founderApplications"> = await ctx.runQuery(
      internal.founders.getApplicationById,
      { id }
    );
    return application;
  },
});

export const listApplicationsByEmail = query({
  args: { primaryEmail: v.string() },
  handler: async (ctx, { primaryEmail }) => {
    return await ctx.db
      .query("founderApplications")
      .withIndex("by_primary_email_createdAt", (q) =>
        q.eq("primaryEmail", primaryEmail)
      )
      .order("desc")
      .collect();
  },
});

export const deleteApplication = mutation({
  args: { id: v.id("founderApplications") },
  handler: async (ctx, { id }) => {
    // Get the application first to access the file storage IDs
    const application = await ctx.db.get(id);
    if (!application) {
      throw new Error("Application not found");
    }

    // Collect all storage IDs from documents
    const storageIds: Id<"_storage">[] = [];

    // Helper function to extract storage IDs from file arrays
    const extractStorageIds = (
      files?: Array<{ storageId?: Id<"_storage"> }>
    ) => {
      if (files) {
        files.forEach((file) => {
          if (file.storageId) {
            storageIds.push(file.storageId);
          }
        });
      }
    };

    // Extract storage IDs from all document types
    extractStorageIds(application.documents.pitchDeck);
    extractStorageIds(application.documents.other);

    // Delete all related analysis data first
    // Delete agent messages (references companyId and jobId)
    const agentMessages = await ctx.db
      .query("agentMessages")
      .withIndex("by_companyId_jobId", (q) => q.eq("companyId", id))
      .collect();
    await Promise.all(agentMessages.map((msg) => ctx.db.delete(msg._id)));

    // Delete agent activity (references companyId and jobId)
    const agentActivities = await ctx.db
      .query("agentActivity")
      .withIndex("by_companyId_jobId", (q) => q.eq("companyId", id))
      .collect();
    await Promise.all(
      agentActivities.map((activity) => ctx.db.delete(activity._id))
    );

    // Delete analysis jobs (references companyId)
    const analysisJobs = await ctx.db
      .query("analysisJobs")
      .withIndex("by_companyId_createdAt", (q) => q.eq("companyId", id))
      .collect();
    await Promise.all(analysisJobs.map((job) => ctx.db.delete(job._id)));

    // Delete multi-agent analyses (references companyId)
    const analyses = await ctx.db
      .query("multiAgentAnalyses")
      .withIndex("by_companyId_createdAt", (q) => q.eq("companyId", id))
      .collect();
    await Promise.all(analyses.map((analysis) => ctx.db.delete(analysis._id)));

    // Delete all associated files from storage
    const deletePromises = storageIds.map((storageId) =>
      ctx.storage.delete(storageId)
    );

    // Delete files in parallel, but don't fail if some deletions fail
    try {
      await Promise.allSettled(deletePromises);
    } catch (error) {
      console.warn("Some files may not have been deleted:", error);
    }

    // Finally, delete the application record
    await ctx.db.delete(id);
    return true;
  },
});

export const listAllApplications = query({
  args: {},
  handler: async (ctx) => {
    const applications = await ctx.db.query("founderApplications").collect();
    applications.sort((a, b) => b.createdAt - a.createdAt);

    // Only return fields used in the sidebar
    return applications.map((app) => ({
      _id: app._id,
      company: {
        name: app.company.name,
        location: app.company.location,
        oneLiner: app.company.oneLiner,
        stage: app.company.stage,
      },
      traction: {
        mrr: app.traction.mrr,
      },
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      pinned: app.pinned,
    }));
  },
});

export const togglePinCompany = mutation({
  args: {
    id: v.id("founderApplications"),
  },
  handler: async (ctx, { id }) => {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Application not found");

    const newPinnedStatus = !existing.pinned;
    await ctx.db.patch(id, {
      pinned: newPinnedStatus,
      updatedAt: Date.now(),
    });
    return newPinnedStatus;
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const storeFile = action({
  args: {
    file: v.bytes(), // Binary file data
    filename: v.string(),
    contentType: v.string(),
  },
  handler: async (ctx, args) => {
    // Create a Blob from the file bytes
    const blob = new Blob([args.file], { type: args.contentType });

    // Store the file in Convex storage
    const storageId = await ctx.storage.store(blob);

    // Return the storage ID to save in your database
    return storageId;
  },
});



export const getCompanyDocuments = query({
  args: { companyId: v.id("founderApplications") },
  handler: async (ctx, args) => {
    const application = await ctx.db.get(args.companyId);
    if (!application || !application.documents) {
      return [];
    }

    const documents: Array<{
      storageId: Id<"_storage">;
      fileName: string;
      mediaType: string;
    }> = [];

    // Extract documents from pitchDeck and other arrays
    if (application.documents.pitchDeck) {
      application.documents.pitchDeck.forEach((doc) => {
        if (doc.storageId) {
          documents.push({
            storageId: doc.storageId,
            fileName: doc.name || "pitch_deck.pdf",
            mediaType: doc.mediaType || "application/pdf",
          });
        }
      });
    }

    if (application.documents.other) {
      application.documents.other.forEach((doc) => {
        if (doc.storageId) {
          documents.push({
            storageId: doc.storageId,
            fileName: doc.name || "document.pdf",
            mediaType: doc.mediaType || "application/pdf",
          });
        }
      });
    }

    return documents;
  },
});

export const getFileUrl = query({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});
