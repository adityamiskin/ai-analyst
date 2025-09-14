// Removed Tabs import and tab structure; added stacked sections with anchors and separators.

import Snapshot from '@/components/vc/snapshot';
import Benchmarks from '@/components/vc/benchmarks';
import FrameworksScorecard from '@/components/vc/frameworks-scorecard';
import Risks from '@/components/vc/risks';
import { SourcesEvidence } from '@/components/vc/vc-sources-evidence';
import { ReportPreview } from '@/components/vc/report-preview';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default function VCPage() {
	return (
		<main className='mx-auto w-full max-w-6xl px-4 py-8'>
			{/* Header */}
			<header className='mb-6'>
				<h1 className='text-2xl font-semibold tracking-tight text-pretty'>
					Analyst Report
				</h1>
				<p className='text-sm text-muted-foreground'>
					Structured, auditable view of the company using extracted founder
					inputs, public data, and peer benchmarks. This page compiles
					everything into a single printable report with provenance and trust
					checks.
				</p>

				{/* Lightweight table of contents */}
				<nav aria-label='Report contents' className='mt-3'>
					<ul className='flex flex-wrap gap-3 text-sm text-muted-foreground'>
						<li>
							<Link
								href='#snapshot'
								className='underline-offset-2 hover:underline'>
								Snapshot
							</Link>
						</li>
						<li>
							<Link
								href='#benchmarks'
								className='underline-offset-2 hover:underline'>
								Benchmarks
							</Link>
						</li>
						<li>
							<Link
								href='#frameworks'
								className='underline-offset-2 hover:underline'>
								Frameworks & Score
							</Link>
						</li>
						<li>
							<Link
								href='#risks'
								className='underline-offset-2 hover:underline'>
								Risks
							</Link>
						</li>
						<li>
							<Link
								href='#sources'
								className='underline-offset-2 hover:underline'>
								Sources & Evidence
							</Link>
						</li>
						<li>
							<Link
								href='#report'
								className='underline-offset-2 hover:underline'>
								Report
							</Link>
						</li>
					</ul>
				</nav>
			</header>

			{/* Sections stacked as one report */}
			<section id='snapshot' className='scroll-mt-24'>
				<Snapshot />
			</section>

			<Separator className='my-8' />

			<section id='benchmarks' className='scroll-mt-24'>
				<Benchmarks />
			</section>

			<Separator className='my-8' />

			<section id='frameworks' className='scroll-mt-24'>
				<FrameworksScorecard />
			</section>

			<Separator className='my-8' />

			<section id='risks' className='scroll-mt-24'>
				<Risks />
			</section>

			<Separator className='my-8' />

			<section id='sources' className='scroll-mt-24'>
				<SourcesEvidence />
			</section>

			<Separator className='my-8' />

			<section id='report' className='scroll-mt-24'>
				<ReportPreview />
			</section>
		</main>
	);
}
