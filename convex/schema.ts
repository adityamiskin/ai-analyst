import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const fileRef = v.object({
	name: v.string(),
	size: v.number(),
});

const founder = v.object({
	name: v.string(),
	email: v.string(),
	designation: v.string(),
});

export default defineSchema({
	founderApplications: defineTable({
		company: v.object({
			name: v.string(),
			website: v.string(),
			location: v.string(),
			oneLiner: v.string(),
			stage: v.string(),
			whatDoYouDo: v.string(),
			whyNow: v.string(),
			deck: v.array(fileRef),
		}),
		team: v.object({
			founders: v.array(founder),
			isFullTime: v.boolean(),
			howLongWorked: v.string(),
			relevantExperience: v.string(),
		}),
		product: v.object({
			description: v.string(),
			demoUrl: v.string(),
			defensibility: v.string(),
			videoUrl: v.string(),
			videoFile: v.array(fileRef),
			supportingDocs: v.array(fileRef),
		}),
		market: v.object({
			customer: v.string(),
			competitors: v.string(),
			differentiation: v.string(),
			gtm: v.string(),
			tam: v.string(),
			sam: v.string(),
			som: v.string(),
		}),
		traction: v.object({
			isLaunched: v.string(),
			launchDate: v.string(),
			mrr: v.string(),
			growth: v.string(),
			activeUsersCount: v.string(),
			pilots: v.string(),
			kpis: v.string(),
			metricsCsv: v.array(fileRef),
		}),
		documents: v.object({
			financialModel: v.array(fileRef),
			capTable: v.array(fileRef),
			incorporation: v.array(fileRef),
			other: v.array(fileRef),
		}),
		primaryEmail: v.string(),
		createdAt: v.number(),
		updatedAt: v.number(),
	})
		.index('by_primary_email', ['primaryEmail'])
		.index('by_primary_email_createdAt', ['primaryEmail', 'createdAt']),
});
