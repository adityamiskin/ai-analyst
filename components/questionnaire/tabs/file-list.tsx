'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';

export type FileRef = { name: string; size: number };

function humanSize(bytes: number) {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileList({ files }: { files: FileRef[] }) {
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
