import {
	action,
	internalAction,
	internalMutation,
	mutation,
	query,
} from './_generated/server';
import { v } from 'convex/values';
import { z } from 'zod';
import {
	financeAgent,
	evaluationAgent,
	competitorAgent,
	marketAgent,
	technicalAgent,
	orchestrationAgent,
	companyRag,
} from './ai';
import { api, internal } from './_generated/api';

// Zod schemas for each agent's analysis - made more flexible
const agentAnalysisSchema = z.object({
	agentId: z.string(),
	agentName: z.string(),
	summary: z.string(),
	confidence: z.number().min(0).max(1).default(0.5),
	keyFindings: z.array(z.string()).default([]),
	metrics: z
		.array(
			z.object({
				key: z.string(),
				label: z.string(),
				value: z.number().default(0),
				unit: z.string().optional(),
				peerMedian: z.number().optional(),
				sources: z
					.array(
						z.object({
							title: z.string().default('Unknown'),
							url: z.string().default(''),
							date: z.string().default(new Date().toISOString().split('T')[0]),
							confidence: z.number().default(0.5),
							extractedFacts: z.array(z.string()).default([]),
						}),
					)
					.default([]),
				checks: z
					.array(
						z.object({
							label: z.string(),
							status: z.enum(['pass', 'warn']).default('pass'),
							note: z.string().optional(),
						}),
					)
					.default([]),
			}),
		)
		.default([]),
	risks: z
		.array(
			z.object({
				severity: z.enum(['low', 'med', 'high']).default('low'),
				label: z.string(),
				evidence: z.string(),
			}),
		)
		.default([]),
	sources: z
		.array(
			z.object({
				title: z.string().default('Unknown'),
				url: z.string().default(''),
				date: z.string().default(new Date().toISOString().split('T')[0]),
				confidence: z.number().default(0.5),
				extractedFacts: z.array(z.string()).default([]),
			}),
		)
		.default([]),
	recommendations: z.array(z.string()).default([]),
	lastUpdated: z.string().default(new Date().toISOString().split('T')[0]),
});

const multiAgentSnapshotSchema = z.object({
	company: z.string(),
	sector: z.string().default('Unknown'),
	stage: z.string().default('Unknown'),
	ask: z.string().default('Unknown'),
	overallSummary: z.string(),
	overallConfidence: z.number().min(0).max(1).default(0.5),
	lastUpdated: z.string().default(new Date().toISOString().split('T')[0]),
	agentAnalyses: z.array(agentAnalysisSchema).default([]),
	consolidatedMetrics: z
		.array(
			z.object({
				key: z.string(),
				label: z.string(),
				value: z.number().default(0),
				unit: z.string().optional(),
				peerMedian: z.number().optional(),
				sources: z
					.array(
						z.object({
							title: z.string().default('Unknown'),
							url: z.string().default(''),
							date: z.string().default(new Date().toISOString().split('T')[0]),
							confidence: z.number().default(0.5),
							extractedFacts: z.array(z.string()).default([]),
						}),
					)
					.default([]),
				checks: z
					.array(
						z.object({
							label: z.string(),
							status: z.enum(['pass', 'warn']).default('pass'),
							note: z.string().optional(),
						}),
					)
					.default([]),
			}),
		)
		.default([]),
	consolidatedRisks: z
		.array(
			z.object({
				severity: z.enum(['low', 'med', 'high']).default('low'),
				label: z.string(),
				evidence: z.string(),
			}),
		)
		.default([]),
	investmentRecommendation: z
		.enum(['strong_buy', 'buy', 'hold', 'sell', 'strong_sell'])
		.default('hold'),
	recommendationReasoning: z.string().default('Analysis in progress'),
});

// Helper function to build application text (reused from analysis.ts)
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

