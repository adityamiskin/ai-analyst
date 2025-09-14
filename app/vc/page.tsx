import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { mockCompanies } from '@/lib/mock';

export default function VCPage() {
	// Simple mock of an overview: successes, issues, news, alerts
	const successes = [
		'Two portfolio companies crossed $1M ARR',
		'Follow-on from Tier-1 fund for DataFlow Inc',
		'Greentech signed 10MW expansion contract',
	];

	const issues = [
		'SecureNet hiring delays for key security role',
		'Acme AI growth slowed vs prior quarter',
	];

	const news = [
		{
			title: 'DataFlow Inc raises Series A extension',
			source: 'TechNews',
			date: '2025-09-05',
		},
		{
			title: 'Acme AI launches agent marketplace',
			source: 'Company blog',
			date: '2025-09-03',
		},
	];

	const alerts = [
		{
			level: 'warning',
			message: 'Acme AI: Seasonality adjustment flagged in growth',
			date: '2025-08-30',
		},
		{
			level: 'critical',
			message: 'SecureNet: High risk - Market timing sensitivity',
			date: '2025-09-01',
		},
	];

	return (
		<div className='mx-auto w-full max-w-6xl px-6 py-8'>
			<header className='mb-6'>
				<h1 className='text-2xl font-semibold tracking-tight'>Firm Overview</h1>
				<p className='text-sm text-muted-foreground'>
					Pipeline health, recent wins, risks, and important updates across the
					portfolio.
				</p>
			</header>

			<div className='grid gap-6 md:grid-cols-2'>
				<Card>
					<CardHeader>
						<CardTitle>What’s going well</CardTitle>
						<CardDescription>
							Recent positive milestones and highlights.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ul className='list-disc pl-5 text-sm space-y-2'>
							{successes.map((s, i) => (
								<li key={i}>{s}</li>
							))}
						</ul>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>What needs attention</CardTitle>
						<CardDescription>
							Issues and potential blockers to monitor.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ul className='list-disc pl-5 text-sm space-y-2'>
							{issues.map((s, i) => (
								<li key={i}>{s}</li>
							))}
						</ul>
					</CardContent>
				</Card>
			</div>

			<Separator className='my-8' />

			<div className='grid gap-6 md:grid-cols-2'>
				<Card>
					<CardHeader>
						<CardTitle>News</CardTitle>
						<CardDescription>
							Recent public updates from portfolio.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ul className='text-sm space-y-3'>
							{news.map((n, i) => (
								<li key={i} className='flex items-center justify-between'>
									<span>{n.title}</span>
									<span className='text-xs text-muted-foreground'>
										{n.source} • {n.date}
									</span>
								</li>
							))}
						</ul>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Alerts</CardTitle>
						<CardDescription>
							Automated flags from metrics and risk checks.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<ul className='text-sm space-y-3'>
							{alerts.map((a, i) => (
								<li key={i} className='flex items-center justify-between'>
									<span
										className={
											a.level === 'critical'
												? 'text-destructive font-medium'
												: 'text-amber-600'
										}>
										{a.message}
									</span>
									<span className='text-xs text-muted-foreground'>
										{a.date}
									</span>
								</li>
							))}
						</ul>
					</CardContent>
				</Card>
			</div>

			<Separator className='my-8' />

			<Card>
				<CardHeader>
					<CardTitle>At a glance</CardTitle>
					<CardDescription>Snapshot of portfolio companies.</CardDescription>
				</CardHeader>
				<CardContent className='grid gap-4 md:grid-cols-2'>
					{mockCompanies.map((c) => (
						<div key={c.id} className='rounded-md border p-4'>
							<div className='flex items-center justify-between'>
								<div>
									<div className='font-medium'>{c.company}</div>
									<div className='text-xs text-muted-foreground'>
										{c.sector} • {c.stage}
									</div>
								</div>
								<div className='text-xs font-medium text-primary'>{c.ask}</div>
							</div>
							<div className='mt-2 text-sm text-muted-foreground line-clamp-2'>
								{c.description}
							</div>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
