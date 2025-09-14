'use client';

import { useState } from 'react';
import {
	Card,
	CardHeader,
	CardContent,
	CardTitle,
	CardDescription,
} from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { mockSnapshot, CompanySnapshot } from '@/lib/mock';

type Weight = { key: string; label: string; weight: number };

interface FrameworksScorecardProps {
	company?: CompanySnapshot;
}

export default function FrameworksScorecard({
	company,
}: FrameworksScorecardProps) {
	const selectedCompany = company || mockSnapshot;
	const [weights, setWeights] = useState<Weight[]>([
		{ key: 'team', label: 'Team (30%)', weight: 30 },
		{ key: 'product', label: 'Product & Moat (25%)', weight: 25 },
		{ key: 'market', label: 'Market & Timing (20%)', weight: 20 },
		{ key: 'traction', label: 'Traction (15%)', weight: 15 },
		{ key: 'risks', label: 'Risks (−)', weight: 10 },
	]);

	// Simplified sample score calculation from mock metrics
	const mrr = selectedCompany.metrics.find((m) => m.key === 'mrr')?.value ?? 0;
	const growth =
		selectedCompany.metrics.find((m) => m.key === 'growth')?.value ?? 0;
	const baseScore =
		0.5 * Math.min(100, mrr / 0.5) + // arbitrary scaling for demo
		0.5 * Math.min(100, growth * 3);

	const riskPenalty = selectedCompany.risks.reduce(
		(acc, r) => acc + (r.severity === 'high' ? 15 : 7),
		0,
	);
	const totalWeight = weights.reduce((a, b) => a + b.weight, 0);
	const normalized = Math.max(
		0,
		Math.min(100, (baseScore / 200) * 100 - riskPenalty),
	);

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
							<div className='flex items-center justify-between text-sm'>
								<span className='font-medium'>{w.label}</span>
								<span className='text-muted-foreground'>{w.weight}%</span>
							</div>
							<Slider
								value={[w.weight]}
								min={0}
								max={50}
								step={1}
								onValueChange={([val]) =>
									setWeights((arr) =>
										arr.map((it, idx) =>
											idx === i ? { ...it, weight: val } : it,
										),
									)
								}
							/>
						</div>
					))}
					<Separator />
					<Button variant='secondary'>Reset to Default</Button>
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