// Individual agent analysis functions
async function runFinanceAnalysis(
	ctx: any,
	companyId: string,
	contextText: string,
) {
	const { thread } = await financeAgent.createThread(ctx, {
		title: `Finance Analysis ${companyId}`,
	});

	const today = new Date().toISOString().split('T')[0];

	const prompt = `You are a financial analyst. Analyze the company's financial aspects and return a JSON object.

Required JSON format:
{
  "agentId": "finance",
  "agentName": "Financial Analysis Agent", 
  "summary": "Brief financial summary",
  "confidence": 0.8,
  "keyFindings": ["Key finding 1", "Key finding 2"],
  "metrics": [],
  "risks": [{"severity": "low", "label": "Risk name", "evidence": "Risk description"}],
  "sources": [],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "lastUpdated": "${today}"
}

Focus on: revenue, growth, unit economics, funding needs, financial risks.

Company context: ${contextText}`;

	try {
		const result = await thread.generateObject(
			{ prompt, schema: agentAnalysisSchema },
			{
				storageOptions: { saveMessages: 'all' },
			},
		);

		return result.object;
	} catch (error) {
		console.error('Finance analysis failed:', error);
		// Return a fallback analysis
		return {
			agentId: 'finance',
			agentName: 'Financial Analysis Agent',
			summary:
				'Financial analysis could not be completed due to an error. Please try again.',
			confidence: 0.1,
			keyFindings: ['Analysis failed - insufficient data'],
			metrics: [],
			risks: [
				{
					severity: 'high' as const,
					label: 'Analysis Error',
					evidence: 'Unable to complete financial analysis',
				},
			],
			sources: [],
			recommendations: ['Retry analysis with more complete data'],
			lastUpdated: today,
		};
	}
}

async function runEvaluationAnalysis(
	ctx: any,
	companyId: string,
	contextText: string,
) {
	const { thread } = await evaluationAgent.createThread(ctx, {
		title: `Evaluation Analysis ${companyId}`,
	});

	const today = new Date().toISOString().split('T')[0];

	const prompt = `You are an investment analyst. Evaluate the investment opportunity and return a JSON object.

Required JSON format:
{
  "agentId": "evaluation",
  "agentName": "Investment Evaluation Agent",
  "summary": "Brief investment evaluation summary",
  "confidence": 0.8,
  "keyFindings": ["Key finding 1", "Key finding 2"],
  "metrics": [],
  "risks": [{"severity": "low", "label": "Risk name", "evidence": "Risk description"}],
  "sources": [],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "lastUpdated": "${today}"
}

Focus on: investment thesis, team quality, product-market fit, competitive position, market timing.

Company context: ${contextText}`;

	try {
		const result = await thread.generateObject(
			{ prompt, schema: agentAnalysisSchema },
			{
				storageOptions: { saveMessages: 'all' },
			},
		);

		return result.object;
	} catch (error) {
		console.error('Evaluation analysis failed:', error);
		// Return a fallback analysis
		return {
			agentId: 'evaluation',
			agentName: 'Investment Evaluation Agent',
			summary:
				'Investment evaluation could not be completed due to an error. Please try again.',
			confidence: 0.1,
			keyFindings: ['Analysis failed - insufficient data'],
			metrics: [],
			risks: [
				{
					severity: 'high' as const,
					label: 'Analysis Error',
					evidence: 'Unable to complete investment evaluation',
				},
			],
			sources: [],
			recommendations: ['Retry analysis with more complete data'],
			lastUpdated: today,
		};
	}
}

async function runCompetitorAnalysis(
	ctx: any,
	companyId: string,
	contextText: string,
) {
	const { thread } = await competitorAgent.createThread(ctx, {
		title: `Competitor Analysis ${companyId}`,
	});

	const today = new Date().toISOString().split('T')[0];

	const prompt = `You are a competitive analyst. Analyze the competitive landscape and return a JSON object.

Required JSON format:
{
  "agentId": "competitor",
  "agentName": "Competitive Intelligence Agent",
  "summary": "Brief competitive analysis summary",
  "confidence": 0.8,
  "keyFindings": ["Key finding 1", "Key finding 2"],
  "metrics": [],
  "risks": [{"severity": "low", "label": "Risk name", "evidence": "Risk description"}],
  "sources": [],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "lastUpdated": "${today}"
}

Focus on: competitors, market positioning, competitive advantages, threats.

Company context: ${contextText}`;

	try {
		const result = await thread.generateObject(
			{ prompt, schema: agentAnalysisSchema },
			{
				storageOptions: { saveMessages: 'all' },
			},
		);

		return result.object;
	} catch (error) {
		console.error('Agent analysis failed:', error);
		// Return a fallback analysis
		return {
			agentId: 'unknown',
			agentName: 'Analysis Agent',
			summary:
				'Analysis could not be completed due to an error. Please try again.',
			confidence: 0.1,
			keyFindings: ['Analysis failed - insufficient data'],
			metrics: [],
			risks: [
				{
					severity: 'high' as const,
					label: 'Analysis Error',
					evidence: 'Unable to complete analysis',
				},
			],
			sources: [],
			recommendations: ['Retry analysis with more complete data'],
			lastUpdated: today,
		};
	}
}

