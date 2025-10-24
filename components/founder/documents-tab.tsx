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
import { useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

type FormData = {
	company: {
		name: string;
		website: string;
		location: string;
		oneLiner: string;
		stage: string;
		whatDoYouDo: string;
		whyNow: string;
		deck?: FileRef[];
	};
	team: {
		founders: Array<{
			name: string;
			email: string;
			designation: string;
		}>;
		isFullTime: boolean;
		howLongWorked: string;
		relevantExperience: string;
	};
	product: {
		description: string;
		demoUrl: string;
		defensibility: string;
		videoUrl: string;
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
	};
	documents: {
		pitchDeck: FileRef[];
		other: FileRef[];
	};
};

type PitchDeckAnalysis = {
	company?: {
		name?: string;
		website?: string;
		location?: string;
		oneLiner?: string;
		stage?: 'preseed' | 'seed' | 'series-a' | 'series-b-plus';
		whatDoYouDo?: string;
		whyNow?: string;
	};
	team?: {
		founders?: Array<{
			name: string;
			email?: string;
			designation?: string;
		}>;
		isFullTime?: boolean;
		relevantExperience?: string;
	};
	product?: {
		description?: string;
		demoUrl?: string;
		defensibility?: string;
	};
	market?: {
		customer?: string;
		competitors?: string;
		differentiation?: string;
		gtm?: string;
		tam?: string;
		sam?: string;
		som?: string;
	};
	traction?: {
		isLaunched?: 'yes' | 'no' | 'soon';
		launchDate?: string;
		mrr?: string;
		growth?: string;
		activeUsersCount?: string;
		pilots?: string;
		kpis?: string;
	};
};

export type DocumentsTabForm = UseFormReturn<FormData>;

// Function to get file binary data and determine media type
async function fileToBinary(
	file: File,
): Promise<{ data: ArrayBuffer; mediaType: string }> {
	const arrayBuffer = await file.arrayBuffer();

	// Determine media type based on file extension
	const fileName = file.name.toLowerCase();
	let mediaType = 'application/octet-stream'; // default

	if (fileName.endsWith('.pdf')) {
		mediaType = 'application/pdf';
	} else if (fileName.endsWith('.docx')) {
		mediaType =
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
	} else if (fileName.endsWith('.pptx')) {
		mediaType =
			'application/vnd.openxmlformats-officedocument.presentationml.presentation';
	} else if (fileName.endsWith('.ppt')) {
		mediaType = 'application/vnd.ms-powerpoint';
	} else if (fileName.endsWith('.txt')) {
		mediaType = 'text/plain';
	} else if (fileName.endsWith('.doc')) {
		mediaType = 'application/msword';
	}

	return { data: arrayBuffer, mediaType };
}

export function DocumentsTab({ form }: { form: DocumentsTabForm }) {
	const analyzeDocuments = useAction(api.founders.analyzeDocuments);
	const storeFile = useAction(api.founders.storeFile);
	const [isAnalyzing, setIsAnalyzing] = React.useState(false);
	const [isStoring, setIsStoring] = React.useState(false);

	// Watch for file changes to force re-renders
	const watchedPitchDeckFiles = form.watch('documents.pitchDeck');
	const watchedOtherFiles = form.watch('documents.other');

	const pitchDeckFiles = React.useMemo(
		() => watchedPitchDeckFiles || [],
		[watchedPitchDeckFiles],
	);
	const otherFiles = React.useMemo(
		() => watchedOtherFiles || [],
		[watchedOtherFiles],
	);
	const allFiles = React.useMemo(
		() => [...pitchDeckFiles, ...otherFiles],
		[pitchDeckFiles, otherFiles],
	);
	const hasAnyFiles = allFiles.length > 0;

	const handleAnalyze = async () => {
		const pitchDeckFiles = form.getValues('documents.pitchDeck');
		const otherFiles = form.getValues('documents.other');
		const allFiles = [...pitchDeckFiles, ...otherFiles];

		// First, ensure all files are uploaded
		const filesToStore = allFiles.filter(
			(fileRef) => fileRef.file && !fileRef.storageId,
		);

		if (filesToStore.length > 0) {
			setIsStoring(true);
			try {
				// Store files in Convex storage
				const storedFiles = await Promise.all(
					filesToStore.map(async (fileRef) => {
						if (fileRef.file) {
							const { data, mediaType } = await fileToBinary(fileRef.file);
							const storageId = await storeFile({
								file: data,
								filename: fileRef.name,
								contentType: mediaType,
							});
							return {
								...fileRef,
								storageId,
								mediaType, // Store mediaType for later use
							};
						}
						return fileRef;
					}),
				);

				// Update form with stored files
				const updatedPitchDeckFiles = pitchDeckFiles.map((fileRef) => {
					const stored = storedFiles.find((sf) => sf.name === fileRef.name);
					return stored || fileRef;
				});
				const updatedOtherFiles = otherFiles.map((fileRef) => {
					const stored = storedFiles.find((sf) => sf.name === fileRef.name);
					return stored || fileRef;
				});

				form.setValue('documents.pitchDeck', updatedPitchDeckFiles);
				form.setValue('documents.other', updatedOtherFiles);

				toast.success('Files stored successfully!');
			} catch (error) {
				console.error('Error storing files:', error);
				toast.error('Failed to store files. Please try again.');
				return;
			} finally {
				setIsStoring(false);
			}
		}

		// Now analyze the uploaded documents
		setIsAnalyzing(true);

		try {
			// Get updated files with storage IDs
			const updatedPitchDeckFiles = form.getValues('documents.pitchDeck');
			const updatedOtherFiles = form.getValues('documents.other');
			const updatedAllFiles = [...updatedPitchDeckFiles, ...updatedOtherFiles];

			// Prepare documents for analysis (only those with storage IDs)
			const documentsForAnalysis = updatedAllFiles
				.filter((fileRef) => fileRef.storageId)
				.map((fileRef) => ({
					fileName: fileRef.name,
					storageId: fileRef.storageId!,
					mediaType: fileRef.mediaType || 'application/octet-stream',
				}));

			const documents = documentsForAnalysis;

			if (documents.length > 0) {
				const analysisResult = (await analyzeDocuments({
					documents: documents.map((doc) => ({
						...doc,
						storageId: doc.storageId as Id<'_storage'>, // Cast to expected type
					})),
				})) as PitchDeckAnalysis;

				// Apply the analysis results to the form
				if (analysisResult.company) {
					if (analysisResult.company.name) {
						form.setValue('company.name', analysisResult.company.name);
					}
					if (analysisResult.company.website) {
						form.setValue('company.website', analysisResult.company.website);
					}
					if (analysisResult.company.location) {
						form.setValue('company.location', analysisResult.company.location);
					}
					if (analysisResult.company.oneLiner) {
						form.setValue('company.oneLiner', analysisResult.company.oneLiner);
					}
					if (analysisResult.company.stage) {
						form.setValue('company.stage', analysisResult.company.stage);
					}
					if (analysisResult.company.whatDoYouDo) {
						form.setValue(
							'company.whatDoYouDo',
							analysisResult.company.whatDoYouDo,
						);
					}
					if (analysisResult.company.whyNow) {
						form.setValue('company.whyNow', analysisResult.company.whyNow);
					}
				}

				// Apply team information
				if (analysisResult.team) {
					if (
						analysisResult.team.founders &&
						analysisResult.team.founders.length > 0
					) {
						// Use AI founders as the source of truth, since they should be more complete
						const mergedFounders = analysisResult.team.founders.map(
							(aiFounder) => ({
								name: aiFounder.name || '',
								email: aiFounder.email || '',
								designation: aiFounder.designation || '',
							}),
						);

						form.setValue('team.founders', mergedFounders);
					}

					if (analysisResult.team.isFullTime !== undefined) {
						form.setValue('team.isFullTime', analysisResult.team.isFullTime);
					}
					if (analysisResult.team.relevantExperience) {
						form.setValue(
							'team.relevantExperience',
							analysisResult.team.relevantExperience,
						);
					}
				}

				// Apply product information
				if (analysisResult.product) {
					if (analysisResult.product.description) {
						form.setValue(
							'product.description',
							analysisResult.product.description,
						);
					}
					if (analysisResult.product.demoUrl) {
						form.setValue('product.demoUrl', analysisResult.product.demoUrl);
					}
					if (analysisResult.product.defensibility) {
						form.setValue(
							'product.defensibility',
							analysisResult.product.defensibility,
						);
					}
				}

				// Apply market information
				if (analysisResult.market) {
					if (analysisResult.market.customer) {
						form.setValue('market.customer', analysisResult.market.customer);
					}
					if (analysisResult.market.competitors) {
						form.setValue(
							'market.competitors',
							analysisResult.market.competitors,
						);
					}
					if (analysisResult.market.differentiation) {
						form.setValue(
							'market.differentiation',
							analysisResult.market.differentiation,
						);
					}
					if (analysisResult.market.gtm) {
						form.setValue('market.gtm', analysisResult.market.gtm);
					}
					if (analysisResult.market.tam) {
						form.setValue('market.tam', analysisResult.market.tam);
					}
					if (analysisResult.market.sam) {
						form.setValue('market.sam', analysisResult.market.sam);
					}
					if (analysisResult.market.som) {
						form.setValue('market.som', analysisResult.market.som);
					}
				}

				// Apply traction information
				if (analysisResult.traction) {
					if (analysisResult.traction.isLaunched) {
						form.setValue(
							'traction.isLaunched',
							analysisResult.traction.isLaunched,
						);
					}
					if (analysisResult.traction.launchDate) {
						form.setValue(
							'traction.launchDate',
							analysisResult.traction.launchDate,
						);
					}
					if (analysisResult.traction.mrr) {
						form.setValue('traction.mrr', analysisResult.traction.mrr);
					}
					if (analysisResult.traction.growth) {
						form.setValue('traction.growth', analysisResult.traction.growth);
					}
					if (analysisResult.traction.activeUsersCount) {
						form.setValue(
							'traction.activeUsersCount',
							analysisResult.traction.activeUsersCount,
						);
					}
					if (analysisResult.traction.pilots) {
						form.setValue('traction.pilots', analysisResult.traction.pilots);
					}
					if (analysisResult.traction.kpis) {
						form.setValue('traction.kpis', analysisResult.traction.kpis);
					}
				}

				toast.success(
					'Documents analyzed! Many form fields have been pre-filled with extracted information.',
				);
			}
		} catch (error) {
			console.error('Error analyzing documents:', error);
			toast.error(
				'Could not analyze documents, but you can still fill the form manually.',
			);
		} finally {
			setIsAnalyzing(false);
		}
	};

	return (
		<>
			<p className='text-sm text-muted-foreground'>
				Upload your documents. Your pitch deck is required and will help
				auto-fill many fields across your application including company details,
				team information, product description, market analysis, and traction
				metrics. Additional documents provide more context.
			</p>
			<div className='grid gap-6'>
				<FormField
					control={form.control}
					name='documents.pitchDeck'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Pitch deck * (PDF/PPT)</FormLabel>
							<FormControl>
								<FilePicker
									id='pitchDeck'
									label=''
									accept='.pdf,.ppt,.pptx'
									onChange={(files) => {
										field.onChange(files);
									}}
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
							<FormLabel>Other supporting documents (optional)</FormLabel>
							<FormControl>
								<FilePicker
									id='other'
									label=''
									onChange={(files) => {
										field.onChange(files);
									}}
								/>
							</FormControl>
							<FileList files={field.value as FileRef[]} />
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Upload & Analyze Button */}
				{hasAnyFiles && (
					<Button
						onClick={handleAnalyze}
						disabled={isStoring || isAnalyzing}
						className='w-fit'>
						{isStoring
							? 'Uploading...'
							: isAnalyzing
							? 'Analyzing...'
							: 'Upload & Analyze Documents'}
					</Button>
				)}
			</div>
		</>
	);
}
