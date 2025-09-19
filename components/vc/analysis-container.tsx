'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id, Doc } from '@/convex/_generated/dataModel';
import Snapshot from '@/components/vc/snapshot';
import Benchmarks from '@/components/vc/benchmarks';
import FrameworksScorecard from '@/components/vc/frameworks-scorecard';
import Risks from '@/components/vc/risks';
import { SourcesEvidence } from '@/components/vc/vc-sources-evidence';
import { ReportPreview } from '@/components/vc/report-preview';
import AgentActivityDashboard from '@/components/vc/agent-activity-dashboard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { useState } from 'react';

// Type definitions using Convex Doc types
type CompanyAnalysis = Doc<'companyAnalyses'>;
type MultiAgentAnalysis = Doc<'multiAgentAnalyses'>;

// Extract types from the multi-agent analysis snapshot
type MultiAgentSnapshot = MultiAgentAnalysis['snapshot'];
type AgentAnalysis = MultiAgentSnapshot['agentAnalyses'][0];
type Risk = AgentAnalysis['risks'][0];
type InvestmentRecommendation = MultiAgentSnapshot['investmentRecommendation'];

export default function AnalysisContainer() {
	const params = useParams<{ id?: string }>();
	const companyId = params?.id ?? undefined;

	// Single agent analysis
	const latest = useQuery(
		api.analysis.getLatestSnapshot,
		companyId ? { companyId: companyId as Id<'founderApplications'> } : 'skip',
	);
	const start = useMutation(api.analysis.startAnalysis);
	const singleAgentJobStatus = useQuery(
		api.analysis.getJobStatus,
		companyId
			? {
					companyId: companyId as Id<'founderApplications'>,
					jobType: 'single_agent',
			  }
			: 'skip',
	);

	// Multi-agent analysis
	const latestMultiAgent = useQuery(
		api.multi_agent_analysis.getLatestMultiAgentSnapshot,
		companyId ? { companyId: companyId as Id<'founderApplications'> } : 'skip',
	);
	const startMultiAgent = useMutation(
		api.multi_agent_analysis.startMultiAgentAnalysis,
	);
	const multiAgentJobStatus = useQuery(
		api.multi_agent_analysis.getJobStatus,
		companyId
			? {
					companyId: companyId as Id<'founderApplications'>,
					jobType: 'multi_agent',
			  }
			: 'skip',
	);

	async function onRun() {
		if (!companyId) return;
		try {
			await start({ companyId: companyId as Id<'founderApplications'> });
		} catch (error) {
			console.error('Failed to start analysis:', error);
		}
	}

	async function onRunMultiAgent() {
		if (!companyId) return;
		try {
			await startMultiAgent({
				companyId: companyId as Id<'founderApplications'>,
			});
		} catch (error) {
			console.error('Failed to start multi-agent analysis:', error);
		}
	}

	// Determine if analyses are running based on job status
	const isSingleAgentRunning =
		(singleAgentJobStatus &&
			['queued', 'running', 'ingesting', 'analyzing'].includes(
				singleAgentJobStatus.status,
			)) ||
		false;
	const isMultiAgentRunning =
		(multiAgentJobStatus &&
			['queued', 'running', 'ingesting', 'analyzing'].includes(
				multiAgentJobStatus.status,
			)) ||
		false;

	const snapshot = latest ? latest.snapshot : undefined;
	const multiAgentSnapshot = latestMultiAgent
		? latestMultiAgent.snapshot
		: undefined;
	const isLoading = latest === undefined && !!companyId;
	const isLoadingMultiAgent = latestMultiAgent === undefined && !!companyId;
	const hasNoData = latest === null;
	const hasNoMultiAgentData = latestMultiAgent === null;

	const getRecommendationColor = (recommendation: InvestmentRecommendation) => {
		switch (recommendation) {
			case 'strong_buy':
				return 'bg-green-100 text-green-800 border-green-200';
			case 'buy':
				return 'bg-green-50 text-green-700 border-green-100';
			case 'hold':
				return 'bg-yellow-50 text-yellow-700 border-yellow-100';
			case 'sell':
				return 'bg-red-50 text-red-700 border-red-100';
			case 'strong_sell':
				return 'bg-red-100 text-red-800 border-red-200';
			default:
				return 'bg-gray-50 text-gray-700 border-gray-100';
		}
	};

	const getRecommendationLabel = (recommendation: InvestmentRecommendation) => {
		switch (recommendation) {
			case 'strong_buy':
				return 'Strong Buy';
			case 'buy':
				return 'Buy';
			case 'hold':
				return 'Hold';
			case 'sell':
				return 'Sell';
			case 'strong_sell':
				return 'Strong Sell';
			default:
				return recommendation;
		}
	};

	const getJobStatusColor = (status?: string) => {
		switch (status) {
			case 'completed':
				return 'bg-green-100 text-green-800 border-green-200';
			case 'failed':
				return 'bg-red-100 text-red-800 border-red-200';
			case 'running':
			case 'ingesting':
			case 'analyzing':
				return 'bg-blue-100 text-blue-800 border-blue-200';
			case 'queued':
				return 'bg-yellow-100 text-yellow-800 border-yellow-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	const getJobStatusLabel = (status?: string) => {
		switch (status) {
			case 'queued':
				return 'Queued';
			case 'running':
				return 'Running';
			case 'ingesting':
				return 'Ingesting Data';
			case 'analyzing':
				return 'Analyzing';
			case 'completed':
				return 'Completed';
			case 'failed':
				return 'Failed';
			default:
				return 'Unknown';
		}
	};

	return (
		<main className='mx-auto w-full max-w-6xl px-6 py-8'>
			<div className='flex items-center justify-between mb-6'>
				<h2 className='text-2xl font-semibold tracking-tight'>
					AI Analyst Report
				</h2>
				<div className='flex gap-2'>
					<Button
						onClick={onRun}
						disabled={!companyId || isSingleAgentRunning}
						variant='outline'>
						{isSingleAgentRunning
							? singleAgentJobStatus?.message || 'Running…'
							: 'Single Agent'}
					</Button>
					<Button
						onClick={onRunMultiAgent}
						disabled={!companyId || isMultiAgentRunning}
						className='bg-blue-600 hover:bg-blue-700'>
						{isMultiAgentRunning
							? multiAgentJobStatus?.message || 'Running Multi-Agent…'
							: 'Multi-Agent Analysis'}
					</Button>
				</div>
			</div>

			{!companyId && (
				<div className='text-sm text-muted-foreground'>
					Select a company to view analysis.
				</div>
			)}

			{companyId && (
				<Tabs defaultValue='multi-agent' className='w-full'>
					<TabsList className='grid w-full grid-cols-3'>
						<TabsTrigger
							value='multi-agent'
							className='flex items-center gap-2'>
							<div className='flex flex-col items-start gap-1'>
								<div className='flex items-center gap-2'>
									Multi-Agent Analysis
									{multiAgentSnapshot && (
										<Badge
											className={getRecommendationColor(
												multiAgentSnapshot.investmentRecommendation,
											)}>
											{getRecommendationLabel(
												multiAgentSnapshot.investmentRecommendation,
											)}
										</Badge>
									)}
									{multiAgentJobStatus && (
										<Badge
											className={getJobStatusColor(multiAgentJobStatus.status)}>
											{getJobStatusLabel(multiAgentJobStatus.status)}
										</Badge>
									)}
								</div>
							</div>
						</TabsTrigger>
						<TabsTrigger
							value='single-agent'
							className='flex items-center gap-2'>
							<div className='flex flex-col items-start gap-1'>
								<div className='flex items-center gap-2'>
									Single Agent Analysis
									{singleAgentJobStatus && (
										<Badge
											className={getJobStatusColor(
												singleAgentJobStatus.status,
											)}>
											{getJobStatusLabel(singleAgentJobStatus.status)}
										</Badge>
									)}
								</div>
								{isSingleAgentRunning && singleAgentJobStatus && (
									<div className='w-full max-w-xs'>
										<p className='text-xs text-muted-foreground mt-1'>
											{singleAgentJobStatus.message}
										</p>
									</div>
								)}
							</div>
						</TabsTrigger>
						<TabsTrigger
							value='agent-activity'
							className='flex items-center gap-2'>
							<div className='flex flex-col items-start gap-1'>
								<div className='flex items-center gap-2'>
									Agent Activity
									{multiAgentJobStatus && (
										<Badge
											className={getJobStatusColor(multiAgentJobStatus.status)}>
											{getJobStatusLabel(multiAgentJobStatus.status)}
										</Badge>
									)}
								</div>
							</div>
						</TabsTrigger>
					</TabsList>

					<TabsContent value='multi-agent' className='mt-6'>
						{isLoadingMultiAgent && (
							<div className='text-sm text-muted-foreground'>
								Loading multi-agent analysis…
							</div>
						)}

						{isMultiAgentRunning && multiAgentJobStatus && (
							<Card className='mb-6'>
								<CardContent className='pt-6'>
									<div className='flex items-center justify-between mb-4'>
										<h3 className='text-lg font-semibold'>
											Analysis in Progress
										</h3>
										<Badge
											className={getJobStatusColor(multiAgentJobStatus.status)}>
											{getJobStatusLabel(multiAgentJobStatus.status)}
										</Badge>
									</div>
									<Progress
										value={multiAgentJobStatus.progress}
										className='mb-2'
									/>
									<p className='text-sm text-muted-foreground'>
										{multiAgentJobStatus.message}
									</p>
								</CardContent>
							</Card>
						)}

						{hasNoMultiAgentData && !isMultiAgentRunning && (
							<div className='rounded-md border p-4 text-sm'>
								No multi-agent analysis found for this company. Click
								"Multi-Agent Analysis" to generate one.
							</div>
						)}

						{multiAgentSnapshot && (
							<>
								{/* Investment Recommendation Card */}
								<Card className='mb-6'>
									<CardHeader>
										<CardTitle className='flex items-center gap-3'>
											Investment Recommendation
											<Badge
												className={getRecommendationColor(
													multiAgentSnapshot.investmentRecommendation,
												)}>
												{getRecommendationLabel(
													multiAgentSnapshot.investmentRecommendation,
												)}
											</Badge>
										</CardTitle>
										<CardDescription>
											Overall Confidence:{' '}
											{Math.round(multiAgentSnapshot.overallConfidence * 100)}%
										</CardDescription>
									</CardHeader>
									<CardContent>
										<p className='text-sm'>
											{multiAgentSnapshot.recommendationReasoning}
										</p>
									</CardContent>
								</Card>

								{/* Overall Summary */}
								<Card className='mb-6'>
									<CardHeader>
										<CardTitle>Overall Analysis Summary</CardTitle>
									</CardHeader>
									<CardContent>
										<p className='text-sm'>
											{multiAgentSnapshot.overallSummary}
										</p>
									</CardContent>
								</Card>

								{/* Individual Agent Analyses */}
								<div className='grid gap-6'>
									{multiAgentSnapshot.agentAnalyses.map(
										(agentAnalysis: AgentAnalysis) => (
											<Card key={agentAnalysis.agentId}>
												<CardHeader>
													<CardTitle className='flex items-center justify-between'>
														{agentAnalysis.agentName}
														<Badge variant='outline'>
															{Math.round(agentAnalysis.confidence * 100)}%
															confidence
														</Badge>
													</CardTitle>
												</CardHeader>
												<CardContent className='space-y-4'>
													<div>
														<h4 className='font-medium mb-2'>Summary</h4>
														<p className='text-sm text-muted-foreground'>
															{agentAnalysis.summary}
														</p>
													</div>

													{agentAnalysis.keyFindings.length > 0 && (
														<div>
															<h4 className='font-medium mb-2'>Key Findings</h4>
															<ul className='text-sm space-y-1'>
																{agentAnalysis.keyFindings.map(
																	(finding: string, index: number) => (
																		<li
																			key={index}
																			className='flex items-start gap-2'>
																			<span className='text-blue-500 mt-1'>
																				•
																			</span>
																			<span>{finding}</span>
																		</li>
																	),
																)}
															</ul>
														</div>
													)}

													{agentAnalysis.recommendations.length > 0 && (
														<div>
															<h4 className='font-medium mb-2'>
																Recommendations
															</h4>
															<ul className='text-sm space-y-1'>
																{agentAnalysis.recommendations.map(
																	(rec: string, index: number) => (
																		<li
																			key={index}
																			className='flex items-start gap-2'>
																			<span className='text-green-500 mt-1'>
																				→
																			</span>
																			<span>{rec}</span>
																		</li>
																	),
																)}
															</ul>
														</div>
													)}

													{agentAnalysis.risks.length > 0 && (
														<div>
															<h4 className='font-medium mb-2'>Risks</h4>
															<div className='space-y-2'>
																{agentAnalysis.risks.map(
																	(risk: Risk, index: number) => (
																		<div
																			key={index}
																			className='flex items-start gap-2 p-2 rounded border'>
																			<Badge
																				variant={
																					risk.severity === 'high'
																						? 'destructive'
																						: risk.severity === 'med'
																						? 'default'
																						: 'secondary'
																				}
																				className='text-xs'>
																				{risk.severity}
																			</Badge>
																			<div className='flex-1'>
																				<p className='text-sm font-medium'>
																					{risk.label}
																				</p>
																				<p className='text-xs text-muted-foreground'>
																					{risk.evidence}
																				</p>
																			</div>
																		</div>
																	),
																)}
															</div>
														</div>
													)}
												</CardContent>
											</Card>
										),
									)}
								</div>

								<Separator className='my-8' />

								{/* Consolidated Metrics and Risks */}
								<section id='consolidated-metrics' className='scroll-mt-24'>
									<Benchmarks
										company={{
											...multiAgentSnapshot,
											summary: multiAgentSnapshot.overallSummary,
											metrics: multiAgentSnapshot.consolidatedMetrics,
											risks: multiAgentSnapshot.consolidatedRisks,
										}}
									/>
								</section>
								<Separator className='my-8' />
								<section id='consolidated-risks' className='scroll-mt-24'>
									<Risks
										company={{
											...multiAgentSnapshot,
											summary: multiAgentSnapshot.overallSummary,
											metrics: multiAgentSnapshot.consolidatedMetrics,
											risks: multiAgentSnapshot.consolidatedRisks,
										}}
									/>
								</section>
								<Separator className='my-8' />
								<section id='sources' className='scroll-mt-24'>
									<SourcesEvidence
										company={{
											...multiAgentSnapshot,
											summary: multiAgentSnapshot.overallSummary,
											metrics: multiAgentSnapshot.consolidatedMetrics,
											risks: multiAgentSnapshot.consolidatedRisks,
										}}
									/>
								</section>
							</>
						)}
					</TabsContent>

					<TabsContent value='single-agent' className='mt-6'>
						{isLoading && (
							<div className='text-sm text-muted-foreground'>
								Loading single agent analysis…
							</div>
						)}

						{isSingleAgentRunning && singleAgentJobStatus && (
							<Card className='mb-6'>
								<CardContent className='pt-6'>
									<div className='flex items-center justify-between mb-4'>
										<h3 className='text-lg font-semibold'>
											Analysis in Progress
										</h3>
										<Badge
											className={getJobStatusColor(
												singleAgentJobStatus.status,
											)}>
											{getJobStatusLabel(singleAgentJobStatus.status)}
										</Badge>
									</div>
									<Progress
										value={singleAgentJobStatus.progress}
										className='mb-2'
									/>
									<p className='text-sm text-muted-foreground'>
										{singleAgentJobStatus.message}
									</p>
								</CardContent>
							</Card>
						)}

						{hasNoData && !isSingleAgentRunning && (
							<div className='rounded-md border p-4 text-sm'>
								No single agent analysis found for this company. Click "Single
								Agent" to generate one.
							</div>
						)}

						{snapshot && (
							<>
								<section id='snapshot' className='scroll-mt-24'>
									<Snapshot company={snapshot} />
								</section>
								<Separator className='my-8' />
								<section id='benchmarks' className='scroll-mt-24'>
									<Benchmarks company={snapshot} />
								</section>
								<Separator className='my-8' />
								<section id='frameworks' className='scroll-mt-24'>
									<FrameworksScorecard company={snapshot} />
								</section>
								<Separator className='my-8' />
								<section id='risks' className='scroll-mt-24'>
									<Risks company={snapshot} />
								</section>
								<Separator className='my-8' />
								<section id='sources' className='scroll-mt-24'>
									<SourcesEvidence company={snapshot} />
								</section>
								<Separator className='my-8' />
								<section id='report' className='scroll-mt-24'>
									<ReportPreview company={snapshot} />
								</section>
							</>
						)}
					</TabsContent>

					<TabsContent value='agent-activity' className='mt-6'>
						{multiAgentJobStatus ? (
							<AgentActivityDashboard
								companyId={companyId as Id<'founderApplications'>}
								jobId={multiAgentJobStatus._id}
							/>
						) : (
							<div className='text-sm text-muted-foreground'>
								No multi-agent analysis job found. Start a multi-agent analysis
								to view agent activity.
							</div>
						)}
					</TabsContent>
				</Tabs>
			)}
		</main>
	);
}
