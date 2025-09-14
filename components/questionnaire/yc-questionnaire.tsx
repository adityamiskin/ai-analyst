'use client';

import * as React from 'react';
import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Trash2 } from 'lucide-react';
import { submitApplication, type YCApplication } from '@/lib/api';
import { toast } from 'sonner';

type FileRef = { name: string; size: number };

type Founder = {
	name: string;
	email: string;
	designation: string;
};

type FormState = {
	company: {
		name: string;
		website: string;
		location: string;
		oneLiner: string;
		stage: string;
		whatDoYouDo: string;
		whyNow: string;
		deck: FileRef[];
	};
	team: {
		founders: Founder[];
		isFullTime: boolean;
		howLongWorked: string;
		relevantExperience: string;
	};
	product: {
		description: string;
		demoUrl: string;
		defensibility: string;
		videoUrl: string;
		videoFile: FileRef[];
		supportingDocs: FileRef[];
	};
	market: {
		customer: string;
		competitors: string;
		differentiation: string;
		gtm: string;
		tam: string;
		sam: string;
		som: string;
	};
	traction: {
		isLaunched: string;
		launchDate: string;
		mrr: string;
		growth: string;
		activeUsersCount: string;
		pilots: string;
		kpis: string;
		metricsCsv: FileRef[];
	};
	documents: {
		financialModel: FileRef[];
		capTable: FileRef[];
		incorporation: FileRef[];
		other: FileRef[];
	};
};

