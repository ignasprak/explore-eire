import Navbar from '../../../components/navbar';
import { supabase } from '../../lib/supabaseClient';
import CollectionsList from './CollectionsList';
import { Collection } from '@/types/types';

export async function generateStaticParams() {
    const { data: users, error } = await supabase.from('users').select('id');
    if (error || !users) return [];

    return users.map((user) => ({ userId: user.id }));
}

export default async function CollectionsPage({
    params,
}: {
    params: Promise<{ userId: string }>;
}) {
    const { userId } = await params;

    const { data: collections, error } = await supabase
        .from('collections')
        .select(`
    id,
    name,
    created_at,
    user_collections (
      location_id,
      attractions (
        id,
        Name,
        Address,
        Url,
        Telephone
      )
    )
  `)
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching collections:', error.message);
        return <p className="text-red-500">Failed to load collections.</p>;
    }

    const formattedCollections: Collection[] = (collections || []).map((collection) => ({
        ...collection,
        created_at: new Date(collection.created_at).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        }),
        user_collections: (collection.user_collections || []).map((uc) => ({
            ...uc,
            attractions: Array.isArray(uc.attractions) ? uc.attractions[0] : uc.attractions,
        })),
    }));

    return (
        <div>
            <Navbar />
            <div className="container mx-auto py-8 bg-tertiary m-10 p-10 rounded"></div>
            <h1 className="text-2xl font-bold mb-4">Your Collections</h1>
            <CollectionsList collections={formattedCollections || []} />
        </div>
    );
}
