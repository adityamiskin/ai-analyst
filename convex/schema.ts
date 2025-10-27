import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const fileRef = v.object({
	name: v.string(),
	size: v.number(),
	storageId: v.optional(v.id('_storage')),
});

const founder = v.object({
	name: v.string(),
	email: v.string(),
	designation: v.string(),
});

// Analysis snapshot validators
const source = v.object({
	title: v.string(),
	url: v.string(),
	date: v.string(),
	confidence: v.number(), // 0-1
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

// Multi-agent analysis structures
const agentAnalysis = v.object({
	agentId: v.string(), // 'finance', 'evaluation', 'competitor', 'market', 'technical'
	agentName: v.string(),
	summary: v.string(),
	confidence: v.number(), // 0-1
	keyFindings: v.array(v.string()),
	metrics: v.array(metric),
	risks: v.array(risk),
	sources: v.array(source),
	recommendations: v.array(v.string()),
	lastUpdated: v.string(),
});

const multiAgentSnapshot = v.object({
	company: v.string(),
	sector: v.string(),
	stage: v.string(),
	ask: v.string(),
	overallSummary: v.string(),
	overallConfidence: v.number(), // 0-1
	lastUpdated: v.string(),
	agentAnalyses: v.array(agentAnalysis),
	consolidatedMetrics: v.array(metric),
	consolidatedRisks: v.array(risk),
	investmentRecommendation: v.union(
		v.literal('strong_buy'),
		v.literal('buy'),
		v.literal('hold'),
		v.literal('sell'),
		v.literal('strong_sell'),
	),
	recommendationReasoning: v.string(),
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
		}),
		documents: v.object({
			pitchDeck: v.optional(v.array(fileRef)),
			other: v.optional(v.array(fileRef)),
		}),
		primaryEmail: v.string(),
		createdAt: v.number(),
		updatedAt: v.number(),
		pinned: v.optional(v.boolean()),
	})
		.index('by_primary_email', ['primaryEmail'])
		.index('by_primary_email_createdAt', ['primaryEmail', 'createdAt']),

	multiAgentAnalyses: defineTable({
		companyId: v.id('founderApplications'),
		snapshot: multiAgentSnapshot,
		createdAt: v.number(),
	}).index('by_companyId_createdAt', ['companyId', 'createdAt']),

	// Table to track analysis job status and progress
	analysisJobs: defineTable({
		companyId: v.id('founderApplications'),
		jobType: v.literal('multi_agent'),
		status: v.union(
			v.literal('queued'),
			v.literal('running'),
			v.literal('ingesting'),
			v.literal('analyzing'),
			v.literal('completed'),
			v.literal('failed'),
		),
		progress: v.number(), // 0-100
		message: v.string(),
		createdAt: v.number(),
		updatedAt: v.number(),
		completedAt: v.optional(v.number()),
		error: v.optional(v.string()),
	})
		.index('by_companyId_jobType', ['companyId', 'jobType'])
		.index('by_companyId_createdAt', ['companyId', 'createdAt'])
		.index('by_status_createdAt', ['status', 'createdAt']),

	// Table to track agent activity and tool calls
	agentActivity: defineTable({
		companyId: v.id('founderApplications'),
		jobId: v.id('analysisJobs'),
		agentId: v.string(), // 'finance', 'evaluation', 'competitor', 'market', 'technical', 'orchestration'
		agentName: v.string(),
		threadId: v.string(),
		activityType: v.union(
			v.literal('tool_call'),
			v.literal('tool_result'),
			v.literal('agent_start'),
			v.literal('agent_complete'),
			v.literal('agent_error'),
		),
		toolName: v.optional(v.string()),
		toolInput: v.optional(v.any()),
		toolOutput: v.optional(v.any()),
		errorMessage: v.optional(v.string()),
		executionTimeMs: v.optional(v.number()),
		status: v.union(
			v.literal('pending'),
			v.literal('running'),
			v.literal('completed'),
			v.literal('error'),
		),
		timestamp: v.number(),
		metadata: v.optional(v.any()),
	})
		.index('by_companyId_jobId', ['companyId', 'jobId'])
		.index('by_agentId_timestamp', ['agentId', 'timestamp'])
		.index('by_companyId_agentId', ['companyId', 'agentId'])
		.index('by_jobId_activityType', ['jobId', 'activityType']),

	// Table to store agent messages for tool call extraction
	agentMessages: defineTable({
		companyId: v.id('founderApplications'),
		jobId: v.id('analysisJobs'),
		agentId: v.string(),
		agentName: v.string(),
		threadId: v.string(),
		messageId: v.string(),
		role: v.string(), // 'assistant', 'tool', 'user', 'system'
		content: v.any(), // Raw message content
		timestamp: v.number(),
		metadata: v.optional(v.any()),
	})
		.index('by_companyId_jobId', ['companyId', 'jobId'])
		.index('by_agentId_timestamp', ['agentId', 'timestamp'])
		.index('by_threadId_timestamp', ['threadId', 'timestamp']),

	// Table to store cached news with TTL
	cachedNews: defineTable({
		newsItems: v.array(
			v.object({
				title: v.string(),
				source: v.optional(v.string()),
				date: v.string(),
				url: v.optional(v.string()),
				summary: v.optional(v.string()),
			}),
		),
		cachedAt: v.number(), // Timestamp when news was cached
		expiresAt: v.number(), // Timestamp when cache should expire (cachedAt + 24 hours)
	}).index('by_expiresAt', ['expiresAt']),
});
