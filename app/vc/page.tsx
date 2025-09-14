import { redirect } from 'next/navigation';

export default function VCPage() {
	// Redirect to the first company by default
	redirect('/vc/acme-ai');
}