async function runMarketAnalysis(
	ctx: any,
	companyId: string,
	contextText: string,
) {
	const { thread } = await marketAgent.createThread(ctx, {
		title: `Market Analysis ${companyId}`,
	});

	const today = new Date().toISOString().split('T')[0];

	const prompt = `You are a market analyst. Analyze the market opportunity and return a JSON object.

Required JSON format:
{
  "agentId": "market",
  "agentName": "Market Research Agent",
  "summary": "Brief market analysis summary",
  "confidence": 0.8,
  "keyFindings": ["Key finding 1", "Key finding 2"],
  "metrics": [],
  "risks": [{"severity": "low", "label": "Risk name", "evidence": "Risk description"}],
  "sources": [],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "lastUpdated": "${today}"
}

Focus on: market size, trends, customer segments, go-to-market strategy.

Company context: ${contextText}`;

	try {
		const result = await thread.generateObject(
			{ prompt, schema: agentAnalysisSchema },
			{
				storageOptions: { saveMessages: 'all' },
			},
		);

		return result.object;
	} catch (error) {
		console.error('Agent analysis failed:', error);
		// Return a fallback analysis
		return {
			agentId: 'unknown',
			agentName: 'Analysis Agent',
			summary:
				'Analysis could not be completed due to an error. Please try again.',
			confidence: 0.1,
			keyFindings: ['Analysis failed - insufficient data'],
			metrics: [],
			risks: [
				{
					severity: 'high' as const,
					label: 'Analysis Error',
					evidence: 'Unable to complete analysis',
				},
			],
			sources: [],
			recommendations: ['Retry analysis with more complete data'],
			lastUpdated: today,
		};
	}
}

async function runTechnicalAnalysis(
	ctx: any,
	companyId: string,
	contextText: string,
) {
	const { thread } = await technicalAgent.createThread(ctx, {
		title: `Technical Analysis ${companyId}`,
	});

	const today = new Date().toISOString().split('T')[0];

	const prompt = `You are a technical analyst. Analyze the technical aspects and return a JSON object.

Required JSON format:
{
  "agentId": "technical",
  "agentName": "Technical Assessment Agent",
  "summary": "Brief technical analysis summary",
  "confidence": 0.8,
  "keyFindings": ["Key finding 1", "Key finding 2"],
  "metrics": [],
  "risks": [{"severity": "low", "label": "Risk name", "evidence": "Risk description"}],
  "sources": [],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "lastUpdated": "${today}"
}

Focus on: technology stack, scalability, IP, technical risks, innovation.

Company context: ${contextText}`;

	try {
		const result = await thread.generateObject(
			{ prompt, schema: agentAnalysisSchema },
			{
				storageOptions: { saveMessages: 'all' },
			},
		);

		return result.object;
	} catch (error) {
		console.error('Agent analysis failed:', error);
		// Return a fallback analysis
		return {
			agentId: 'unknown',
			agentName: 'Analysis Agent',
			summary:
				'Analysis could not be completed due to an error. Please try again.',
			confidence: 0.1,
			keyFindings: ['Analysis failed - insufficient data'],
			metrics: [],
			risks: [
				{
					severity: 'high' as const,
					label: 'Analysis Error',
					evidence: 'Unable to complete analysis',
				},
			],
			sources: [],
			recommendations: ['Retry analysis with more complete data'],
			lastUpdated: today,
		};
	}
}

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

