'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuAction,
} from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import {
	Search,
	DollarSign,
	Calendar,
	X,
	Home,
	Trash2,
	Pin,
	PinOff,
} from 'lucide-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Doc, Id } from '@/convex/_generated/dataModel';
import Link from 'next/link';

type FounderApplication = Doc<'founderApplications'>;

export function CompanySidebar() {
	const params = useParams<{ id?: string }>();
	const router = useRouter();
	const currentCompanyId = params?.id;
	const [searchQuery, setSearchQuery] = useState('');
	const [pinnedCompanies, setPinnedCompanies] = useState<
		Set<Id<'founderApplications'>>
	>(new Set());

	const applications = useQuery(api.founders.listAllApplications);
	const deleteApplication = useMutation(api.founders.deleteApplication);

	const { pinnedCompanies: pinnedApps, unpinnedCompanies: unpinnedApps } =
		useMemo(() => {
			const list = applications ?? [];
			const pinned: FounderApplication[] = [];
			const unpinned: FounderApplication[] = [];

			// Separate pinned and unpinned companies
			list.forEach((app: FounderApplication) => {
				if (pinnedCompanies.has(app._id)) {
					pinned.push(app);
				} else {
					unpinned.push(app);
				}
			});

			// Apply search filter if there's a query
			if (searchQuery.trim()) {
				const query = searchQuery.toLowerCase();
				const filterApps = (apps: FounderApplication[]) =>
					apps.filter((app: FounderApplication) => {
						const companyName = app.company?.name?.toLowerCase?.() ?? '';
						const stage = app.company?.stage?.toLowerCase?.() ?? '';
						const oneLiner = app.company?.oneLiner?.toLowerCase?.() ?? '';
						const founders = Array.isArray(app.team?.founders)
							? app.team.founders.map((f) =>
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

				return {
					pinnedCompanies: filterApps(pinned),
					unpinnedCompanies: filterApps(unpinned),
				};
			}

			return {
				pinnedCompanies: pinned,
				unpinnedCompanies: unpinned,
			};
		}, [applications, searchQuery, pinnedCompanies]);

	const clearSearch = () => {
		setSearchQuery('');
	};

	const togglePin = (companyId: Id<'founderApplications'>) => {
		setPinnedCompanies((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(companyId)) {
				newSet.delete(companyId);
			} else {
				newSet.add(companyId);
			}
			return newSet;
		});
	};

	const handleDeleteCompany = async (
		companyId: Id<'founderApplications'>,
		companyName: string,
	) => {
		try {
			await deleteApplication({ id: companyId });
			// If we're currently viewing the deleted company, redirect to home
			if (currentCompanyId === companyId) {
				router.push('/vc');
			}
		} catch (error) {
			console.error('Failed to delete company:', error);
		}
	};

	const renderCompanyItem = (app: FounderApplication) => (
		<SidebarMenuItem key={app._id}>
			<SidebarMenuButton
				asChild
				variant='outline'
				isActive={app._id === currentCompanyId}
				className='w-full p-4 h-auto'>
				<Link href={`/vc/${app._id}`}>
					<div className='flex flex-col items-start gap-3 w-full'>
						<div className='flex items-center justify-between w-full'>
							<div>
								<h3 className='font-semibold text-sm'>{app.company.name}</h3>
								<p className='text-xs text-muted-foreground'>
									{app.company.location}
								</p>
							</div>
						</div>

						<p className='text-xs text-muted-foreground leading-relaxed'>
							{app.company.oneLiner ?? app.product.description ?? ''}
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
											? new Date(app.updatedAt).toLocaleDateString()
											: new Date(app.createdAt).toLocaleDateString()}
									</span>
								</div>
							</div>
							<Badge>{app.company.stage}</Badge>
						</div>
					</div>
				</Link>
			</SidebarMenuButton>

			{/* Action buttons - Pin and Delete */}
			<div className='absolute top-2 right-2 flex items-center gap-1'>
				<Button
					variant='ghost'
					size='sm'
					className='h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary'
					onClick={(e) => {
						e.preventDefault();
						togglePin(app._id);
					}}>
					{pinnedCompanies.has(app._id) ? (
						<PinOff className='h-3 w-3' />
					) : (
						<Pin className='h-3 w-3' />
					)}
				</Button>
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button
							variant='ghost'
							size='sm'
							className='h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive'>
							<Trash2 className='h-3 w-3' />
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Delete Company</AlertDialogTitle>
							<AlertDialogDescription>
								Are you sure you want to delete "{app.company.name}
								"? This action cannot be undone.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={() => handleDeleteCompany(app._id, app.company.name)}>
								Delete
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</SidebarMenuItem>
	);

	return (
		<Sidebar className='w-96'>
			<SidebarHeader>
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
						{pinnedApps.length + unpinnedApps.length} result
						{pinnedApps.length + unpinnedApps.length !== 1 ? 's' : ''} found
					</p>
				)}
			</SidebarHeader>

			<SidebarContent>
				{/* Pinned Companies Section */}
				{pinnedApps.length > 0 && (
					<SidebarGroup>
						<SidebarGroupLabel>
							<Pin className='h-4 w-4' />
							Pinned ({pinnedApps.length})
						</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>{pinnedApps.map(renderCompanyItem)}</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				)}

				{/* All Companies Section */}
				<SidebarGroup>
					<SidebarGroupLabel>
						{applications === undefined
							? 'Companies'
							: `All Companies (${unpinnedApps.length + pinnedApps.length})`}
					</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{applications === undefined ? (
								<div className='text-center py-8 text-muted-foreground'>
									<Search className='h-8 w-8 mx-auto mb-2 opacity-50' />
									<p className='text-sm'>Loading companies…</p>
								</div>
							) : pinnedApps.length + unpinnedApps.length === 0 ? (
								<div className='text-center py-8 text-muted-foreground'>
									<Search className='h-8 w-8 mx-auto mb-2 opacity-50' />
									<p className='text-sm'>No companies found</p>
									<p className='text-xs'>Try adjusting your search</p>
								</div>
							) : (
								unpinnedApps.map(renderCompanyItem)
							)}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
