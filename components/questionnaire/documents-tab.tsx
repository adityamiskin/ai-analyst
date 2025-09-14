'use client';

import * as React from 'react';
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

export type DocumentsTabForm = UseFormReturn<any>;

export function DocumentsTab({ form }: { form: DocumentsTabForm }) {
	return (
		<>
			<p className='text-sm text-muted-foreground'>
				Upload your key documents first. These help provide context for the rest
				of your application.
			</p>
			<div className='grid gap-6'>
				<FormField
					control={form.control}
					name='documents.financialModel'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Financial model (XLSX/CSV/PDF)</FormLabel>
							<FormControl>
								<FilePicker
									id='fin'
									label=''
									accept='.xlsx,.csv,.pdf'
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
					name='documents.capTable'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Cap table (XLSX/CSV/PDF)</FormLabel>
							<FormControl>
								<FilePicker
									id='cap'
									label=''
									accept='.xlsx,.csv,.pdf'
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
					name='documents.incorporation'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Incorporation docs (PDF)</FormLabel>
							<FormControl>
								<FilePicker
									id='inc'
									label=''
									accept='.pdf'
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
					name='documents.other'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Other supporting files</FormLabel>
							<FormControl>
								<FilePicker
									id='other'
									label=''
									value={field.value as FileRef[]}
									onChange={field.onChange}
								/>
							</FormControl>
							<FileList files={field.value as FileRef[]} />
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
		</>
	);
}
