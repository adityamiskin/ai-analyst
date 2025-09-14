import { notFound } from 'next/navigation';
import Snapshot from '@/components/vc/snapshot';
import Benchmarks from '@/components/vc/benchmarks';
import FrameworksScorecard from '@/components/vc/frameworks-scorecard';
import Risks from '@/components/vc/risks';
import { SourcesEvidence } from '@/components/vc/vc-sources-evidence';
import { ReportPreview } from '@/components/vc/report-preview';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { getCompanyById } from '@/lib/mock';
import { Building2 } from 'lucide-react';
import Link from 'next/link';

interface VCPageProps {
	params: Promise<{
		id: string;
	}>;
}

export default async function VCPage({ params }: VCPageProps) {
	const { id } = await params;
	const selectedCompany = getCompanyById(id);

	if (!selectedCompany) {
		notFound();
	}

	return (
		<>
			<header className='flex h-20 shrink-0 items-center gap-4 border-b px-6'>
				<SidebarTrigger className='-ml-1' />
				<div className='flex items-center gap-4 px-4'>
					<div className='w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center'>
						<Building2 className='h-6 w-6 text-primary' />
					</div>
					<div className='flex flex-col'>
						<h1 className='text-xl font-semibold'>{selectedCompany.company}</h1>
						<div className='flex items-center gap-2 text-sm text-muted-foreground'>
							<span>{selectedCompany.sector}</span>
							<span>•</span>
							<span className='px-2 py-0.5 bg-muted rounded text-xs font-medium'>
								{selectedCompany.stage}
							</span>
							<span>•</span>
							<span className='font-medium text-primary'>
								{selectedCompany.ask}
							</span>
						</div>
					</div>
				</div>
			</header>
			<main className='mx-auto w-full max-w-6xl px-6 py-8'>
				{/* Header */}
				<header className='mb-6'>
					<h2 className='text-2xl font-semibold tracking-tight text-pretty'>
						Analyst Report
					</h2>
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
					<Snapshot company={selectedCompany} />
				</section>

				<Separator className='my-8' />

				<section id='benchmarks' className='scroll-mt-24'>
					<Benchmarks company={selectedCompany} />
				</section>

				<Separator className='my-8' />

				<section id='frameworks' className='scroll-mt-24'>
					<FrameworksScorecard company={selectedCompany} />
				</section>

				<Separator className='my-8' />

				<section id='risks' className='scroll-mt-24'>
					<Risks company={selectedCompany} />
				</section>

				<Separator className='my-8' />

				<section id='sources' className='scroll-mt-24'>
					<SourcesEvidence company={selectedCompany} />
				</section>

				<Separator className='my-8' />

				<section id='report' className='scroll-mt-24'>
					<ReportPreview company={selectedCompany} />
				</section>
			</main>
		</>
	);
}
