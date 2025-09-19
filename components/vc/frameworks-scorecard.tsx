'use client';

import { useState } from 'react';
import {
	Card,
	CardHeader,
	CardContent,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CompanySnapshot } from '@/lib/mock';

type Weight = { key: string; label: string; weight: number };

interface FrameworksScorecardProps {
	company?: CompanySnapshot;
}

export default function FrameworksScorecard({
	company,
}: FrameworksScorecardProps) {
	const selectedCompany = company || undefined;

	if (selectedCompany === undefined) {
		return null;
	}

	const [weights, setWeights] = useState<Weight[]>([
		{ key: 'team', label: 'Team', weight: 30 },
		{ key: 'product', label: 'Product & Moat', weight: 25 },
		{ key: 'market', label: 'Market & Timing', weight: 20 },
		{ key: 'traction', label: 'Traction', weight: 25 },
	]);

	console.log(selectedCompany.metrics);

	// Score calculation using available metrics
	const mrr =
		selectedCompany.metrics.find((m) => m.key === 'mrr_usd')?.value ?? 0;
	const growth =
		selectedCompany.metrics.find((m) => m.key === 'growth_mom_pct')?.value ?? 0;
	const activeUsers =
		selectedCompany.metrics.find((m) => m.key === 'active_users')?.value ?? 0;
	const arpu =
		selectedCompany.metrics.find((m) => m.key === 'arpu_usd')?.value ?? 0;
	const daysSinceLaunch =
		selectedCompany.metrics.find((m) => m.key === 'days_since_launch')?.value ??
		0;

	// Calculate individual metric scores
	const mrrScore = Math.min(100, (mrr / 1000) * 10); // $5k = 50 points
	const growthScore = Math.min(100, growth * 5); // 15% = 75 points
	const userScore = Math.min(100, (activeUsers / 100) * 10); // 500 users = 50 points
	const arpuScore = Math.min(100, arpu * 5); // $10 ARPU = 50 points
	const maturityScore = Math.min(100, (daysSinceLaunch / 365) * 100); // Time in market

	// Get weights and normalize them to 100%
	const totalWeight = weights.reduce((a, b) => a + b.weight, 0);
	const tractionWeight = weights.find((w) => w.key === 'traction')?.weight || 0;
	const productWeight = weights.find((w) => w.key === 'product')?.weight || 0;
	const marketWeight = weights.find((w) => w.key === 'market')?.weight || 0;
	const teamWeight = weights.find((w) => w.key === 'team')?.weight || 0;

	// Calculate weighted score (normalized to 100%)
	const baseScore =
		((tractionWeight / totalWeight) *
			100 *
			(mrrScore * 0.4 + growthScore * 0.4 + userScore * 0.2)) /
			100 + // Traction metrics
		((productWeight / totalWeight) *
			100 *
			(arpuScore * 0.7 + maturityScore * 0.3)) /
			100 + // Product metrics
		((marketWeight / totalWeight) * 100 * 75) / 100 + // Market score (placeholder)
		((teamWeight / totalWeight) * 100 * 60) / 100; // Team score (placeholder)

	// Calculate risk penalty (direct subtraction)
	const riskPenalty = selectedCompany.risks.reduce(
		(acc, r) => acc + (r.severity === 'high' ? 15 : 7),
		0,
	);
	const normalized = Math.max(0, Math.min(100, baseScore - riskPenalty));

	return (
		<div className='grid gap-4 md:grid-cols-2'>
			<Card>
				<CardHeader>
					<CardTitle>Framework Brief</CardTitle>
					<CardDescription>
						Uses a blended approach: McKinsey 7S (Team/Org), Porter’s Five
						Forces (Market/Moat), 5 Whys (Risk root-cause), and a weighted
						scorecard. Adjust weights to reflect thesis.
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-6'>
					{weights.map((w, i) => (
						<div key={w.key}>
							<div className='flex items-center justify-between text-sm mb-2'>
								<span className='font-medium'>{w.label}</span>
								<span className='text-muted-foreground'>%</span>
							</div>
							<Input
								type='number'
								min={0}
								max={100}
								value={w.weight}
								onChange={(e) => {
									const val = parseInt(e.target.value) || 0;
									setWeights((arr) =>
										arr.map((it, idx) =>
											idx === i ? { ...it, weight: val } : it,
										),
									);
								}}
								className='w-full'
							/>
						</div>
					))}
					{totalWeight !== 100 && (
						<Alert>
							<AlertDescription>
								Total weight is {totalWeight}% (should be 100%). Weights will be
								normalized proportionally.
							</AlertDescription>
						</Alert>
					)}
					<Separator />
					<Button
						variant='secondary'
						onClick={() =>
							setWeights([
								{ key: 'team', label: 'Team', weight: 30 },
								{ key: 'product', label: 'Product & Moat', weight: 25 },
								{ key: 'market', label: 'Market & Timing', weight: 20 },
								{ key: 'traction', label: 'Traction', weight: 25 },
							])
						}>
						Reset to Default
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Scorecard</CardTitle>
					<CardDescription>
						Composite score and recommendation derived from weights, benchmarks,
						and risk deductions.
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-3'>
					<div className='text-3xl font-semibold'>
						{Math.round(normalized)} / 100
					</div>
					<div className='text-sm text-muted-foreground'>
						Total weight: {totalWeight}%
					</div>
					<p className='text-sm'>
						Recommendation:{' '}
						{normalized >= 70 ? 'Yes' : normalized >= 55 ? 'Maybe' : 'No'}{' '}
						(auto), subject to partner discussion.
					</p>
				</CardContent>
			</Card>
		</div>
	);
}
