export type Source = {
	title: string;
	url: string;
	date: string;
	confidence: number; // 0-1
	extractedFacts: string[];
};

export type Metric = {
	key: string;
	label: string;
	value: number;
	unit?: string;
	peerMedian?: number;
	sources: Source[];
	checks: { label: string; status: 'pass' | 'warn'; note?: string }[];
};

export type CompanySnapshot = {
	company: string;
	sector: string;
	stage: string;
	ask: string;
	summary: string;
	lastUpdated: string;
	metrics: Metric[];
	risks: {
		severity: 'low' | 'med' | 'high';
		label: string;
		evidence: string;
	}[];
};

export type CompanyWithId = CompanySnapshot & {
	id: string;
	logo?: string;
	description: string;
};

export const mockCompanies: CompanyWithId[] = [
	{
		id: 'acme-ai',
		company: 'Acme AI',
		sector: 'Developer Tools',
		stage: 'Seed',
		ask: '$1.5M for 15%',
		summary:
			'Self-serve AI agents that automate post-merge QA for web apps. 16 paying customers, strong founder-market fit.',
		description:
			'Leading AI-powered developer tools for automated testing and QA workflows.',
		lastUpdated: '2025-08-30',
		metrics: [
			{
				key: 'mrr',
				label: 'MRR',
				value: 28,
				unit: 'k',
				peerMedian: 22,
				sources: [
					{
						title: 'Stripe Revenue Export (Jul 2025)',
						url: 'https://example.com/stripe-export',
						date: '2025-07-31',
						confidence: 0.92,
						extractedFacts: [
							'Recurring revenue lines sum to $27,846',
							'Net of refunds is $27,331',
						],
					},
					{
						title: 'Founder Update (Aug 2025)',
						url: 'https://example.com/founder-update',
						date: '2025-08-10',
						confidence: 0.7,
						extractedFacts: ['Stated MRR $28k'],
					},
				],
				checks: [
					{ label: 'ARR vs MRR consistency', status: 'pass' },
					{ label: 'Outlier vs peer median', status: 'pass' },
					{ label: 'Data freshness (<60 days)', status: 'pass' },
				],
			},
			{
				key: 'growth',
				label: 'MoM Growth',
				value: 22,
				unit: '%',
				peerMedian: 12,
				sources: [
					{
						title: 'Bank Statements (Q3 snapshots)',
						url: 'https://example.com/bank',
						date: '2025-08-01',
						confidence: 0.8,
						extractedFacts: ['Deposits trend +21.9% month over month'],
					},
				],
				checks: [
					{
						label: 'Seasonality adjusted',
						status: 'warn',
						note: 'July promo drove +4% uplift',
					},
					{ label: 'Variance vs benchmark', status: 'pass' },
				],
			},
			{
				key: 'tam',
				label: 'TAM (Top-down)',
				value: 4.2,
				unit: 'B',
				peerMedian: 3.1,
				sources: [
					{
						title: 'Gartner QA Market 2024',
						url: 'https://example.com/gartner',
						date: '2024-12-15',
						confidence: 0.6,
						extractedFacts: ['Application testing tools CAGR 13%'],
					},
					{
						title: 'Bottom-up model',
						url: 'https://example.com/model',
						date: '2025-08-28',
						confidence: 0.7,
						extractedFacts: ['100k targets x $35/mo -> $42M SAM'],
					},
				],
				checks: [
					{
						label: 'Top-down vs bottom-up parity',
						status: 'warn',
						note: 'Bottom-up more conservative',
					},
				],
			},
		],
		risks: [
			{
				severity: 'med',
				label: 'Churn spikes in SMB cohort',
				evidence: 'Month 2 churn 7.9% vs benchmark 3–5%',
			},
			{
				severity: 'high',
				label: 'Team gap: no FT CTO',
				evidence: 'Product led by contractor, FT hire in pipeline',
			},
		],
	},
	{
		id: 'dataflow-inc',
		company: 'DataFlow Inc',
		sector: 'Analytics',
		stage: 'Series A',
		ask: '$8M for 20%',
		summary:
			'Real-time analytics platform for e-commerce businesses. 200+ customers with 40% YoY growth.',
		description:
			'Enterprise-grade analytics platform powering data-driven decisions for e-commerce leaders.',
		lastUpdated: '2025-08-25',
		metrics: [
			{
				key: 'mrr',
				label: 'MRR',
				value: 85,
				unit: 'k',
				peerMedian: 75,
				sources: [
					{
						title: 'Revenue Dashboard (Aug 2025)',
						url: 'https://example.com/revenue-dash',
						date: '2025-08-15',
						confidence: 0.95,
						extractedFacts: ['Monthly recurring revenue at $84,500'],
					},
				],
				checks: [
					{ label: 'ARR vs MRR consistency', status: 'pass' },
					{ label: 'Data freshness (<30 days)', status: 'pass' },
				],
			},
			{
				key: 'growth',
				label: 'MoM Growth',
				value: 15,
				unit: '%',
				peerMedian: 18,
				sources: [
					{
						title: 'Financial Model',
						url: 'https://example.com/financial-model',
						date: '2025-08-20',
						confidence: 0.8,
						extractedFacts: ['Consistent 15% monthly growth pattern'],
					},
				],
				checks: [
					{ label: 'Seasonality adjusted', status: 'pass' },
					{ label: 'Variance vs benchmark', status: 'pass' },
				],
			},
		],
		risks: [
			{
				severity: 'low',
				label: 'Competitive landscape',
				evidence:
					'Multiple established players but clear differentiation in real-time capabilities',
			},
		],
	},
	{
		id: 'securenet',
		company: 'SecureNet',
		sector: 'Cybersecurity',
		stage: 'Seed',
		ask: '$3M for 18%',
		summary:
			'AI-powered network security for SMBs. Zero-day threat detection with 99.5% accuracy.',
		description:
			'Next-generation cybersecurity platform using AI to detect and prevent advanced threats.',
		lastUpdated: '2025-09-01',
		metrics: [
			{
				key: 'mrr',
				label: 'MRR',
				value: 12,
				unit: 'k',
				peerMedian: 15,
				sources: [
					{
						title: 'Subscription Data',
						url: 'https://example.com/subscription-data',
						date: '2025-08-28',
						confidence: 0.88,
						extractedFacts: ['Monthly subscriptions generating $11,800'],
					},
				],
				checks: [
					{ label: 'ARR vs MRR consistency', status: 'pass' },
					{ label: 'Data freshness (<7 days)', status: 'pass' },
				],
			},
		],
		risks: [
			{
				severity: 'med',
				label: 'Regulatory compliance',
				evidence: 'SOC 2 certification in progress, expected completion Q4',
			},
			{
				severity: 'high',
				label: 'Market timing sensitivity',
				evidence:
					'Cybersecurity spending could be affected by economic downturns',
			},
		],
	},
	{
		id: 'greentech-solutions',
		company: 'GreenTech Solutions',
		sector: 'Clean Energy',
		stage: 'Series B',
		ask: '$12M for 15%',
		summary:
			'Solar panel optimization software using AI to maximize energy output. 50MW under management.',
		description:
			'AI-driven solar optimization platform maximizing renewable energy production worldwide.',
		lastUpdated: '2025-08-28',
		metrics: [
			{
				key: 'mrr',
				label: 'MRR',
				value: 150,
				unit: 'k',
				peerMedian: 120,
				sources: [
					{
						title: 'Contract Revenue',
						url: 'https://example.com/contract-revenue',
						date: '2025-08-25',
						confidence: 0.9,
						extractedFacts: ['Annual contracts worth $1.8M annually'],
					},
				],
				checks: [
					{ label: 'ARR vs MRR consistency', status: 'pass' },
					{ label: 'Outlier vs peer median', status: 'pass' },
				],
			},
			{
				key: 'growth',
				label: 'YoY Growth',
				value: 45,
				unit: '%',
				peerMedian: 35,
				sources: [
					{
						title: 'Business Metrics Report',
						url: 'https://example.com/metrics-report',
						date: '2025-08-20',
						confidence: 0.85,
						extractedFacts: ['45% year-over-year revenue growth'],
					},
				],
				checks: [
					{ label: 'Seasonality adjusted', status: 'pass' },
					{ label: 'Variance vs benchmark', status: 'pass' },
				],
			},
		],
		risks: [
			{
				severity: 'low',
				label: 'Weather dependency',
				evidence:
					'Solar performance optimization actually benefits from variable weather conditions',
			},
		],
	},
];

// For backward compatibility, keep the first company as the default
export const mockSnapshot = mockCompanies[0];

// Utility function to find company by ID
export function getCompanyById(id: string): CompanyWithId | undefined {
	return mockCompanies.find((company) => company.id === id);
}

// Utility function to get all company IDs
export function getAllCompanyIds(): string[] {
	return mockCompanies.map((company) => company.id);
}
