import {
	action,
	internalAction,
	internalMutation,
	mutation,
	query,
} from './_generated/server';
import { v } from 'convex/values';
import { z } from 'zod';
import { companyAnalysisAgent, companyRag } from './ai';
import { api, internal } from './_generated/api';

function buildApplicationText(app: any): string {
	const parts: string[] = [];
	if (!app) return '';
	const c = app.company ?? {};
	const t = app.team ?? {};
	const p = app.product ?? {};
	const m = app.market ?? {};
	const tr = app.traction ?? {};
	parts.push(`# Company`);
	parts.push(`Name: ${c.name}`);
	parts.push(`Website: ${c.website}`);
	parts.push(`Location: ${c.location}`);
	parts.push(`Stage: ${c.stage}`);
	parts.push(`One-liner: ${c.oneLiner}`);
	parts.push(`What do you do: ${c.whatDoYouDo}`);
	parts.push(`Why now: ${c.whyNow}`);

	parts.push(`\n# Team`);
	parts.push(
		`Founders: ${(t.founders ?? [])
			.map((f: any) => `${f.name} <${f.email}> (${f.designation})`)
			.join('; ')}`,
	);
	parts.push(`Full-time: ${t.isFullTime}`);
	parts.push(`How long worked: ${t.howLongWorked}`);
	parts.push(`Relevant experience: ${t.relevantExperience}`);

	parts.push(`\n# Product`);
	parts.push(`Description: ${p.description}`);
	parts.push(`Demo URL: ${p.demoUrl}`);
	parts.push(`Defensibility: ${p.defensibility}`);

	parts.push(`\n# Market`);
	parts.push(`Customer: ${m.customer}`);
	parts.push(`Competitors: ${m.competitors}`);
	parts.push(`Differentiation: ${m.differentiation}`);
	parts.push(`GTM: ${m.gtm}`);
	parts.push(`TAM: ${m.tam}`);
	parts.push(`SAM: ${m.sam}`);
	parts.push(`SOM: ${m.som}`);

	parts.push(`\n# Traction`);
	parts.push(`Launched: ${tr.isLaunched}`);
	parts.push(`Launch date: ${tr.launchDate}`);
	parts.push(`MRR: ${tr.mrr}`);
	parts.push(`Growth: ${tr.growth}`);
	parts.push(`Active users: ${tr.activeUsersCount}`);
	parts.push(`Pilots: ${tr.pilots}`);
	parts.push(`KPIs: ${tr.kpis}`);

	return parts.filter(Boolean).join('\n');
}

// Snapshot validator for saving
const source = v.object({
	title: v.string(),
	url: v.string(),
	date: v.string(),
	confidence: v.number(),
	extractedFacts: v.array(v.string()),
});
const check = v.object({
	label: v.string(),
	status: v.union(v.literal('pass'), v.literal('warn')),
	note: v.optional(v.string()),
});
const metric = v.object({
	key: v.string(),
	label: v.string(),
	value: v.number(),
	unit: v.optional(v.string()),
	peerMedian: v.optional(v.number()),
	sources: v.array(source),
	checks: v.array(check),
});
const risk = v.object({
	severity: v.union(v.literal('low'), v.literal('med'), v.literal('high')),
	label: v.string(),
	evidence: v.string(),
});
const snapshotValidator = v.object({
	company: v.string(),
	sector: v.string(),
	stage: v.string(),
	ask: v.string(),
	summary: v.string(),
	lastUpdated: v.string(),
	metrics: v.array(metric),
	risks: v.array(risk),
});

