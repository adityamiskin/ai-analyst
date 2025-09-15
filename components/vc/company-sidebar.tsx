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
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Link from 'next/link';

export function CompanySidebar() {
	const params = useParams() as { id?: string } | undefined;
	const currentCompanyId = params?.id ?? '';
	const [searchQuery, setSearchQuery] = useState('');

	const applications = useQuery(api.founders.listAllApplications);

	const filteredCompanies = useMemo(() => {
		const list = applications ?? [];
		if (!searchQuery.trim()) return list;
		const query = searchQuery.toLowerCase();
		return list.filter((app: any) => {
			const companyName = app.company?.name?.toLowerCase?.() ?? '';
			const stage = app.company?.stage?.toLowerCase?.() ?? '';
			const oneLiner = app.company?.oneLiner?.toLowerCase?.() ?? '';
			const founders = Array.isArray(app.team?.founders)
				? app.team.founders.map((f: any) =>
						`${f.name} ${f.email}`.toLowerCase(),
				  )
				: [];
			return (
				companyName.includes(query) ||
				stage.includes(query) ||
				oneLiner.includes(query) ||
				founders.some((t: string) => t.includes(query))
			);
		});
	}, [applications, searchQuery]);

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
					{applications ? applications.length : 0} companies in pipeline
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
							{applications === undefined ? (
								<div className='text-center py-8 text-muted-foreground'>
									<Search className='h-8 w-8 mx-auto mb-2 opacity-50' />
									<p className='text-sm'>Loading companies…</p>
								</div>
							) : filteredCompanies.length === 0 ? (
								<div className='text-center py-8 text-muted-foreground'>
									<Search className='h-8 w-8 mx-auto mb-2 opacity-50' />
									<p className='text-sm'>No companies found</p>
									<p className='text-xs'>Try adjusting your search</p>
								</div>
							) : (
								filteredCompanies.map((app) => (
									<SidebarMenuItem key={app._id}>
										<SidebarMenuButton
											asChild
											isActive={`${app._id}` === currentCompanyId}
											className='w-full p-4 h-auto'>
											<Link href={`/vc/${app._id}`}>
												<div className='flex flex-col items-start gap-3 w-full'>
													<div className='flex items-center justify-between w-full'>
														<div className='flex items-center gap-3'>
															<div className='w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center'>
																<Building2 className='h-5 w-5 text-primary' />
															</div>
															<div>
																<h3 className='font-semibold text-sm'>
																	{app.company.name}
																</h3>
																<p className='text-xs text-muted-foreground'>
																	{app.company.location}
																</p>
															</div>
														</div>
														<span className='px-2 py-1 bg-muted rounded text-xs font-medium'>
															{app.company.stage}
														</span>
													</div>

													<p className='text-xs text-muted-foreground leading-relaxed'>
														{app.company.oneLiner ??
															app.product.description ??
															''}
													</p>

													<div className='flex items-center justify-between w-full'>
														<div className='flex items-center gap-4 text-xs text-muted-foreground'>
															{app.traction?.mrr && (
																<div className='flex items-center gap-1'>
																	<DollarSign className='h-3 w-3' />
																	<span>{app.traction.mrr} MRR</span>
																</div>
															)}
															<div className='flex items-center gap-1'>
																<Calendar className='h-3 w-3' />
																<span>
																	{app.updatedAt
																		? new Date(
																				app.updatedAt,
																		  ).toLocaleDateString()
																		: new Date(
																				app.createdAt,
																		  ).toLocaleDateString()}
																</span>
															</div>
														</div>
														<span className='text-xs font-medium text-primary'>
															View
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
