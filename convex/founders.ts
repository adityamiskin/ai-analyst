import { mutation, query } from './_generated/server';
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

const company = v.object({
	name: v.string(),
	website: v.string(),
	location: v.string(),
	oneLiner: v.string(),
	stage: v.string(),
	whatDoYouDo: v.string(),
	whyNow: v.string(),
	deck: v.array(fileRef),
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
	videoFile: v.array(fileRef),
	supportingDocs: v.array(fileRef),
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
	metricsCsv: v.array(fileRef),
});

const documents = v.object({
	financialModel: v.array(fileRef),
	capTable: v.array(fileRef),
	incorporation: v.array(fileRef),
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
		const id = await ctx.db.insert('founderApplications', {
			...args,
			createdAt: now,
			updatedAt: now,
		});
		return id;
	},
});

export const updateApplication = mutation({
	args: {
		id: v.id('founderApplications'),
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
		if (!existing) throw new Error('Application not found');
		await ctx.db.patch(id, { ...rest, updatedAt: Date.now() });
		return id;
	},
});

export const getApplication = query({
	args: { id: v.id('founderApplications') },
	handler: async (ctx, { id }) => {
		return await ctx.db.get(id);
	},
});

export const listApplicationsByEmail = query({
	args: { primaryEmail: v.string() },
	handler: async (ctx, { primaryEmail }) => {
		return await ctx.db
			.query('founderApplications')
			.withIndex('by_primary_email_createdAt', (q) =>
				q.eq('primaryEmail', primaryEmail),
			)
			.order('desc')
			.collect();
	},
});

export const deleteApplication = mutation({
	args: { id: v.id('founderApplications') },
	handler: async (ctx, { id }) => {
		await ctx.db.delete(id);
		return true;
	},
});
