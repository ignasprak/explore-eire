import Navbar from '../../../components/navbar';
import { supabase } from '../../lib/supabaseClient';

interface Collection {
    id: string;
    name: string;
    created_at: string;
}

export default async function CollectionsPage({ params }: { params: { userId: string } }) {
    const { userId } = params;

    // Fetch collections for the user
    const { data: collections, error } = await supabase
        .from('collections')
        .select('*')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching collections:', error.message);
        return <p className="text-red-500">Failed to load collections.</p>;
    }

    if (!collections || collections.length === 0) {
        return <p className="text-gray-600">No collections found for this user.</p>;
    }

    return (
        <div>
            <Navbar />
            <div className="container mx-auto py-8 bg-tertiary m-10 p-10 rounded">
                <h1 className="text-2xl font-bold mb-4">Your Collections</h1>
                <ul className="space-y-4">
                    {collections.map((collection: Collection) => (
                        <li
                            key={collection.id}
                            className="p-4 border rounded-md shadow-sm hover:shadow-lg transition-shadow"
                        >
                            <h2 className="text-lg font-semibold">{collection.name}</h2>
                            <p className="text-sm text-gray-500">Created at: {new Date(collection.created_at).toLocaleString()}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
