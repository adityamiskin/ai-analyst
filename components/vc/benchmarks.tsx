'use client';

import AIVisualizations from './ai-visualizations';
import { CompanyWithId, CompanySnapshot } from '@/lib/mock';

interface BenchmarksProps {
	company?: CompanyWithId | CompanySnapshot;
}

export default function Benchmarks({ company }: BenchmarksProps) {
	return <AIVisualizations company={company} />;
}
