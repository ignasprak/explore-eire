import Navbar from '../../../components/navbar';
import { supabase } from '../../lib/supabaseClient';
import CollectionsList from './CollectionsList'; // Client Component

export default async function CollectionsPage({ params }: { params: { userId: string } }) {
    const { userId } = params;

    if (!userId) {
        return <p className="text-red-500">User ID is missing or invalid.</p>;
    }

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

    // Format dates as strings server-side
    const formattedCollections = collections?.map((collection) => ({
        ...collection,
        created_at: new Date(collection.created_at).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
        }),
    }));

    return (
        <div>
            <Navbar />
            <div className="container mx-auto py-8 bg-tertiary m-10 p-10 rounded">
                <h1 className="text-2xl font-bold mb-4">Your Collections</h1>
                <CollectionsList collections={formattedCollections || []} />
            </div>
        </div>
    );
}
