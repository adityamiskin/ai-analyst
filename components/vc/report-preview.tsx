'use client';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CompanySnapshot } from '@/lib/mock';

interface ReportPreviewProps {
	company?: CompanySnapshot;
}

export function ReportPreview({ company }: ReportPreviewProps) {
	function handleExport() {
		// Placeholder for server action / PDF export
		console.log('[v0] Export PDF clicked');
		alert('Export stub: connect your PDF generator or server action.');
	}

	return (
		<section className='space-y-4'>
			<Card>
				<CardHeader>
					<CardTitle>Report</CardTitle>
					<CardDescription>
						Printable summary combining snapshot, frameworks outputs,
						benchmarks, risks, and recommendation.
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-3'>
					<ul className='list-disc pl-5 text-sm'>
						<li>Snapshot: company, stage, sector, ask</li>
						<li>Framework outputs: bullets per analysis</li>
						<li>Benchmarks: arrows vs peer medians</li>
						<li>Risks with evidence and provenance</li>
						<li>Recommendation with success probability</li>
					</ul>

					<div className='flex gap-2 pt-2'>
						<Button onClick={handleExport}>Export PDF</Button>
						<Button variant='secondary' onClick={() => alert('Copied! (stub)')}>
							Copy as Markdown
						</Button>
					</div>
					<p className='text-xs text-muted-foreground'>
						Exports are deterministic from current tab data. Wire to a server
						action and PDF service when ready.
					</p>
				</CardContent>
			</Card>
		</section>
	);
}
