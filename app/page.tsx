'use client';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';

export default function Page() {
	return (
		<main className='container mx-auto max-w-5xl px-4 py-16 flex flex-col items-center justify-center min-h-screen'>
			<Card className='w-full max-w-md shadow-lg'>
				<CardHeader>
					<CardTitle className='text-center text-2xl font-bold'>
						Choose Your Role
					</CardTitle>
					<CardDescription className='text-center'>
						Select whether you are a Founder or a VC to continue.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='flex flex-col gap-6 mt-4'>
						<Button asChild size='lg' className='w-full'>
							<Link href='/founder'>Founder</Link>
						</Button>
						<Button asChild size='lg' variant='secondary' className='w-full'>
							<Link href='/vc'>VC</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</main>
	);
}
