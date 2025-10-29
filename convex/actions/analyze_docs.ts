"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

// Schema for pitch deck analysis output
const pitchDeckAnalysisSchema = z.object({
  company: z.object({
    name: z.string().describe("The name of the company"),
    website: z.string().url("Valid website URL is required").optional(),
    location: z.string().optional(),
    oneLiner: z.string().describe("The one-liner of the company"),
    stage: z
      .enum(["preseed", "seed", "series-a", "series-b-plus"])
      .describe("The stage of the company"),
    whatDoYouDo: z.string().describe("The what do you do of the company"),
    whyNow: z.string().describe("The why now of the company"),
  }),
  team: z
    .object({
      founders: z
        .array(
          z.object({
            name: z.string().describe("The name of the founder"),
            email: z.string().optional(),
            designation: z.string().describe("The designation of the founder"),
          })
        )
        .optional(),
      howLongWorked: z
        .string()
        .optional()
        .describe("The how long have they worked together"),
      isFullTime: z
        .boolean()
        .optional()
        .describe("Whether all founders are full-time"),
      relevantExperience: z.string().optional(),
    })
    .optional(),
  product: z
    .object({
      description: z.string().describe("The description of the product"),
      defensibility: z
        .string()
        .describe("The defensibility of the product")
        .optional(),
    })
    .optional(),
  market: z
    .object({
      customer: z.string().describe("The customer of the product"),
      competitors: z.string().describe("The competitors of the product"),
      differentiation: z
        .string()
        .describe("The differentiation of the product")
        .optional(),
      gtm: z.string().describe("The go-to-market strategy of the product"),
      tam: z
        .string()
        .optional()
        .describe("The TAM of the product. Few words is enough."),
      sam: z
        .string()
        .optional()
        .describe("The SAM of the product. Few words is enough."),
      som: z
        .string()
        .optional()
        .describe("The SOM of the product. Few words is enough."),
    })
    .optional(),
  traction: z
    .object({
      isLaunched: z.enum(["yes", "no", "soon"]).optional(),
      launchDate: z
        .string()
        .describe("The launch date of the product")
        .optional(),
      mrr: z.string().describe("The MRR of the product").optional(),
      growth: z.string().describe("The growth of the product").optional(),
      activeUsersCount: z
        .string()
        .optional()
        .describe("The active users count of the product"),
      pilots: z.string().describe("The pilots of the product").optional(),
      kpis: z.string().describe("The KPIs of the product").optional(),
    })
    .optional(),
});

export const analyzeDocuments = action({
  args: {
    documents: v.array(
      v.object({
        fileName: v.string(),
        storageId: v.id("_storage"),
        mediaType: v.string(),
      })
    ),
  },
  handler: async (ctx, { documents }) => {
    // Retrieve files from storage
    const fileContents = await Promise.all(
      documents.map(async (doc) => {
        const fileData = await ctx.storage.get(doc.storageId);
        if (!fileData) {
          throw new Error(`File not found in storage: ${doc.fileName}`);
        }
        return {
          fileName: doc.fileName,
          fileData: new Uint8Array(await fileData.arrayBuffer()),
          mediaType: doc.mediaType,
        };
      })
    );

    console.log("File contents length:", fileContents.length);

    // Create content array with text prompt and file inputs
    const content = [
      {
        type: "text" as const,
        text: `Analyze these startup documents and extract information that would help fill out a startup application form.

Please extract and structure the following information from the documents:
- Company basics (name, website, location, one-liner, stage)
- What the company does and why now
- Team information (founders, experience)
- Product details
- Market analysis (customers, competitors, differentiation, TAM/SAM/SOM)
- Traction metrics

Return the information in a structured format that can be used to pre-fill form fields. If information is found in multiple documents, prioritize the most recent or comprehensive information.`,
      },
      ...fileContents.map((doc) => ({
        type: "file" as const,
        data: doc.fileData,
        mediaType: doc.mediaType,
      })),
    ];

    try {
      const result = await generateObject({
        model: google("gemini-2.5-pro"),
        schema: pitchDeckAnalysisSchema,
        messages: [
          {
            role: "user",
            content,
          },
        ],
      });

      // console.log("Result:", result.object);

      return result.object;
    } catch (error) {
      console.error("Error analyzing documents:", error);
      // Return empty object on error so the form can still function
      return {};
    }
  },
});
