'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { CompanyTab } from '@/components/founder/company-tab';
import { DocumentsTab } from '@/components/founder/documents-tab';
import { TeamTab } from '@/components/founder/team-tab';
import { ProductTab } from '@/components/founder/product-tab';
import { MarketTab } from '@/components/founder/market-tab';
import { TractionTab } from '@/components/founder/traction-tab';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

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
		founders: [
			{
				name: '',
				email: '',
				designation: '',
			},
		],
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

export default function YCQuestionnaire() {
	const form = useForm<FormData>({
		resolver: zodResolver(formSchema),
		defaultValues,
	});

	const createApplication = useMutation(api.founders.createApplication);

	const onSubmit = async (data: FormData) => {
		try {
			if (!data.team.founders.length) {
				toast.error('At least one founder is required');
				return;
			}

			const primaryEmail = data.team.founders[0]?.email;
			if (!primaryEmail) {
				toast.error('Primary founder email is required');
				return;
			}

			const result = await createApplication({ ...data, primaryEmail });

			toast.success('Application submitted successfully!');
			form.reset(defaultValues);
		} catch (error) {
			console.error('❌ Submission error:', error);
			toast.error(
				`Failed to submit: ${
					error instanceof Error ? error.message : 'Unknown error'
				}`,
			);
		}
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

	// Multistep state and helpers
	const [currentStep, setCurrentStep] = React.useState(0);
	const steps = [
		{
			key: 'company',
			label: 'Company',
			render: () => <CompanyTab form={form} />,
		},
		{
			key: 'documents',
			label: 'Documents',
			render: () => <DocumentsTab form={form} />,
		},
		{
			key: 'team',
			label: 'Team',
			render: () => (
				<TeamTab
					form={form}
					addFounder={addFounder}
					updateFounder={updateFounder}
					removeFounder={removeFounder}
				/>
			),
		},
		{
			key: 'product',
			label: 'Product',
			render: () => <ProductTab form={form} />,
		},
		{ key: 'market', label: 'Market', render: () => <MarketTab form={form} /> },
		{
			key: 'traction',
			label: 'Traction',
			render: () => <TractionTab form={form} />,
		},
	] as const;

	const totalSteps = steps.length;
	const progressPercent = ((currentStep + 1) / totalSteps) * 100;

	const handleNext = async () => {
		const currentKey = steps[currentStep].key as keyof FormData;
		const isValid = await form.trigger(currentKey as any, {
			shouldFocus: true,
		});
		if (!isValid) {
			toast.error('Please fill all the important fields before proceeding');
			return;
		}
		setCurrentStep((s) => Math.min(s + 1, totalSteps - 1));
	};

	const handleBack = () => {
		setCurrentStep((s) => Math.max(s - 1, 0));
	};

	return (
		<main className='container mx-auto max-w-5xl px-4 py-8'>
			<header className='mb-6'>
				<h1 className='text-3xl font-semibold text-pretty'>
					Founder Questionnaire
				</h1>
				<p className='text-muted-foreground mt-1'>
					YC-style application to capture everything in one place. Upload your
					deck and key docs inline as you answer.
				</p>
			</header>

			<Card>
				<CardHeader>
					<CardTitle className='text-xl'>Tell us about your company</CardTitle>
					<CardDescription>Keep answers clear and concise.</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit(onSubmit)}
							className='space-y-6 h-full'>
							<div className='space-y-6'>
								<div className='flex items-center gap-4'>
									<div className='text-sm text-muted-foreground'>
										Step {currentStep + 1} of {totalSteps}
									</div>
									<div className='flex-1'>
										<Progress value={progressPercent} />
									</div>
								</div>

								<div className='flex flex-wrap gap-2'>
									{steps.map((s, idx) => (
										<button
											key={s.key}
											type='button'
											onClick={() => setCurrentStep(idx)}
											className={`px-3 py-1.5 rounded-md border text-sm ${
												idx === currentStep
													? 'bg-primary text-primary-foreground'
													: 'bg-background'
											}`}>
											{idx + 1}. {s.label}
										</button>
									))}
								</div>

								<div className='space-y-4'>{steps[currentStep].render()}</div>
							</div>

							<div className='flex items-center gap-3 pt-2'>
								{currentStep > 0 && (
									<Button type='button' variant='outline' onClick={handleBack}>
										Back
									</Button>
								)}
								{currentStep < totalSteps - 1 ? (
									<Button type='button' onClick={handleNext}>
										Next
									</Button>
								) : (
									<Button type='submit'>Submit Application</Button>
								)}
							</div>
						</form>
					</Form>
				</CardContent>
			</Card>
		</main>
	);
}
