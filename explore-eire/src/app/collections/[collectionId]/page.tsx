import { supabase } from '@/app/lib/supabaseClient';

const CollectionPage = async ({ params }: { params: { collectionId: string } }) => {
    const { collectionId } = params;

    console.log('Collection ID:', collectionId);

    // Fetch collection and items
    const { data: collectionData, error: collectionError } = await supabase
        .from('collections')
        .select(`
            id,
            name,
            user_collections (metadata)
        `)
        .eq('id', collectionId)
        .single();

    if (collectionError) {
        console.error('Error fetching collection:', collectionError.message);
        return <p>Collection not found.</p>;
    }

    const collection = {
        id: collectionData.id,
        name: collectionData.name,
        metadata: collectionData.user_collections.map((item: any) => item.metadata),
    };

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">{collection.name}</h1>
            {collection.metadata.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {collection.metadata.map((item, index) => (
                        <div
                            key={index}
                            className="border rounded-md p-4 shadow hover:shadow-lg"
                        >
                            <h2 className="text-lg font-semibold">{item.name}</h2>
                            <p>{item.address}</p>
                            <p>Tags: {item.tags.join(', ')}</p>
                            <p>Coordinates: {item.latitude}, {item.longitude}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No items in this collection yet.</p>
            )}
        </div>
    );
};

export default CollectionPage;