const empty: FormState = {
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

function humanSize(bytes: number) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FilePicker({
	id,
	label,
	accept,
	multiple = true,
	onPicked,
}: {
	id: string;
	label: string;
	accept?: string;
	multiple?: boolean;
	onPicked: (files: FileRef[]) => void;
}) {
	return (
		<div className='grid gap-2'>
			<Label htmlFor={id}>{label}</Label>
			<Input
				id={id}
				type='file'
				accept={accept}
				multiple={multiple}
				onChange={(e) => {
					const list = Array.from(e.target.files || []).map((f) => ({
						name: f.name,
						size: f.size,
					}));
					onPicked(list);
				}}
			/>
		</div>
	);
}

function FileList({ files }: { files: FileRef[] }) {
	if (!files?.length) return null;
	return (
		<div className='mt-2 flex flex-wrap gap-2'>
			{files.map((f, i) => (
				<Badge
					key={`${f.name}-${i}`}
					variant='secondary'
					className='font-normal'>
					{f.name} • {humanSize(f.size)}
				</Badge>
			))}
		</div>
	);
}

export function YCQuestionnaire() {
	const queryClient = useQueryClient();
	const [submitting, setSubmitting] = React.useState(false);
	const form = useForm({
		defaultValues: empty,
		onSubmit: async ({ value }) => {
			setSubmitting(true);
			try {
				const { id } = await submitApplication(
					value as unknown as YCApplication,
				);
				toast.success('Application submitted', { description: `ID: ${id}` });
				queryClient.invalidateQueries({ queryKey: ['applications'] });
			} catch (err) {
				toast.error('Submit failed', {
					description: (err as Error)?.message ?? 'Unknown error',
				});
			} finally {
				setSubmitting(false);
			}
		},
	});

	const addFounder = () => {
		form.setFieldValue('team.founders', [
			...form.state.values.team.founders,
			{ name: '', email: '', designation: '' },
		]);
	};

	const updateFounder = (
		index: number,
		field: keyof Founder,
		value: string,
	) => {
		const next = form.state.values.team.founders.map((f, i) =>
			i === index ? { ...f, [field]: value } : f,
		);
		form.setFieldValue('team.founders', next);
	};

	const removeFounder = (index: number) => {
		const next = form.state.values.team.founders.filter((_, i) => i !== index);
		form.setFieldValue('team.founders', next);
	};

	return (
		<div className='space-y-6'>
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
					<p className='text-sm text-muted-foreground'>
						Basics and your one-liner. Upload your pitch deck here so investors
						can review context alongside answers.
					</p>
					<div className='grid gap-4 md:grid-cols-2'>
						<div className='grid gap-2'>
							<Label htmlFor='name'>Company name</Label>
							<Input
								id='name'
								placeholder='Acme Inc.'
								value={form.state.values.company.name}
								onChange={(e) =>
									form.setFieldValue('company.name', e.target.value)
								}
							/>
						</div>
						<div className='grid gap-2'>
							<Label htmlFor='website'>Website</Label>
							<Input
								id='website'
								placeholder='https://acme.com'
								value={form.state.values.company.website}
								onChange={(e) =>
									form.setFieldValue('company.website', e.target.value)
								}
							/>
						</div>
						<div className='grid gap-2'>
							<Label htmlFor='location'>HQ Location</Label>
							<Input
								id='location'
								placeholder='San Francisco, CA'
								value={form.state.values.company.location}
								onChange={(e) =>
									form.setFieldValue('company.location', e.target.value)
								}
							/>
						</div>
						<div className='grid gap-2'>
							<Label>Stage</Label>
							<Select
								value={form.state.values.company.stage}
								onValueChange={(v) => form.setFieldValue('company.stage', v)}>
								<SelectTrigger>
									<SelectValue placeholder='Choose stage' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='preseed'>Pre-seed</SelectItem>
									<SelectItem value='seed'>Seed</SelectItem>
									<SelectItem value='series-a'>Series A</SelectItem>
									<SelectItem value='series-b-plus'>Series B+</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className='grid gap-2 md:col-span-2'>
							<Label htmlFor='oneLiner'>One-liner</Label>
							<Input
								id='oneLiner'
								placeholder='We help small businesses automate their accounting with AI'
								value={form.state.values.company.oneLiner}
								onChange={(e) =>
									form.setFieldValue('company.oneLiner', e.target.value)
								}
							/>
						</div>
						<div className='grid gap-2 md:col-span-2'>
							<Label htmlFor='what'>What do you do?</Label>
							<Textarea
								id='what'
								className='min-h-28'
								placeholder='Describe your product, how it works, and the problem it solves. Be specific about your solution and target market.'
								value={form.state.values.company.whatDoYouDo}
								onChange={(e) =>
									form.setFieldValue('company.whatDoYouDo', e.target.value)
								}
							/>
						</div>
						<div className='grid gap-2 md:col-span-2'>
							<Label htmlFor='whyNow'>Why now?</Label>
							<Textarea
								id='whyNow'
								className='min-h-24'
								placeholder='What has changed recently that makes this the right time for your solution? Market shifts, new technology, regulatory changes, etc.'
								value={form.state.values.company.whyNow}
								onChange={(e) =>
									form.setFieldValue('company.whyNow', e.target.value)
								}
							/>
						</div>
					</div>
					{/* Upload pitch deck inline */}
					<div className='grid gap-2'>
						<FilePicker
							id='deck'
							label='Upload pitch deck (PDF/PPT)'
							accept='.pdf,.ppt,.pptx'
							onPicked={(files) => form.setFieldValue('company.deck', files)}
						/>
						<FileList files={form.state.values.company.deck} />
					</div>
				</TabsContent>

				<TabsContent value='documents' className='space-y-4'>
					<p className='text-sm text-muted-foreground'>
						Upload your key documents first. These help provide context for the
						rest of your application.
					</p>
					<div className='grid gap-6'>
						<div className='grid gap-2'>
							<FilePicker
								id='fin'
								label='Financial model (XLSX/CSV/PDF)'
								accept='.xlsx,.csv,.pdf'
								onPicked={(files) =>
									form.setFieldValue('documents.financialModel', files)
								}
							/>
							<FileList files={form.state.values.documents.financialModel} />
						</div>
						<div className='grid gap-2'>
							<FilePicker
								id='cap'
								label='Cap table (XLSX/CSV/PDF)'
								accept='.xlsx,.csv,.pdf'
								onPicked={(files) =>
									form.setFieldValue('documents.capTable', files)
								}
							/>
							<FileList files={form.state.values.documents.capTable} />
						</div>
						<div className='grid gap-2'>
							<FilePicker
								id='inc'
								label='Incorporation docs (PDF)'
								accept='.pdf'
								onPicked={(files) =>
									form.setFieldValue('documents.incorporation', files)
								}
							/>
							<FileList files={form.state.values.documents.incorporation} />
						</div>
						<div className='grid gap-2'>
							<FilePicker
								id='other'
								label='Other supporting files'
								onPicked={(files) =>
									form.setFieldValue('documents.other', files)
								}
							/>
							<FileList files={form.state.values.documents.other} />
						</div>
					</div>
				</TabsContent>

				<TabsContent value='team' className='space-y-4'>
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

						{form.state.values.team.founders.length === 0 ? (
							<p className='text-sm text-muted-foreground'>
								No founders added yet. Click "Add a Founder" to get started.
							</p>
						) : (
							<div className='space-y-3'>
								{form.state.values.team.founders.map((founder, index) => (
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
											<div className='grid gap-2'>
												<Label>Name</Label>
												<Input
													value={founder.name}
													onChange={(e) =>
														updateFounder(index, 'name', e.target.value)
													}
													placeholder='Jane Doe'
												/>
											</div>
											<div className='grid gap-2'>
												<Label>Email</Label>
												<Input
													type='email'
													value={founder.email}
													onChange={(e) =>
														updateFounder(index, 'email', e.target.value)
													}
													placeholder='jane@company.com'
												/>
											</div>
											<div className='grid gap-2'>
												<Label>Designation</Label>
												<Input
													value={founder.designation}
													onChange={(e) =>
														updateFounder(index, 'designation', e.target.value)
													}
													placeholder='CEO'
												/>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					<div className='grid gap-4 md:grid-cols-2'>
						<div className='flex items-center gap-2'>
							<Checkbox
								id='fulltime'
								checked={form.state.values.team.isFullTime}
								onCheckedChange={(v) =>
									form.setFieldValue('team.isFullTime', Boolean(v))
								}
							/>
							<Label htmlFor='fulltime'>All founders are full-time</Label>
						</div>
						<div className='grid gap-2'>
							<Label>How long have you worked together?</Label>
							<Input
								placeholder='2 years, 6 months, etc.'
								value={form.state.values.team.howLongWorked}
								onChange={(e) =>
									form.setFieldValue('team.howLongWorked', e.target.value)
								}
							/>
						</div>
					</div>
					<div className='grid gap-2'>
						<Label>What relevant experience or achievements do you have?</Label>
						<Textarea
							className='min-h-20'
							placeholder='Previous startups, relevant work experience, technical achievements, domain expertise, etc.'
							value={form.state.values.team.relevantExperience}
							onChange={(e) =>
								form.setFieldValue('team.relevantExperience', e.target.value)
							}
						/>
					</div>
				</TabsContent>

				<TabsContent value='product' className='space-y-4'>
					<p className='text-sm text-muted-foreground'>
						Describe the product and share visuals or demos.
					</p>
					<div className='grid gap-4'>
						<div className='grid gap-2'>
							<Label>Description</Label>
							<Textarea
								className='min-h-28'
								placeholder='Describe your product in detail. What does it do? How does it work? What makes it unique?'
								value={form.state.values.product.description}
								onChange={(e) =>
									form.setFieldValue('product.description', e.target.value)
								}
							/>
						</div>
						<div className='grid gap-2'>
							<Label>Demo URL</Label>
							<Input
								placeholder='https://demo.example.com'
								value={form.state.values.product.demoUrl}
								onChange={(e) =>
									form.setFieldValue('product.demoUrl', e.target.value)
								}
							/>
						</div>
						<div className='grid gap-2'>
							<Label>Video URL (optional)</Label>
							<Input
								placeholder='https://youtube.com/watch?v=... or https://vimeo.com/...'
								value={form.state.values.product.videoUrl}
								onChange={(e) =>
									form.setFieldValue('product.videoUrl', e.target.value)
								}
							/>
						</div>
						<div className='grid gap-2'>
							<FilePicker
								id='video'
								label='Upload video (optional)'
								accept='.mp4,.mov,.avi,.mkv'
								multiple={false}
								onPicked={(files) =>
									form.setFieldValue('product.videoFile', files)
								}
							/>
							<FileList files={form.state.values.product.videoFile} />
						</div>
						<div className='grid gap-2'>
							<Label>Defensibility / moat</Label>
							<Textarea
								className='min-h-24'
								placeholder='Why is this hard to copy? Data advantages, network effects, proprietary technology, regulatory barriers, etc.'
								value={form.state.values.product.defensibility}
								onChange={(e) =>
									form.setFieldValue('product.defensibility', e.target.value)
								}
							/>
						</div>
						<div className='grid gap-2'>
							<FilePicker
								id='supporting'
								label='Upload supporting documents regarding the product'
								onPicked={(files) =>
									form.setFieldValue('product.supportingDocs', files)
								}
							/>
							<FileList files={form.state.values.product.supportingDocs} />
						</div>
					</div>
				</TabsContent>

				<TabsContent value='market' className='space-y-4'>
					<p className='text-sm text-muted-foreground'>
						Customers, competitors, and how big this can be.
					</p>
					<div className='grid gap-4'>
						<div className='grid gap-2'>
							<Label>Who is your customer?</Label>
							<Textarea
								className='min-h-24'
								placeholder='Be specific about your target customer. Demographics, company size, role, pain points, etc.'
								value={form.state.values.market.customer}
								onChange={(e) =>
									form.setFieldValue('market.customer', e.target.value)
								}
							/>
						</div>
						<div className='grid gap-2'>
							<Label>Competitors</Label>
							<Textarea
								className='min-h-24'
								placeholder='List direct and indirect competitors. Include both established companies and other startups.'
								value={form.state.values.market.competitors}
								onChange={(e) =>
									form.setFieldValue('market.competitors', e.target.value)
								}
							/>
						</div>
						<div className='grid gap-2'>
							<Label>How are you different?</Label>
							<Textarea
								className='min-h-24'
								placeholder="What's your unique value proposition? How do you differentiate from competitors?"
								value={form.state.values.market.differentiation}
								onChange={(e) =>
									form.setFieldValue('market.differentiation', e.target.value)
								}
							/>
						</div>
						<div className='grid gap-2'>
							<Label>Go-to-market</Label>
							<Textarea
								className='min-h-24'
								placeholder='How will you acquire customers? Sales strategy, marketing channels, partnerships, etc.'
								value={form.state.values.market.gtm}
								onChange={(e) =>
									form.setFieldValue('market.gtm', e.target.value)
								}
							/>
						</div>
						<div className='grid gap-4 md:grid-cols-3'>
							<div className='grid gap-2'>
								<Label>TAM (USD)</Label>
								<Input
									placeholder='e.g. $20B'
									value={form.state.values.market.tam}
									onChange={(e) =>
										form.setFieldValue('market.tam', e.target.value)
									}
								/>
							</div>
							<div className='grid gap-2'>
								<Label>SAM (USD)</Label>
								<Input
									placeholder='e.g. $4B'
									value={form.state.values.market.sam}
									onChange={(e) =>
										form.setFieldValue('market.sam', e.target.value)
									}
								/>
							</div>
							<div className='grid gap-2'>
								<Label>SOM (USD)</Label>
								<Input
									placeholder='e.g. $400M'
									value={form.state.values.market.som}
									onChange={(e) =>
										form.setFieldValue('market.som', e.target.value)
									}
								/>
							</div>
						</div>
					</div>
				</TabsContent>

				<TabsContent value='traction' className='space-y-4'>
					<p className='text-sm text-muted-foreground'>
						Share measurable progress and attach data if helpful.
					</p>
					<div className='grid gap-4 md:grid-cols-2'>
						<div className='grid gap-2'>
							<Label>Have you launched?</Label>
							<Select
								value={form.state.values.traction.isLaunched}
								onValueChange={(v) =>
									form.setFieldValue('traction.isLaunched', v)
								}>
								<SelectTrigger>
									<SelectValue placeholder='Select status' />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='yes'>Yes</SelectItem>
									<SelectItem value='no'>No</SelectItem>
									<SelectItem value='beta'>Beta/Limited launch</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className='grid gap-2'>
							<Label>Launch date (if launched)</Label>
							<Input
								placeholder='January 2024'
								value={form.state.values.traction.launchDate}
								onChange={(e) =>
									form.setFieldValue('traction.launchDate', e.target.value)
								}
							/>
						</div>
						<div className='grid gap-2'>
							<Label>MRR (USD)</Label>
							<Input
								placeholder='e.g. 12000'
								value={form.state.values.traction.mrr}
								onChange={(e) =>
									form.setFieldValue('traction.mrr', e.target.value)
								}
							/>
						</div>
						<div className='grid gap-2'>
							<Label>Growth (% MoM)</Label>
							<Input
								placeholder='e.g. 18'
								value={form.state.values.traction.growth}
								onChange={(e) =>
									form.setFieldValue('traction.growth', e.target.value)
								}
							/>
						</div>
						<div className='grid gap-2 md:col-span-2'>
							<Label>Number of active users</Label>
							<Input
								type='number'
								placeholder='e.g. 1500'
								value={form.state.values.traction.activeUsersCount}
								onChange={(e) =>
									form.setFieldValue(
										'traction.activeUsersCount',
										e.target.value,
									)
								}
							/>
						</div>
					</div>

					{/* Upload metrics CSV inline */}
					<div className='grid gap-2'>
						<FilePicker
							id='metrics'
							label='Upload metrics CSV (optional)'
							accept='.csv'
							onPicked={(files) =>
								form.setFieldValue('traction.metricsCsv', files)
							}
						/>
						<FileList files={form.state.values.traction.metricsCsv} />
					</div>

					<div className='grid gap-2'>
						<Label>Pilots / LOIs</Label>
						<Textarea
							className='min-h-20'
							placeholder='List any pilot programs, letters of intent, or committed customers you have.'
							value={form.state.values.traction.pilots}
							onChange={(e) =>
								form.setFieldValue('traction.pilots', e.target.value)
							}
						/>
					</div>
					<div className='grid gap-2'>
						<Label>Key KPIs tracked</Label>
						<Textarea
							className='min-h-20'
							placeholder='What metrics do you track regularly? Revenue, user engagement, retention, conversion rates, etc.'
							value={form.state.values.traction.kpis}
							onChange={(e) =>
								form.setFieldValue('traction.kpis', e.target.value)
							}
						/>
					</div>
				</TabsContent>
			</Tabs>

			<div className='flex items-center gap-3 pt-2'>
				<Button onClick={() => form.handleSubmit()} disabled={submitting}>
					{submitting ? 'Submitting...' : 'Submit Application'}
				</Button>
			</div>
		</div>
	);
}
