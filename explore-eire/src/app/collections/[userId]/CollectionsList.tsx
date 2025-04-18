'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import type { Collection, UserCollection } from '@/types/types';

export default function CollectionsList({ collections }: { collections: Collection[] }) {
    const [localCollections, setLocalCollections] = useState(collections);

    async function handleDeleteAttraction(locationId: string, collectionId: string) {
        const confirmDelete = confirm('Are you sure you want to delete this attraction?');
        if (!confirmDelete) return;

        const { error } = await supabase
            .from('user_collections')
            .delete()
            .match({ location_id: locationId, collection_id: collectionId });

        if (error) {
            console.error('Error deleting attraction:', error.message);
            alert('Failed to delete the attraction. Please try again.');
        } else {
            alert('Attraction deleted successfully!');
            setLocalCollections((prevCollections) =>
                prevCollections.map((collection) =>
                    collection.id === collectionId
                        ? {
                            ...collection,
                            user_collections: collection.user_collections.filter(
                                (item: UserCollection) => item.location_id !== locationId
                            ),
                        }
                        : collection
                )
            );
        }
    }

    async function handleDeleteCollection(collectionId: string) {
        const confirmDelete = confirm(
            'Are you sure you want to delete this collection? All associated attractions will also be deleted.'
        );
        if (!confirmDelete) return;

        const { error } = await supabase
            .from('collections')
            .delete()
            .match({ id: collectionId });

        if (error) {
            console.error('Error deleting collection:', error.message);
            alert('Failed to delete the collection. Please try again.');
        } else {
            alert('Collection deleted successfully!');
            setLocalCollections((prevCollections) =>
                prevCollections.filter((collection) => collection.id !== collectionId)
            );
        }
    }

    return (
        <ul className="space-y-8">
            {localCollections.map((collection) => (
                <li
                    key={collection.id}
                    className="p-4 border rounded-md shadow-sm hover:shadow-lg transition-shadow"
                >
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold">{collection.name}</h2>
                        <button
                            onClick={() => handleDeleteCollection(collection.id)}
                            className="text-red-500 hover:underline text-sm"
                        >
                            Delete Collection
                        </button>
                    </div>
                    <p className="text-sm text-gray-500">
                        Created at: {collection.created_at}
                    </p>
                    {collection.user_collections?.length > 0 ? (
                        <div className="mt-4">
                            <h3 className="text-md font-semibold mb-2">Attractions in this Collection:</h3>
                            <ul className="space-y-2">
                                {collection.user_collections.map((item) => (
                                    <li
                                        key={item.location_id}
                                        className="p-3 border rounded-md bg-white shadow-sm flex justify-between items-center"
                                    >
                                        <div>
                                            <h4 className="font-semibold">{item.attractions.Name}</h4>
                                            <p className="text-sm">Address: {item.attractions.Address}</p>
                                            {item.attractions.Url && (
                                                <a
                                                    href={item.attractions.Url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 hover:underline text-sm"
                                                >
                                                    Visit Website
                                                </a>
                                            )}
                                            {item.attractions.Telephone && (
                                                <p className="text-sm">Phone: {item.attractions.Telephone}</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteAttraction(item.location_id, collection.id)}
                                            className="text-red-500 hover:underline text-sm ml-4"
                                        >
                                            Delete Attraction
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <p className="text-gray-500 mt-2">No attractions added to this collection.</p>
                    )}
                </li>
            ))}
        </ul>
    );
}
