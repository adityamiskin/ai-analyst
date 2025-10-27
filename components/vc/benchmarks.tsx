"use client";

import AIVisualizations, { CompanyWithId } from "./ai-visualizations";
import { CompanySnapshot } from "./snapshot";

interface BenchmarksProps {
  company: CompanyWithId | CompanySnapshot;
}

export default function Benchmarks({ company }: BenchmarksProps) {
  return <AIVisualizations company={company} />;
}