// Zod schema for generateObject
const snapshotSchema = z.object({
	company: z.string(),
	sector: z.string(),
	stage: z.string(),
	ask: z.string(),
	summary: z.string(),
	lastUpdated: z.string(),
	metrics: z.array(
		z.object({
			key: z.string(),
			label: z.string(),
			value: z.number(),
			unit: z.string().optional(),
			peerMedian: z.number().optional(),
			sources: z.array(
				z.object({
					title: z.string(),
					url: z.string(),
					date: z.string(),
					confidence: z.number(),
					extractedFacts: z.array(z.string()),
				}),
			),
			checks: z.array(
				z.object({
					label: z.string(),
					status: z.enum(['pass', 'warn']),
					note: z.string().optional(),
				}),
			),
		}),
	),
	risks: z.array(
		z.object({
			severity: z.enum(['low', 'med', 'high']),
			label: z.string(),
			evidence: z.string(),
		}),
	),
});

export const ingestCompanyApplication = action({
	args: { companyId: v.id('founderApplications') },
	handler: async (ctx, { companyId }) => {
		const app = await ctx.runQuery(api.founders.getApplication, {
			id: companyId,
		});
		if (!app) throw new Error('Application not found');
		const text = buildApplicationText(app);
		await companyRag.add(ctx, {
			namespace: `${companyId}`,
			key: `founderApplication:${companyId}`,
			text,
		});
		return { ok: true };
	},
});

export const runAnalysis = internalAction({
	args: { companyId: v.id('founderApplications'), jobId: v.id('analysisJobs') },
	handler: async (ctx, { companyId, jobId }) => {
		try {
			// Update job status to running
			await ctx.runMutation(internal.analysis.updateJobStatus, {
				jobId,
				status: 'running',
				progress: 10,
				message: 'Starting analysis...',
			});

			// Ingest latest application text into RAG
			try {
				await ctx.runMutation(internal.analysis.updateJobStatus, {
					jobId,
					status: 'ingesting',
					progress: 25,
					message: 'Ingesting company data...',
				});

				await ctx.runAction(api.analysis.ingestCompanyApplication, {
					companyId,
				});
			} catch (e) {
				// continue; not fatal if already ingested
			}

			// Update job status for retrieval phase
			await ctx.runMutation(internal.analysis.updateJobStatus, {
				jobId,
				status: 'analyzing',
				progress: 50,
				message: 'Retrieving company context...',
			});

			// Retrieve context from RAG
			const { text: contextText } = await companyRag.search(ctx, {
				namespace: `${companyId}`,
				query:
					'company overview, product, market, tam, traction, mrr, growth, risks, competitors, differentiation',
				limit: 20,
				chunkContext: { before: 1, after: 1 },
			});

			// Update job status for analysis phase
			await ctx.runMutation(internal.analysis.updateJobStatus, {
				jobId,
				status: 'analyzing',
				progress: 75,
				message: 'Running AI analysis...',
			});

			// Create a thread for this analysis
			const { thread } = await companyAnalysisAgent.createThread(ctx, {
				title: `Company Analysis ${companyId}`,
			});

			const today = new Date();
			const yyyy = today.getFullYear();
			const mm = String(today.getMonth() + 1).padStart(2, '0');
			const dd = String(today.getDate()).padStart(2, '0');
			const isoDate = `${yyyy}-${mm}-${dd}`;

			const prompt = `You are an AI investment analyst. Using the CONTEXT below, produce a single JSON object strictly matching this TypeScript type (no extra keys):

{
  "company": string,
  "sector": string,
  "stage": string,
  "ask": string,
  "summary": string,
  "lastUpdated": string, // ISO date like ${isoDate}
  "metrics": Array<{
    "key": string,
    "label": string,
    "value": number,
    "unit"?: string,
    "peerMedian"?: number,
    "sources": Array<{
      "title": string,
      "url": string,
      "date": string,
      "confidence": number,
      "extractedFacts": string[]
    }>,
    "checks": Array<{ "label": string; "status": "pass" | "warn"; "note"?: string }>
  }>,
  "risks": Array<{ "severity": "low" | "med" | "high"; "label": string; "evidence": string }>
}

Rules:
- Base all numbers on CONTEXT; if unknown, use 0 and include a source with confidence 0.
- Include at least MRR and Growth metrics when possible.
- Populate checks like "ARR vs MRR consistency", "Data freshness", "Variance vs benchmark".
- Summaries must be concise, auditable, and avoid hallucinations.
- Return ONLY valid JSON, no Markdown, no comments.

CONTEXT:\n\n${contextText}`;

			const result = await thread.generateObject(
				{ prompt, schema: snapshotSchema },
				{
					storageOptions: { saveMessages: 'all' },
				},
			);

			let snapshot = result.object;

			// Ensure lastUpdated
			if (!snapshot.lastUpdated) snapshot.lastUpdated = isoDate;

			// Update job status for saving
			await ctx.runMutation(internal.analysis.updateJobStatus, {
				jobId,
				status: 'analyzing',
				progress: 90,
				message: 'Saving analysis results...',
			});

			await ctx.runMutation(api.analysis.saveSnapshot, { companyId, snapshot });

			// Mark job as completed
			await ctx.runMutation(internal.analysis.updateJobStatus, {
				jobId,
				status: 'completed',
				progress: 100,
				message: 'Analysis completed successfully',
				completedAt: Date.now(),
			});
		} catch (error) {
			console.error('Analysis failed:', error);
			await ctx.runMutation(internal.analysis.updateJobStatus, {
				jobId,
				status: 'failed',
				progress: 0,
				message: 'Analysis failed',
				error: error instanceof Error ? error.message : 'Unknown error',
			});
			throw error;
		}
	},
});

