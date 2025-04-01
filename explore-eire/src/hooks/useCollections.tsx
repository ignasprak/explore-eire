import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { useAuth } from '@/app/lib/authContext';
import { Location } from '@/types/location';
import { createContext, useContext } from 'react';

export function useCollections() {
    const { user } = useAuth();
    const [collections, setCollections] = useState<any[]>([]);
    const CollectionsContext = createContext<any>(null);

    useEffect(() => {
        if (user) fetchUserCollections();
    }, [user]);

    const fetchCollection = async (collectionId: string) => {
        const { data, error } = await supabase
            .from('user_collections')
            .select('*')
            .eq('collection_id', collectionId);

        if (error) console.error('Error fetching collection:', error.message);
        else {
            setCollections((prev) =>
                prev.map((collection) =>
                    collection.id === collectionId ? { ...collection, items: data } : collection
                )
            );
        }
    };

    const deleteCollection = async (collectionId: string) => {
        const { error } = await supabase.from("collections").delete().eq("id", collectionId);

        if (error) {
            console.error("Error deleting collection:", error.message);
        } else {
            setCollections((prev) => prev.filter((collection) => collection.id !== collectionId));
        }
    };

    const fetchUserCollections = async () => {
        if (!user?.id) return;
        const { data, error } = await supabase
            .from('collections')
            .select('id, name')
            .eq('user_id', user.id);

        if (error) console.error('Error fetching collections:', error.message);
        else setCollections(data || []);
    };

    const addToCollection = async (collectionId: string, location: Location) => {
        if (!user?.id) return;

        const newEntry = {
            collection_id: collectionId,
            location_id: location.id,
            user_id: user.id,
            metadata: {
                name: location.name,
                address: location.address,
                latitude: location.latitude,
                longitude: location.longitude,
                tags: location.tags,
            },
        };

        // Optimistically update UI before saving to Supabase
        setCollections((prev) =>
            prev.map((collection) =>
                collection.id === collectionId
                    ? { ...collection, items: [...(collection.items || []), newEntry] }
                    : collection
            )
        );

        // Save to Supabase
        const { error } = await supabase.from('user_collections').insert([newEntry]);

        if (error) {
            console.error('Error adding to collection:', error.message);
            // Revert UI update if the insert fails
            setCollections((prev) =>
                prev.map((collection) =>
                    collection.id === collectionId
                        ? { ...collection, items: collection.items.filter((item) => item.location_id !== location.id) }
                        : collection
                )
            );
        } else {
            console.log('Attraction added successfully!');
        }
    };

    const createCollection = async (collectionName: string) => {
        if (!user?.id) return;

        const tempId = Date.now().toString();
        const newCollection = { id: tempId, name: collectionName, user_id: user.id, items: [] };

        // Optimistically update UI
        setCollections((prev) => [...prev, newCollection]);

        // Save to Supabase
        const { data, error } = await supabase
            .from('collections')
            .insert([{ name: collectionName, user_id: user.id }])
            .select();

        if (error) {
            console.error('Error creating collection:', error.message);
            // Revert UI update if database operation fails
            setCollections((prev) => prev.filter((c) => c.id !== tempId));
        } else {
            console.log('Collection created successfully:', data);
            // Replace temporary collection with actual collection from Supabase
            setCollections((prev) =>
                prev.map((c) => (c.id === tempId ? { ...data[0], items: [] } : c))
            );
        }
    };

    return { collections, addToCollection, fetchUserCollections, createCollection, deleteCollection };

}