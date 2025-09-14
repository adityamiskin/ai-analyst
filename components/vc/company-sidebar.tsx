'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Search, Building2, DollarSign, Calendar, X, Home } from 'lucide-react';
import { mockCompanies } from '@/lib/mock';
import Link from 'next/link';

export function CompanySidebar() {
	const params = useParams() as { id?: string } | undefined;
	const currentCompanyId = params?.id ?? '';
	const [searchQuery, setSearchQuery] = useState('');

	const filteredCompanies = useMemo(() => {
		if (!searchQuery.trim()) {
			return mockCompanies;
		}

		const query = searchQuery.toLowerCase();
		return mockCompanies.filter(
			(company) =>
				company.company.toLowerCase().includes(query) ||
				company.sector.toLowerCase().includes(query) ||
				company.description.toLowerCase().includes(query),
		);
	}, [searchQuery]);

	const clearSearch = () => {
		setSearchQuery('');
	};

	return (
		<Sidebar className='w-96'>
			<SidebarHeader className='border-b border-sidebar-border p-6'>
				<div className='flex items-center justify-between'>
					<h2 className='text-xl font-semibold'>Portfolio Companies</h2>
					<Link
						href={'/vc'}
						aria-label='Home'
						className='rounded-md p-2 hover:bg-sidebar-accent text-sidebar-foreground'>
						<Home className='h-5 w-5' />
					</Link>
				</div>
				<p className='text-sm text-muted-foreground mt-1'>
					{mockCompanies.length} companies in pipeline
				</p>

				{/* Search Bar */}
				<div className='relative mt-4'>
					<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
					<Input
						placeholder='Search companies...'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className='pl-9 pr-9 h-9 bg-background'
					/>
					{searchQuery && (
						<button
							onClick={clearSearch}
							className='absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground'>
							<X className='h-4 w-4' />
						</button>
					)}
				</div>

				{searchQuery && (
					<p className='text-xs text-muted-foreground mt-2'>
						{filteredCompanies.length} result
						{filteredCompanies.length !== 1 ? 's' : ''} found
					</p>
				)}
			</SidebarHeader>

			<SidebarContent className='px-4 py-4'>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu className='gap-2'>
							{filteredCompanies.length === 0 ? (
								<div className='text-center py-8 text-muted-foreground'>
									<Search className='h-8 w-8 mx-auto mb-2 opacity-50' />
									<p className='text-sm'>No companies found</p>
									<p className='text-xs'>Try adjusting your search</p>
								</div>
							) : (
								filteredCompanies.map((company) => (
									<SidebarMenuItem key={company.id}>
										<SidebarMenuButton
											asChild
											isActive={company.id === currentCompanyId}
											className='w-full p-4 h-auto'>
											<Link href={`/vc/${company.id}`}>
												<div className='flex flex-col items-start gap-3 w-full'>
													<div className='flex items-center justify-between w-full'>
														<div className='flex items-center gap-3'>
															<div className='w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center'>
																<Building2 className='h-5 w-5 text-primary' />
															</div>
															<div>
																<h3 className='font-semibold text-sm'>
																	{company.company}
																</h3>
																<p className='text-xs text-muted-foreground'>
																	{company.sector}
																</p>
															</div>
														</div>
														<span className='px-2 py-1 bg-muted rounded text-xs font-medium'>
															{company.stage}
														</span>
													</div>

													<p className='text-xs text-muted-foreground leading-relaxed'>
														{company.description}
													</p>

													<div className='flex items-center justify-between w-full'>
														<div className='flex items-center gap-4 text-xs text-muted-foreground'>
															{company.metrics.length > 0 && (
																<div className='flex items-center gap-1'>
																	<DollarSign className='h-3 w-3' />
																	<span>
																		{company.metrics.find(
																			(m) => m.key === 'mrr',
																		)?.value || 0}
																		{company.metrics.find(
																			(m) => m.key === 'mrr',
																		)?.unit || ''}
																		k MRR
																	</span>
																</div>
															)}
															<div className='flex items-center gap-1'>
																<Calendar className='h-3 w-3' />
																<span>{company.lastUpdated}</span>
															</div>
														</div>
														<span className='text-xs font-medium text-primary'>
															{company.ask}
														</span>
													</div>
												</div>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))
							)}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
