import { components } from './_generated/api';
import { Agent, createTool, stepCountIs } from '@convex-dev/agent';
import { RAG } from '@convex-dev/rag';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import {
	COMPANY_ANALYSIS_AGENT_INSTRUCTIONS,
	FINANCE_AGENT_INSTRUCTIONS,
	EVALUATION_AGENT_INSTRUCTIONS,
	COMPETITOR_AGENT_INSTRUCTIONS,
	MARKET_AGENT_INSTRUCTIONS,
	TECHNICAL_AGENT_INSTRUCTIONS,
	ORCHESTRATION_AGENT_INSTRUCTIONS,
} from './prompt';

type CompanyRagFilters = {
	domain: string;
	contentType: string;
};

export const companyRag = new RAG<CompanyRagFilters>(components.rag, {
	filterNames: ['domain', 'contentType'],
	textEmbeddingModel: openai.embedding('text-embedding-3-small'),
	embeddingDimension: 1536,
});

// Create a factory function to create domain context tools with companyId injected
const createDomainContextTool = (companyId: string) =>
	createTool({
		description:
			'Retrieve domain-specific context from the company knowledge base. Use this to get targeted information relevant to your analysis domain.',
		args: z.object({
			domain: z
				.enum(['finance', 'technical', 'market', 'evaluation', 'competitor'])
				.describe('The domain to search for specific analysis data'),
			query: z
				.string()
				.describe(
					'Specific search query for the domain (e.g., "revenue metrics", "technology stack", "market size")',
				),
			limit: z
				.number()
				.default(15)
				.describe('Maximum number of results to retrieve'),
		}),
		handler: async (ctx, args) => {
			try {
				const { text: contextText } = await companyRag.search(ctx, {
					namespace: companyId,
					query: `${args.domain}: ${args.query}`,
					limit: args.limit,
					chunkContext: { before: 1, after: 1 },
					filters: [
						{ name: 'domain', value: args.domain },
						{ name: 'contentType', value: 'founderApplication' },
					],
				});

				return {
					success: true,
					context: contextText,
					domain: args.domain,
					query: args.query,
					companyId: companyId,
					sourceCount: contextText.split('\n---\n').length,
				};
			} catch (error) {
				console.warn(`Failed to retrieve ${args.domain} context:`, error);
				return {
					success: false,
					context: '',
					domain: args.domain,
					query: args.query,
					companyId: companyId,
					error: error instanceof Error ? error.message : 'Unknown error',
				};
			}
		},
	});

// Factory functions to create agents with company-specific tools
export const createCompanyAnalysisAgent = (companyId: string) =>
	new Agent(components.agent, {
		name: 'CompanyAnalysisAgent',
		instructions: COMPANY_ANALYSIS_AGENT_INSTRUCTIONS,
		languageModel: openai.responses('gpt-5-mini'),
		stopWhen: stepCountIs(5),
		tools: {
			getDomainContext: createDomainContextTool(companyId),
		},
	});

export const createFinanceAgent = (companyId: string) =>
	new Agent(components.agent, {
		name: 'FinanceAgent',
		instructions: FINANCE_AGENT_INSTRUCTIONS,
		languageModel: openai.responses('gpt-5-mini'),
		stopWhen: stepCountIs(5),
		tools: {
			web_search: openai.tools.webSearch({}),
			getDomainContext: createDomainContextTool(companyId),
		},
	});

export const createEvaluationAgent = (companyId: string) =>
	new Agent(components.agent, {
		name: 'EvaluationAgent',
		instructions: EVALUATION_AGENT_INSTRUCTIONS,
		languageModel: openai.responses('gpt-5-mini'),
		stopWhen: stepCountIs(5),
		tools: {
			web_search: openai.tools.webSearch({}),
			getDomainContext: createDomainContextTool(companyId),
		},
	});

export const createCompetitorAgent = (companyId: string) =>
	new Agent(components.agent, {
		name: 'CompetitorAgent',
		instructions: COMPETITOR_AGENT_INSTRUCTIONS,
		languageModel: openai.responses('gpt-5-mini'),
		stopWhen: stepCountIs(5),
		tools: {
			web_search: openai.tools.webSearch({}),
			getDomainContext: createDomainContextTool(companyId),
		},
	});

export const createMarketAgent = (companyId: string) =>
	new Agent(components.agent, {
		name: 'MarketAgent',
		instructions: MARKET_AGENT_INSTRUCTIONS,
		languageModel: openai.responses('gpt-5-mini'),
		stopWhen: stepCountIs(5),
		tools: {
			web_search: openai.tools.webSearch({}),
			getDomainContext: createDomainContextTool(companyId),
		},
	});

export const createTechnicalAgent = (companyId: string) =>
	new Agent(components.agent, {
		name: 'TechnicalAgent',
		instructions: TECHNICAL_AGENT_INSTRUCTIONS,
		languageModel: openai.responses('gpt-5-mini'),
		stopWhen: stepCountIs(5),
		tools: {
			web_search: openai.tools.webSearch({}),
			getDomainContext: createDomainContextTool(companyId),
		},
	});

export const createOrchestrationAgent = (companyId: string) =>
	new Agent(components.agent, {
		name: 'OrchestrationAgent',
		instructions: ORCHESTRATION_AGENT_INSTRUCTIONS,
		languageModel: openai.responses('gpt-5-mini'),
		stopWhen: stepCountIs(2),
		tools: {
			web_search: openai.tools.webSearch({}),
			getDomainContext: createDomainContextTool(companyId),
		},
	});

// Keep the old exports for backward compatibility (they won't work with the new tool structure)
export const companyAnalysisAgent = createCompanyAnalysisAgent('legacy');
export const financeAgent = createFinanceAgent('legacy');
export const evaluationAgent = createEvaluationAgent('legacy');
export const competitorAgent = createCompetitorAgent('legacy');
export const marketAgent = createMarketAgent('legacy');
export const technicalAgent = createTechnicalAgent('legacy');
export const orchestrationAgent = createOrchestrationAgent('legacy');
