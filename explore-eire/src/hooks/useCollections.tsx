import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { useAuth } from '@/app/lib/authContext';
import { Location } from '@/types/location';


export function useCollections() {
    const { user } = useAuth();
    const [collections, setCollections] = useState<any[]>([]);

    useEffect(() => {
        if (user) fetchUserCollections();
    }, [user]);

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
        try {
            const metadata = {
                name: location.Name,
                address: location.Address,
                latitude: location.Latitude,
                longitude: location.Longitude,
                tags: location.Tags,
            };

            const { error } = await supabase
                .from('user_collections')
                .insert([{ collection_id: collectionId, location_id: location.id, metadata }]);

            if (error) throw error;

            alert(`Attraction "${metadata.name}" added successfully!`);
        } catch (err) {
            console.error('Error adding attraction:', err);
            alert('Failed to add attraction.');
        }
    };

    const createCollection = async (collectionName: string, userId: string) => {
        try {
            const { data, error } = await supabase
                .from('collections')
                .insert([{ name: collectionName, user_id: userId }])
                .select('id')
                .single();

            if (error) throw error;

            alert(`Collection "${collectionName}" created successfully!`);
            fetchUserCollections(); // Refresh the collections list

            return data?.id;
        } catch (error) {
            console.error('Error creating collection:', error.message);
            alert('Failed to create collection.');
            return null;
        }
    };




    return { collections, addToCollection, fetchUserCollections, createCollection };

}
