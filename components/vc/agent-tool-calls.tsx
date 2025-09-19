'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import {
	Tool,
	ToolHeader,
	ToolContent,
	ToolInput,
	ToolOutput,
} from '@/components/ai-elements/tool';
import { Badge } from '@/components/ui/badge';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
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
import { useState } from 'react';

interface AgentToolCallsProps {
	companyId: Id<'founderApplications'>;
	jobId: Id<'analysisJobs'>;
	agentId: string;
}

export function AgentToolCalls({
	companyId,
	jobId,
	agentId,
}: AgentToolCallsProps) {
	const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());

	const toolCalls = useQuery(api.agent_activity.getAgentToolCalls, {
		companyId,
		jobId,
		agentId,
	});

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

	const getToolStatus = (toolCall: any) => {
		if (toolCall.result) {
			return toolCall.result.status === 'error'
				? 'output-error'
				: 'output-available';
		}
		return 'input-available';
	};

	const getToolStatusIcon = (toolCall: any) => {
		if (toolCall.result) {
			return toolCall.result.status === 'error' ? (
				<XCircle className='h-4 w-4 text-red-600' />
			) : (
				<CheckCircle className='h-4 w-4 text-green-600' />
			);
		}
		return <Clock className='h-4 w-4 text-blue-600 animate-pulse' />;
	};

	const getToolStatusLabel = (toolCall: any) => {
		if (toolCall.result) {
			return toolCall.result.status === 'error' ? 'Error' : 'Completed';
		}
		return 'Running';
	};

	const toggleToolExpansion = (toolCallId: string) => {
		const newExpanded = new Set(expandedTools);
		if (newExpanded.has(toolCallId)) {
			newExpanded.delete(toolCallId);
		} else {
			newExpanded.add(toolCallId);
		}
		setExpandedTools(newExpanded);
	};

	if (!toolCalls) {
		return (
			<div className='text-sm text-muted-foreground'>Loading tool calls...</div>
		);
	}

	if (toolCalls.length === 0) {
		return (
			<div className='text-sm text-muted-foreground'>
				No tool calls yet for this agent.
			</div>
		);
	}

	return (
		<div className='space-y-3'>
			<div className='flex items-center justify-between'>
				<h4 className='text-sm font-medium'>Tool Calls ({toolCalls.length})</h4>
				<Badge variant='outline' className='text-xs'>
					{toolCalls.filter((tc) => tc.result).length} completed
				</Badge>
			</div>

			<div className='space-y-2'>
				{toolCalls.map((toolCall, index) => {
					const toolCallId = toolCall._id;
					const isExpanded = expandedTools.has(toolCallId);
					const status = getToolStatus(toolCall);

					return (
						<Tool
							key={toolCallId}
							open={isExpanded}
							onOpenChange={() => toggleToolExpansion(toolCallId)}>
							<ToolHeader
								type={toolCall.toolName || 'Unknown Tool'}
								state={status as any}
							/>
							<ToolContent>
								<div className='space-y-4'>
									{/* Tool Input */}
									<ToolInput input={toolCall.toolInput || {}} />

									{/* Tool Output */}
									{toolCall.result && (
										<ToolOutput
											output={
												toolCall.result.toolOutput ||
												toolCall.result.errorMessage
											}
											errorText={
												toolCall.result.status === 'error'
													? toolCall.result.errorMessage
													: undefined
											}
										/>
									)}

									{/* Execution Details */}
									<div className='grid grid-cols-2 gap-4 text-xs text-muted-foreground'>
										<div>
											<span className='font-medium'>Started:</span>{' '}
											{new Date(toolCall.timestamp).toLocaleTimeString()}
										</div>
										{toolCall.executionTimeMs && (
											<div>
												<span className='font-medium'>Duration:</span>{' '}
												{toolCall.executionTimeMs}ms
											</div>
										)}
									</div>

									{/* Tool Metadata */}
									{toolCall.metadata && (
										<div className='text-xs text-muted-foreground'>
											<Separator className='my-2' />
											<div className='space-y-1'>
												<div>
													<span className='font-medium'>Message ID:</span>{' '}
													{toolCall.metadata.messageId}
												</div>
												{toolCall.metadata.toolCallId && (
													<div>
														<span className='font-medium'>Tool Call ID:</span>{' '}
														{toolCall.metadata.toolCallId}
													</div>
												)}
											</div>
										</div>
									)}
								</div>
							</ToolContent>
						</Tool>
					);
				})}
			</div>
		</div>
	);
}
