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
        if (!user?.id) {
            console.error("No user is logged in.");
            alert("You must be logged in to add to a collection.");
            return;
        }

        if (!location || !location.id) {
            console.error("Error: Missing location_id", location);
            alert("Invalid location. Please try again.");
            return;
        }

        try {
            console.log("Location before inserting metadata:", location);

            const metadata = {
                name: location.name,
                address: location.address,
                latitude: location.latitude,
                longitude: location.longitude,
                tags: location.tags,
            };

            console.log("Final metadata being inserted:", metadata);

            const { error } = await supabase
                .from("user_collections")
                .insert([{
                    collection_id: collectionId,
                    location_id: location.id,
                    user_id: user.id,
                    metadata: metadata,
                }]);

            if (error) {
                console.error("Supabase insert error:", error);
            } else {
                console.log("Inserted successfully!");
            }


            if (error) throw error;

            alert(`"${metadata.name}" added to collection successfully!`);
        } catch (err) {
            console.error("Error adding to collection:", err);
            alert("Failed to add attraction to collection.");
        }


    };

    const createCollection = async (collectionName: string) => {
        if (!user?.id) {
            console.error('No user is logged in. Cannot create collection.');
            alert('You must be logged in to create a collection.');
            return;
        }

        const { data, error } = await supabase
            .from('collections')
            .insert([
                { name: collectionName, user_id: user.id } // pass user_id here
            ])
            .select();

        if (error) {
            console.error('Error creating collection:', error.message);
            alert('Failed to create collection. Please try again.');
        } else {
            alert(`Collection "${collectionName}" created successfully!`);
        }
    };

    return { collections, addToCollection, fetchUserCollections, createCollection };




}
