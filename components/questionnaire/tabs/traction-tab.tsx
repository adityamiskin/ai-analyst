'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import type { UseFormReturn } from 'react-hook-form';
import type { FileRef } from './tabs/file-picker';
import { FilePicker } from './tabs/file-picker';
import { FileList } from './tabs/file-list';

export type TractionTabForm = UseFormReturn<any>;

export function TractionTab({ form }: { form: TractionTabForm }) {
	return (
		<>
			<p className='text-sm text-muted-foreground'>
				Share measurable progress and attach data if helpful.
			</p>
			<div className='grid gap-4 md:grid-cols-2'>
				<FormField
					control={form.control}
					name='traction.isLaunched'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Have you launched?</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder='Select status' />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value='yes'>Yes</SelectItem>
									<SelectItem value='no'>No</SelectItem>
									<SelectItem value='beta'>Beta/Limited launch</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='traction.launchDate'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Launch date (if launched)</FormLabel>
							<FormControl>
								<Input placeholder='January 2024' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='traction.mrr'
					render={({ field }) => (
						<FormItem>
							<FormLabel>MRR (USD)</FormLabel>
							<FormControl>
								<Input placeholder='e.g. 12000' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='traction.growth'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Growth (% MoM)</FormLabel>
							<FormControl>
								<Input placeholder='e.g. 18' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='traction.activeUsersCount'
					render={({ field }) => (
						<FormItem className='md:col-span-2'>
							<FormLabel>Number of active users</FormLabel>
							<FormControl>
								<Input type='number' placeholder='e.g. 1500' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>

			<FormField
				control={form.control}
				name='traction.metricsCsv'
				render={({ field }) => (
					<FormItem>
						<FormLabel>Upload metrics CSV (optional)</FormLabel>
						<FormControl>
							<FilePicker
								id='metrics'
								label=''
								accept='.csv'
								value={field.value as FileRef[]}
								onChange={field.onChange}
							/>
						</FormControl>
						<FileList files={field.value as FileRef[]} />
						<FormMessage />
					</FormItem>
				)}
			/>

			<FormField
				control={form.control}
				name='traction.pilots'
				render={({ field }) => (
					<FormItem>
						<FormLabel>Pilots / LOIs</FormLabel>
						<FormControl>
							<Textarea
								className='min-h-20'
								placeholder='List any pilot programs, letters of intent, or committed customers you have.'
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
			<FormField
				control={form.control}
				name='traction.kpis'
				render={({ field }) => (
					<FormItem>
						<FormLabel>Key KPIs tracked</FormLabel>
						<FormControl>
							<Textarea
								className='min-h-20'
								placeholder='What metrics do you track regularly? Revenue, user engagement, retention, conversion rates, etc.'
								{...field}
							/>
						</FormControl>
						<FormMessage />
					</FormItem>
				)}
			/>
		</>
	);
}