// Main multi-agent analysis function
export const runMultiAgentAnalysis = internalAction({
	args: { companyId: v.id('founderApplications'), jobId: v.id('analysisJobs') },
	handler: async (ctx, { companyId, jobId }) => {
		try {
			// Update job status to running
			await ctx.runMutation(internal.multi_agent_analysis.updateJobStatus, {
				jobId,
				status: 'running',
				progress: 5,
				message: 'Starting multi-agent analysis...',
			});

			// Ingest latest application text into RAG
			try {
				await ctx.runMutation(internal.multi_agent_analysis.updateJobStatus, {
					jobId,
					status: 'ingesting',
					progress: 10,
					message: 'Ingesting company data...',
				});

				await ctx.runAction(api.analysis.ingestCompanyApplication, {
					companyId,
				});
			} catch (e) {
				// continue; not fatal if already ingested
			}

			// Update job status for retrieval phase
			await ctx.runMutation(internal.multi_agent_analysis.updateJobStatus, {
				jobId,
				status: 'analyzing',
				progress: 20,
				message: 'Retrieving company context...',
			});

			// Retrieve context from RAG
			const { text: contextText } = await companyRag.search(ctx, {
				namespace: `${companyId}`,
				query:
					'company overview, product, market, tam, traction, mrr, growth, risks, competitors, differentiation, team, technology, financials',
				limit: 30,
				chunkContext: { before: 1, after: 1 },
			});

			// Update job status for agent analysis phase
			await ctx.runMutation(internal.multi_agent_analysis.updateJobStatus, {
				jobId,
				status: 'analyzing',
				progress: 40,
				message: 'Running specialized agent analyses...',
			});

			// Run all agent analyses in parallel
			const [
				financeAnalysis,
				evaluationAnalysis,
				competitorAnalysis,
				marketAnalysis,
				technicalAnalysis,
			] = await Promise.all([
				runFinanceAnalysis(ctx, companyId, contextText),
				runEvaluationAnalysis(ctx, companyId, contextText),
				runCompetitorAnalysis(ctx, companyId, contextText),
				runMarketAnalysis(ctx, companyId, contextText),
				runTechnicalAnalysis(ctx, companyId, contextText),
			]);

			// Update job status for orchestration phase
			await ctx.runMutation(internal.multi_agent_analysis.updateJobStatus, {
				jobId,
				status: 'analyzing',
				progress: 80,
				message: 'Synthesizing agent insights...',
			});

			// Run orchestration agent to synthesize results
			const { thread } = await orchestrationAgent.createThread(ctx, {
				title: `Orchestration Analysis ${companyId}`,
			});

			const today = new Date().toISOString().split('T')[0];

			const orchestrationPrompt = `You are an investment analyst. Synthesize the agent analyses and return a JSON object.

Required JSON format:
{
  "company": "Company Name",
  "sector": "Technology",
  "stage": "Seed",
  "ask": "Funding amount",
  "overallSummary": "Brief overall summary",
  "overallConfidence": 0.8,
  "lastUpdated": "${today}",
  "agentAnalyses": [${JSON.stringify(financeAnalysis)}, ${JSON.stringify(
				evaluationAnalysis,
			)}, ${JSON.stringify(competitorAnalysis)}, ${JSON.stringify(
				marketAnalysis,
			)}, ${JSON.stringify(technicalAnalysis)}],
  "consolidatedMetrics": [],
  "consolidatedRisks": [{"severity": "low", "label": "Risk", "evidence": "Description"}],
  "investmentRecommendation": "hold",
  "recommendationReasoning": "Brief reasoning"
}

Agent analyses:
Finance: ${financeAnalysis.summary}
Evaluation: ${evaluationAnalysis.summary}
Competitor: ${competitorAnalysis.summary}
Market: ${marketAnalysis.summary}
Technical: ${technicalAnalysis.summary}`;

			try {
				const orchestrationResult = await thread.generateObject(
					{ prompt: orchestrationPrompt, schema: multiAgentSnapshotSchema },
					{
						storageOptions: { saveMessages: 'all' },
					},
				);

				const snapshot = orchestrationResult.object;

				// Ensure lastUpdated
				if (!snapshot.lastUpdated) snapshot.lastUpdated = today;

				// Update job status for saving
				await ctx.runMutation(internal.multi_agent_analysis.updateJobStatus, {
					jobId,
					status: 'analyzing',
					progress: 95,
					message: 'Saving analysis results...',
				});

				await ctx.runMutation(api.multi_agent_analysis.saveMultiAgentSnapshot, {
					companyId,
					snapshot,
				});

				// Mark job as completed
				await ctx.runMutation(internal.multi_agent_analysis.updateJobStatus, {
					jobId,
					status: 'completed',
					progress: 100,
					message: 'Multi-agent analysis completed successfully',
					completedAt: Date.now(),
				});
			} catch (error) {
				console.error('Orchestration failed:', error);
				// Create a fallback snapshot with the individual agent results
				const fallbackSnapshot = {
					company: 'Unknown Company',
					sector: 'Unknown',
					stage: 'Unknown',
					ask: 'Unknown',
					overallSummary:
						'Multi-agent analysis encountered errors. Individual agent results may be incomplete.',
					overallConfidence: 0.1,
					lastUpdated: today,
					agentAnalyses: [
						financeAnalysis,
						evaluationAnalysis,
						competitorAnalysis,
						marketAnalysis,
						technicalAnalysis,
					],
					consolidatedMetrics: [],
					consolidatedRisks: [
						{
							severity: 'high' as const,
							label: 'Analysis Error',
							evidence: 'Orchestration failed - unable to synthesize results',
						},
					],
					investmentRecommendation: 'hold' as const,
					recommendationReasoning:
						'Unable to complete full analysis due to errors. Please retry.',
				};

				await ctx.runMutation(api.multi_agent_analysis.saveMultiAgentSnapshot, {
					companyId,
					snapshot: fallbackSnapshot,
				});

				// Mark job as completed with partial results
				await ctx.runMutation(internal.multi_agent_analysis.updateJobStatus, {
					jobId,
					status: 'completed',
					progress: 100,
					message: 'Multi-agent analysis completed with partial results',
					completedAt: Date.now(),
				});
			}
		} catch (error) {
			console.error('Multi-agent analysis failed:', error);
			await ctx.runMutation(internal.multi_agent_analysis.updateJobStatus, {
				jobId,
				status: 'failed',
				progress: 0,
				message: 'Multi-agent analysis failed',
				error: error instanceof Error ? error.message : 'Unknown error',
			});
			throw error;
		}
	},
});

