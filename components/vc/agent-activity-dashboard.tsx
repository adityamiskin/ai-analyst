'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
	Activity,
	Clock,
	CheckCircle,
	XCircle,
	AlertCircle,
	Wrench,
	Search,
	Code,
	Database,
	Globe,
} from 'lucide-react';
import { AgentToolCalls } from './agent-tool-calls';
import { AgentStatusGrid } from './agent-status-grid';
import { RecentActivity } from './recent-activity';

interface AgentActivityDashboardProps {
	companyId: Id<'founderApplications'>;
	jobId: Id<'analysisJobs'>;
}

export default function AgentActivityDashboard({
	companyId,
	jobId,
}: AgentActivityDashboardProps) {
	// Query agent statuses
	const agentsStatus = useQuery(api.agent_activity.getAgentsStatus, {
		companyId,
		jobId,
	});

	// Query recent activity
	const recentActivity = useQuery(api.agent_activity.getRecentActivity, {
		companyId,
		jobId,
		limit: 20,
	});

	const getStatusIcon = (status: string) => {
		switch (status) {
			case 'completed':
				return <CheckCircle className='h-4 w-4 text-green-600' />;
			case 'error':
				return <XCircle className='h-4 w-4 text-red-600' />;
			case 'running':
				return <Activity className='h-4 w-4 text-blue-600 animate-pulse' />;
			case 'pending':
				return <Clock className='h-4 w-4 text-yellow-600' />;
			default:
				return <AlertCircle className='h-4 w-4 text-gray-600' />;
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'completed':
				return 'bg-green-100 text-green-800 border-green-200';
			case 'error':
				return 'bg-red-100 text-red-800 border-red-200';
			case 'running':
				return 'bg-blue-100 text-blue-800 border-blue-200';
			case 'pending':
				return 'bg-yellow-100 text-yellow-800 border-yellow-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	const getToolIcon = (toolName: string) => {
		switch (toolName) {
			case 'web_search':
				return <Globe className='h-4 w-4' />;
			case 'code_interpreter':
				return <Code className='h-4 w-4' />;
			case 'getDomainContext':
				return <Database className='h-4 w-4' />;
			default:
				return <Wrench className='h-4 w-4' />;
		}
	};

	const getAgentIcon = (agentId: string) => {
		switch (agentId) {
			case 'finance':
				return '💰';
			case 'evaluation':
				return '📊';
			case 'competitor':
				return '🏆';
			case 'market':
				return '📈';
			case 'technical':
				return '⚙️';
			case 'orchestration':
				return '🎯';
			default:
				return '🤖';
		}
	};

	if (!agentsStatus || !recentActivity) {
		return (
			<Card>
				<CardContent className='pt-6'>
					<div className='text-sm text-muted-foreground'>
						Loading agent activity...
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div>
					<h3 className='text-lg font-semibold'>Agent Activity Dashboard</h3>
					<p className='text-sm text-muted-foreground'>
						Monitor real-time agent activity and tool usage
					</p>
				</div>
				<Badge variant='outline' className='flex items-center gap-1'>
					<Activity className='h-3 w-3' />
					Live
				</Badge>
			</div>

			{/* Agent Status Overview */}
			<AgentStatusGrid agentsStatus={agentsStatus} />

			{/* Main Content Tabs */}
			<Tabs defaultValue='overview' className='w-full'>
				<TabsList className='grid w-full grid-cols-3'>
					<TabsTrigger value='overview'>Overview</TabsTrigger>
					<TabsTrigger value='agents'>Individual Agents</TabsTrigger>
					<TabsTrigger value='activity'>Recent Activity</TabsTrigger>
				</TabsList>

				<TabsContent value='overview' className='mt-6'>
					<div className='grid gap-6'>
						{/* Summary Stats */}
						<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
							<Card>
								<CardContent className='pt-6'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-muted-foreground'>
												Total Agents
											</p>
											<p className='text-2xl font-bold'>
												{agentsStatus.length}
											</p>
										</div>
										<Activity className='h-8 w-8 text-muted-foreground' />
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className='pt-6'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-muted-foreground'>
												Completed
											</p>
											<p className='text-2xl font-bold text-green-600'>
												{
													agentsStatus.filter((a) => a.status === 'completed')
														.length
												}
											</p>
										</div>
										<CheckCircle className='h-8 w-8 text-green-600' />
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className='pt-6'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-muted-foreground'>
												Running
											</p>
											<p className='text-2xl font-bold text-blue-600'>
												{
													agentsStatus.filter((a) => a.status === 'running')
														.length
												}
											</p>
										</div>
										<Activity className='h-8 w-8 text-blue-600' />
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className='pt-6'>
									<div className='flex items-center justify-between'>
										<div>
											<p className='text-sm font-medium text-muted-foreground'>
												Errors
											</p>
											<p className='text-2xl font-bold text-red-600'>
												{
													agentsStatus.filter((a) => a.status === 'error')
														.length
												}
											</p>
										</div>
										<XCircle className='h-8 w-8 text-red-600' />
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Recent Activity Summary */}
						<RecentActivity
							recentActivity={recentActivity}
							getToolIcon={getToolIcon}
							getAgentIcon={getAgentIcon}
						/>
					</div>
				</TabsContent>

				<TabsContent value='agents' className='mt-6'>
					<div className='space-y-4'>
						{agentsStatus.map((agent) => (
							<Card key={agent.agentId}>
								<CardHeader>
									<div className='flex items-center justify-between'>
										<div className='flex items-center gap-3'>
											<span className='text-2xl'>
												{getAgentIcon(agent.agentId)}
											</span>
											<div>
												<CardTitle className='text-lg'>
													{agent.agentName}
												</CardTitle>
												<CardDescription>
													{agent.toolCalls} tool calls • {agent.toolResults}{' '}
													results
													{agent.errors > 0 && ` • ${agent.errors} errors`}
												</CardDescription>
											</div>
										</div>
										<div className='flex items-center gap-2'>
											{getStatusIcon(agent.status)}
											<Badge className={getStatusColor(agent.status)}>
												{agent.status}
											</Badge>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<AgentToolCalls
										companyId={companyId}
										jobId={jobId}
										agentId={agent.agentId}
									/>
								</CardContent>
							</Card>
						))}
					</div>
				</TabsContent>

				<TabsContent value='activity' className='mt-6'>
					<RecentActivity
						recentActivity={recentActivity}
						getToolIcon={getToolIcon}
						getAgentIcon={getAgentIcon}
						showAll={true}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