export const saveSnapshot = mutation({
	args: { companyId: v.id('founderApplications'), snapshot: snapshotValidator },
	handler: async (ctx, { companyId, snapshot }) => {
		await ctx.db.insert('companyAnalyses', {
			companyId,
			snapshot,
			createdAt: Date.now(),
		});
		return true;
	},
});

export const startAnalysis = mutation({
	args: { companyId: v.id('founderApplications') },
	handler: async (ctx, { companyId }) => {
		// Create a job record
		const jobId = await ctx.db.insert('analysisJobs', {
			companyId,
			jobType: 'single_agent',
			status: 'queued',
			progress: 0,
			message: 'Analysis job queued',
			createdAt: Date.now(),
			updatedAt: Date.now(),
		});

		await ctx.scheduler.runAfter(0, internal.analysis.runAnalysis, {
			companyId,
			jobId,
		});
		return { started: true, jobId };
	},
});

// Internal mutation to update job status
export const updateJobStatus = internalMutation({
	args: {
		jobId: v.id('analysisJobs'),
		status: v.union(
			v.literal('queued'),
			v.literal('running'),
			v.literal('ingesting'),
			v.literal('analyzing'),
			v.literal('completed'),
			v.literal('failed'),
		),
		progress: v.number(),
		message: v.string(),
		completedAt: v.optional(v.number()),
		error: v.optional(v.string()),
	},
	handler: async (
		ctx,
		{ jobId, status, progress, message, completedAt, error },
	) => {
		await ctx.db.patch(jobId, {
			status,
			progress,
			message,
			updatedAt: Date.now(),
			...(completedAt && { completedAt }),
			...(error && { error }),
		});
	},
});

export const getLatestSnapshot = query({
	args: { companyId: v.id('founderApplications') },
	handler: async (ctx, { companyId }) => {
		const doc = await ctx.db
			.query('companyAnalyses')
			.withIndex('by_companyId_createdAt', (q) => q.eq('companyId', companyId))
			.order('desc')
			.first();
		return doc ?? null;
	},
});

// Query to get current job status for a company and job type
export const getJobStatus = query({
	args: {
		companyId: v.id('founderApplications'),
		jobType: v.union(v.literal('single_agent'), v.literal('multi_agent')),
	},
	handler: async (ctx, { companyId, jobType }) => {
		const doc = await ctx.db
			.query('analysisJobs')
			.withIndex('by_companyId_jobType', (q) =>
				q.eq('companyId', companyId).eq('jobType', jobType),
			)
			.order('desc')
			.first();
		return doc ?? null;
	},
});