export const saveMultiAgentSnapshot = mutation({
	args: {
		companyId: v.id('founderApplications'),
		snapshot: v.object({
			company: v.string(),
			sector: v.string(),
			stage: v.string(),
			ask: v.string(),
			overallSummary: v.string(),
			overallConfidence: v.number(),
			lastUpdated: v.string(),
			agentAnalyses: v.array(
				v.object({
					agentId: v.string(),
					agentName: v.string(),
					summary: v.string(),
					confidence: v.number(),
					keyFindings: v.array(v.string()),
					metrics: v.array(
						v.object({
							key: v.string(),
							label: v.string(),
							value: v.number(),
							unit: v.optional(v.string()),
							peerMedian: v.optional(v.number()),
							sources: v.array(
								v.object({
									title: v.string(),
									url: v.string(),
									date: v.string(),
									confidence: v.number(),
									extractedFacts: v.array(v.string()),
								}),
							),
							checks: v.array(
								v.object({
									label: v.string(),
									status: v.union(v.literal('pass'), v.literal('warn')),
									note: v.optional(v.string()),
								}),
							),
						}),
					),
					risks: v.array(
						v.object({
							severity: v.union(
								v.literal('low'),
								v.literal('med'),
								v.literal('high'),
							),
							label: v.string(),
							evidence: v.string(),
						}),
					),
					sources: v.array(
						v.object({
							title: v.string(),
							url: v.string(),
							date: v.string(),
							confidence: v.number(),
							extractedFacts: v.array(v.string()),
						}),
					),
					recommendations: v.array(v.string()),
					lastUpdated: v.string(),
				}),
			),
			consolidatedMetrics: v.array(
				v.object({
					key: v.string(),
					label: v.string(),
					value: v.number(),
					unit: v.optional(v.string()),
					peerMedian: v.optional(v.number()),
					sources: v.array(
						v.object({
							title: v.string(),
							url: v.string(),
							date: v.string(),
							confidence: v.number(),
							extractedFacts: v.array(v.string()),
						}),
					),
					checks: v.array(
						v.object({
							label: v.string(),
							status: v.union(v.literal('pass'), v.literal('warn')),
							note: v.optional(v.string()),
						}),
					),
				}),
			),
			consolidatedRisks: v.array(
				v.object({
					severity: v.union(
						v.literal('low'),
						v.literal('med'),
						v.literal('high'),
					),
					label: v.string(),
					evidence: v.string(),
				}),
			),
			investmentRecommendation: v.union(
				v.literal('strong_buy'),
				v.literal('buy'),
				v.literal('hold'),
				v.literal('sell'),
				v.literal('strong_sell'),
			),
			recommendationReasoning: v.string(),
		}),
	},
	handler: async (ctx, { companyId, snapshot }) => {
		await ctx.db.insert('multiAgentAnalyses', {
			companyId,
			snapshot,
			createdAt: Date.now(),
		});
		return true;
	},
});

export const startMultiAgentAnalysis = mutation({
	args: { companyId: v.id('founderApplications') },
	handler: async (ctx, { companyId }) => {
		// Create a job record
		const jobId = await ctx.db.insert('analysisJobs', {
			companyId,
			jobType: 'multi_agent',
			status: 'queued',
			progress: 0,
			message: 'Multi-agent analysis job queued',
			createdAt: Date.now(),
			updatedAt: Date.now(),
		});

		await ctx.scheduler.runAfter(
			0,
			internal.multi_agent_analysis.runMultiAgentAnalysis,
			{
				companyId,
				jobId,
			},
		);
		return { started: true, jobId };
	},
});

export const getLatestMultiAgentSnapshot = query({
	args: { companyId: v.id('founderApplications') },
	handler: async (ctx, { companyId }) => {
		const doc = await ctx.db
			.query('multiAgentAnalyses')
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
