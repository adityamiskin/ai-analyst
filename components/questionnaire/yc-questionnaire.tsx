'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { CompanyTab } from './company-tab';
import { DocumentsTab } from './documents-tab';
import { TeamTab } from './team-tab';
import { ProductTab } from './product-tab';
import { MarketTab } from './market-tab';
import { TractionTab } from './traction-tab';

type Founder = {
	name: string;
	email: string;
	designation: string;
};

// Zod schema for form validation
const fileRefSchema = z.object({
	name: z.string(),
	size: z.number(),
});

const founderSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	email: z.string().email('Valid email is required'),
	designation: z.string().min(1, 'Designation is required'),
});

const formSchema = z.object({
	company: z.object({
		name: z.string().min(1, 'Company name is required'),
		website: z.string().url('Valid website URL is required'),
		location: z.string().min(1, 'Location is required'),
		oneLiner: z.string().min(1, 'One-liner is required'),
		stage: z.string().min(1, 'Stage is required'),
		whatDoYouDo: z.string().min(1, 'Description is required'),
		whyNow: z.string().min(1, 'Why now explanation is required'),
		deck: z.array(fileRefSchema),
	}),
	team: z.object({
		founders: z.array(founderSchema).min(1, 'At least one founder is required'),
		isFullTime: z.boolean(),
		howLongWorked: z.string().min(1, 'Work duration is required'),
		relevantExperience: z.string().min(1, 'Relevant experience is required'),
	}),
	product: z.object({
		description: z.string().min(1, 'Product description is required'),
		demoUrl: z.string().url('Valid demo URL is required').or(z.literal('')),
		defensibility: z.string().min(1, 'Defensibility explanation is required'),
		videoUrl: z.string().url('Valid video URL is required').or(z.literal('')),
		videoFile: z.array(fileRefSchema),
		supportingDocs: z.array(fileRefSchema),
	}),
	market: z.object({
		customer: z.string().min(1, 'Customer description is required'),
		competitors: z.string().min(1, 'Competitor analysis is required'),
		differentiation: z.string().min(1, 'Differentiation is required'),
		gtm: z.string().min(1, 'Go-to-market strategy is required'),
		tam: z.string(),
		sam: z.string(),
		som: z.string(),
	}),
	traction: z.object({
		isLaunched: z.string().min(1, 'Launch status is required'),
		launchDate: z.string(),
		mrr: z.string(),
		growth: z.string(),
		activeUsersCount: z.string(),
		pilots: z.string(),
		kpis: z.string(),
		metricsCsv: z.array(fileRefSchema),
	}),
	documents: z.object({
		financialModel: z.array(fileRefSchema),
		capTable: z.array(fileRefSchema),
		incorporation: z.array(fileRefSchema),
		other: z.array(fileRefSchema),
	}),
});

type FormData = z.infer<typeof formSchema>;

const defaultValues: FormData = {
	company: {
		name: '',
		website: '',
		location: '',
		oneLiner: '',
		stage: '',
		whatDoYouDo: '',
		whyNow: '',
		deck: [],
	},
	team: {
		founders: [],
		isFullTime: true,
		howLongWorked: '',
		relevantExperience: '',
	},
	product: {
		description: '',
		demoUrl: '',
		defensibility: '',
		videoUrl: '',
		videoFile: [],
		supportingDocs: [],
	},
	market: {
		customer: '',
		competitors: '',
		differentiation: '',
		gtm: '',
		tam: '',
		sam: '',
		som: '',
	},
	traction: {
		isLaunched: '',
		launchDate: '',
		mrr: '',
		growth: '',
		activeUsersCount: '',
		pilots: '',
		kpis: '',
		metricsCsv: [],
	},
	documents: {
		financialModel: [],
		capTable: [],
		incorporation: [],
		other: [],
	},
};

export function YCQuestionnaire() {
	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues,
	});

	const onSubmit = (data: FormData) => {
		// TODO: Send data to backend for processing
		console.log('Submitting application:', data);
		alert('Application submitted successfully!');
	};

	const addFounder = () => {
		const currentFounders = form.getValues('team.founders');
		form.setValue('team.founders', [
			...currentFounders,
			{ name: '', email: '', designation: '' },
		]);
	};

	const updateFounder = (
		index: number,
		field: keyof Founder,
		value: string,
	) => {
		const currentFounders = form.getValues('team.founders');
		const updatedFounders = currentFounders.map((founder, i) =>
			i === index ? { ...founder, [field]: value } : founder,
		);
		form.setValue('team.founders', updatedFounders);
	};

	const removeFounder = (index: number) => {
		const currentFounders = form.getValues('team.founders');
		form.setValue(
			'team.founders',
			currentFounders.filter((_, i) => i !== index),
		);
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
				<Tabs defaultValue='company' className='space-y-6'>
					<TabsList className='flex flex-wrap justify-start'>
						<TabsTrigger value='company'>Company</TabsTrigger>
						<TabsTrigger value='documents'>Documents</TabsTrigger>
						<TabsTrigger value='team'>Team</TabsTrigger>
						<TabsTrigger value='product'>Product</TabsTrigger>
						<TabsTrigger value='market'>Market</TabsTrigger>
						<TabsTrigger value='traction'>Traction</TabsTrigger>
					</TabsList>

					<TabsContent value='company' className='space-y-4'>
						<CompanyTab form={form} />
					</TabsContent>

					<TabsContent value='documents' className='space-y-4'>
						<DocumentsTab form={form} />
					</TabsContent>

					<TabsContent value='team' className='space-y-4'>
						<TeamTab
							form={form}
							addFounder={addFounder}
							updateFounder={updateFounder}
							removeFounder={removeFounder}
						/>
					</TabsContent>

					<TabsContent value='product' className='space-y-4'>
						<ProductTab form={form} />
					</TabsContent>

					<TabsContent value='market' className='space-y-4'>
						<MarketTab form={form} />
					</TabsContent>

					<TabsContent value='traction' className='space-y-4'>
						<TractionTab form={form} />
					</TabsContent>
				</Tabs>

				<div className='flex items-center gap-3 pt-2'>
					<Button type='submit'>Submit Application</Button>
				</div>
			</form>
		</Form>
	);
}
