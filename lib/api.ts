import { type FirebaseOptions } from 'firebase/app';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
	ensureAnonymousAuth,
	getFirebaseClientsFromEnv,
	initFirebase,
} from './firebase';

export type FileRef = { name: string; size: number };

export type YCApplication = {
	company: {
		name: string;
		website: string;
		location: string;
		oneLiner: string;
		stage: string;
		whatDoYouDo: string;
		whyNow: string;
		deck: FileRef[];
	};
	team: {
		founders: { name: string; email: string; designation: string }[];
		isFullTime: boolean;
		howLongWorked: string;
		relevantExperience: string;
	};
	product: {
		description: string;
		demoUrl: string;
		defensibility: string;
		videoUrl: string;
		videoFile: FileRef[];
		supportingDocs: FileRef[];
	};
	market: {
		customer: string;
		competitors: string;
		differentiation: string;
		gtm: string;
		tam: string;
		sam: string;
		som: string;
	};
	traction: {
		isLaunched: string;
		launchDate: string;
		mrr: string;
		growth: string;
		activeUsersCount: string;
		pilots: string;
		kpis: string;
		metricsCsv: FileRef[];
	};
	documents: {
		financialModel: FileRef[];
		capTable: FileRef[];
		incorporation: FileRef[];
		other: FileRef[];
	};
};

export type SubmitOptions = {
	firebase?: FirebaseOptions; // optional; falls back to env
	projectNamespace?: string; // e.g. 'ycApplications'
};

export async function submitApplication(
	form: YCApplication,
	options: SubmitOptions = {},
) {
	const { auth, db, storage } = options.firebase
		? initFirebase(options.firebase)
		: getFirebaseClientsFromEnv();
	await ensureAnonymousAuth(auth);

	const ns = options.projectNamespace ?? 'ycApplications';

	// Upload file-like references as placeholders (no real File objects in current UI)
	// In a real setup, wire actual File objects into the form and upload via uploadBytes
	const uploadList = async (path: string, list: FileRef[]) => {
		const uploaded: { name: string; size: number; url?: string }[] = [];
		for (const item of list) {
			const objectRef = ref(storage, `${path}/${item.name}`);
			// Upload an empty blob with metadata to create a stub; replace with real file
			await uploadBytes(objectRef, new Blob([]), {
				contentType: 'application/octet-stream',
			});
			const url = await getDownloadURL(objectRef);
			uploaded.push({ ...item, url });
		}
		return uploaded;
	};

	const uploads = {
		company: {
			deck: await uploadList(`${ns}/deck`, form.company.deck),
		},
		product: {
			videoFile: await uploadList(`${ns}/video`, form.product.videoFile),
			supportingDocs: await uploadList(
				`${ns}/product-supporting`,
				form.product.supportingDocs,
			),
		},
		traction: {
			metricsCsv: await uploadList(`${ns}/metrics`, form.traction.metricsCsv),
		},
		documents: {
			financialModel: await uploadList(
				`${ns}/financialModel`,
				form.documents.financialModel,
			),
			capTable: await uploadList(`${ns}/capTable`, form.documents.capTable),
			incorporation: await uploadList(
				`${ns}/incorporation`,
				form.documents.incorporation,
			),
			other: await uploadList(`${ns}/other`, form.documents.other),
		},
	};

	const docData = {
		...form,
		uploads,
		createdAt: serverTimestamp(),
	};

	const col = collection(db, ns);
	const refDoc = await addDoc(col, docData);
	return { id: refDoc.id };
}
