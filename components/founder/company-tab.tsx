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
import type { FileRef } from './file-picker';
import { FilePicker } from './file-picker';
import { FileList } from './file-list';

export type CompanyTabForm = UseFormReturn<any>;

export function CompanyTab({ form }: { form: CompanyTabForm }) {
	return (
		<>
			<p className='text-sm text-muted-foreground'>
				Basics and your one-liner.
			</p>
			<div className='grid gap-4 md:grid-cols-2'>
				<FormField
					control={form.control}
					name='company.name'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Company name *</FormLabel>
							<FormControl>
								<Input placeholder='Acme Inc.' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='company.website'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Website *</FormLabel>
							<FormControl>
								<Input placeholder='https://acme.com' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='company.location'
					render={({ field }) => (
						<FormItem>
							<FormLabel>HQ Location *</FormLabel>
							<FormControl>
								<Input placeholder='San Francisco, CA' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='company.stage'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Stage *</FormLabel>
							<Select onValueChange={field.onChange} defaultValue={field.value}>
								<FormControl>
									<SelectTrigger>
										<SelectValue placeholder='Choose stage' />
									</SelectTrigger>
								</FormControl>
								<SelectContent>
									<SelectItem value='preseed'>Pre-seed</SelectItem>
									<SelectItem value='seed'>Seed</SelectItem>
									<SelectItem value='series-a'>Series A</SelectItem>
									<SelectItem value='series-b-plus'>Series B+</SelectItem>
								</SelectContent>
							</Select>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='company.oneLiner'
					render={({ field }) => (
						<FormItem className='md:col-span-2'>
							<FormLabel>One-liner *</FormLabel>
							<FormControl>
								<Input
									placeholder='We help small businesses automate their accounting with AI'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='company.whatDoYouDo'
					render={({ field }) => (
						<FormItem className='md:col-span-2'>
							<FormLabel>What do you do? *</FormLabel>
							<FormControl>
								<Textarea
									className='min-h-28'
									placeholder='Describe your product, how it works, and the problem it solves. Be specific about your solution and target market.'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='company.whyNow'
					render={({ field }) => (
						<FormItem className='md:col-span-2'>
							<FormLabel>Why now? *</FormLabel>
							<FormControl>
								<Textarea
									className='min-h-24'
									placeholder='What has changed recently that makes this the right time for your solution? Market shifts, new technology, regulatory changes, etc.'
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
		</>
	);
}
