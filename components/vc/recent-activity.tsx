'use client';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
	Play,
	Square,
} from 'lucide-react';

interface ActivityItem {
	_id: string;
	agentId: string;
	agentName: string;
	activityType:
		| 'tool_call'
		| 'tool_result'
		| 'agent_start'
		| 'agent_complete'
		| 'agent_error';
	toolName?: string;
	toolInput?: any;
	toolOutput?: any;
	errorMessage?: string;
	executionTimeMs?: number;
	status: 'pending' | 'running' | 'completed' | 'error';
	timestamp: number;
	metadata?: any;
}

interface RecentActivityProps {
	recentActivity: ActivityItem[];
	getToolIcon: (toolName: string) => React.ReactNode;
	getAgentIcon: (agentId: string) => string;
	showAll?: boolean;
}

export function RecentActivity({
	recentActivity,
	getToolIcon,
	getAgentIcon,
	showAll = false,
}: RecentActivityProps) {
	const getActivityIcon = (activityType: string) => {
		switch (activityType) {
			case 'agent_start':
				return <Play className='h-4 w-4 text-blue-600' />;
			case 'agent_complete':
				return <CheckCircle className='h-4 w-4 text-green-600' />;
			case 'agent_error':
				return <XCircle className='h-4 w-4 text-red-600' />;
			case 'tool_call':
				return <Wrench className='h-4 w-4 text-orange-600' />;
			case 'tool_result':
				return <CheckCircle className='h-4 w-4 text-green-600' />;
			default:
				return <Activity className='h-4 w-4 text-gray-600' />;
		}
	};

	const getActivityColor = (activityType: string) => {
		switch (activityType) {
			case 'agent_start':
				return 'bg-blue-100 text-blue-800 border-blue-200';
			case 'agent_complete':
				return 'bg-green-100 text-green-800 border-green-200';
			case 'agent_error':
				return 'bg-red-100 text-red-800 border-red-200';
			case 'tool_call':
				return 'bg-orange-100 text-orange-800 border-orange-200';
			case 'tool_result':
				return 'bg-green-100 text-green-800 border-green-200';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200';
		}
	};

	const getActivityLabel = (activityType: string) => {
		switch (activityType) {
			case 'agent_start':
				return 'Agent Started';
			case 'agent_complete':
				return 'Agent Completed';
			case 'agent_error':
				return 'Agent Error';
			case 'tool_call':
				return 'Tool Call';
			case 'tool_result':
				return 'Tool Result';
			default:
				return activityType;
		}
	};

	const formatToolInput = (input: any) => {
		if (!input) return 'No input';
		if (typeof input === 'string') return input;
		if (typeof input === 'object') {
			return JSON.stringify(input, null, 2);
		}
		return String(input);
	};

	const formatToolOutput = (output: any) => {
		if (!output) return 'No output';
		if (typeof output === 'string') return output;
		if (typeof output === 'object') {
			return JSON.stringify(output, null, 2);
		}
		return String(output);
	};

	const displayActivity = showAll
		? recentActivity
		: recentActivity.slice(0, 10);

	return (
		<Card>
			<CardHeader>
				<CardTitle className='flex items-center gap-2'>
					<Activity className='h-5 w-5' />
					Recent Activity
					{!showAll && recentActivity.length > 10 && (
						<Badge variant='outline' className='text-xs'>
							+{recentActivity.length - 10} more
						</Badge>
					)}
				</CardTitle>
				<CardDescription>
					Real-time feed of agent activities and tool usage
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className='space-y-3'>
					{displayActivity.length === 0 ? (
						<div className='text-sm text-muted-foreground text-center py-4'>
							No recent activity
						</div>
					) : (
						displayActivity.map((activity, index) => (
							<div key={activity._id}>
								<div className='flex items-start gap-3 p-3 rounded-lg border bg-card'>
									<div className='flex-shrink-0 mt-0.5'>
										{getActivityIcon(activity.activityType)}
									</div>
									<div className='flex-1 min-w-0'>
										<div className='flex items-center gap-2 mb-1'>
											<span className='text-lg'>
												{getAgentIcon(activity.agentId)}
											</span>
											<span className='text-sm font-medium'>
												{activity.agentName}
											</span>
											<Badge
												className={`text-xs ${getActivityColor(
													activity.activityType,
												)}`}
												variant='outline'>
												{getActivityLabel(activity.activityType)}
											</Badge>
											{activity.toolName && (
												<div className='flex items-center gap-1 text-xs text-muted-foreground'>
													{getToolIcon(activity.toolName)}
													<span>{activity.toolName}</span>
												</div>
											)}
										</div>

										<div className='text-xs text-muted-foreground mb-2'>
											{new Date(activity.timestamp).toLocaleString()}
										</div>

										{/* Tool-specific details */}
										{activity.activityType === 'tool_call' &&
											activity.toolInput && (
												<div className='text-xs bg-muted p-2 rounded'>
													<div className='font-medium mb-1'>Input:</div>
													<pre className='whitespace-pre-wrap break-words'>
														{formatToolInput(activity.toolInput)}
													</pre>
												</div>
											)}

										{activity.activityType === 'tool_result' &&
											activity.toolOutput && (
												<div className='text-xs bg-muted p-2 rounded'>
													<div className='font-medium mb-1'>Output:</div>
													<pre className='whitespace-pre-wrap break-words'>
														{formatToolOutput(activity.toolOutput)}
													</pre>
												</div>
											)}

										{activity.activityType === 'agent_error' &&
											activity.errorMessage && (
												<div className='text-xs bg-red-50 text-red-700 p-2 rounded'>
													<div className='font-medium mb-1'>Error:</div>
													{activity.errorMessage}
												</div>
											)}

										{activity.executionTimeMs && (
											<div className='text-xs text-muted-foreground mt-2'>
												Execution time: {activity.executionTimeMs}ms
											</div>
										)}
									</div>
								</div>
								{index < displayActivity.length - 1 && (
									<Separator className='my-2' />
								)}
							</div>
						))
					)}
				</div>
			</CardContent>
		</Card>
	);
}
