'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import type { UseFormReturn } from 'react-hook-form';
import { Trash2 } from 'lucide-react';

export type TeamTabForm = UseFormReturn<any>;

export function TeamTab({
	form,
	addFounder,
	updateFounder,
	removeFounder,
}: {
	form: TeamTabForm;
	addFounder: () => void;
	updateFounder: (
		index: number,
		field: 'name' | 'email' | 'designation',
		value: string,
	) => void;
	removeFounder: (index: number) => void;
}) {
	return (
		<>
			<p className='text-sm text-muted-foreground'>
				Who's building this and how you work together.
			</p>

			<div className='space-y-4'>
				<div className='flex items-center justify-between'>
					<Label className='text-base font-medium'>Founders</Label>
					<Button
						type='button'
						variant='outline'
						size='sm'
						onClick={addFounder}>
						Add a Founder
					</Button>
				</div>

				{form.watch('team.founders').length === 0 ? (
					<p className='text-sm text-muted-foreground'>
						No founders added yet. Click "Add a Founder" to get started.
					</p>
				) : (
					<div className='space-y-3'>
						{form.watch('team.founders').map((_: unknown, index: number) => (
							<div key={index} className='grid gap-3 p-4 border rounded-lg'>
								<div className='flex items-center justify-between'>
									<h4 className='font-medium'>Founder {index + 1}</h4>
									<Button
										type='button'
										variant='ghost'
										size='sm'
										onClick={() => removeFounder(index)}
										className='h-8 w-8 p-0'>
										<Trash2 className='h-4 w-4' />
									</Button>
								</div>
								<div className='grid gap-3 md:grid-cols-3'>
									<FormField
										control={form.control}
										name={`team.founders.${index}.name`}
										render={({ field }) => (
											<FormItem>
												<FormLabel>Name</FormLabel>
												<FormControl>
													<Input placeholder='Jane Doe' {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name={`team.founders.${index}.email`}
										render={({ field }) => (
											<FormItem>
												<FormLabel>Email</FormLabel>
												<FormControl>
													<Input
														type='email'
														placeholder='jane@company.com'
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name={`team.founders.${index}.designation`}
										render={({ field }) => (
											<FormItem>
												<FormLabel>Designation</FormLabel>
												<FormControl>
													<Input placeholder='CEO' {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			<div className='grid gap-4 md:grid-cols-2'>
				<FormField
					control={form.control}
					name='team.isFullTime'
					render={({ field }) => (
						<FormItem className='flex items-center gap-2 space-y-0'>
							<FormControl>
								<Checkbox
									id='fulltime'
									checked={field.value}
									onCheckedChange={field.onChange}
								/>
							</FormControl>
							<FormLabel htmlFor='fulltime'>
								All founders are full-time
							</FormLabel>
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='team.howLongWorked'
					render={({ field }) => (
						<FormItem>
							<FormLabel>How long have you worked together?</FormLabel>
							<FormControl>
								<Input placeholder='2 years, 6 months, etc.' {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
			</div>
			<FormField
				control={form.control}
				name='team.relevantExperience'
				render={({ field }) => (
					<FormItem>
						<FormLabel>
							What relevant experience or achievements do you have?
						</FormLabel>
						<FormControl>
							<Textarea
								className='min-h-20'
								placeholder='Previous startups, relevant work experience, technical achievements, domain expertise, etc.'
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
