"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { useAuth } from "@/app/lib/authContext";
import { Location } from "@/types/location";

export interface Collection {
    id: string;
    name: string;
    user_id: string;
    user_collections?: any[];
}

interface CollectionsContextType {
    collections: Collection[];
    refetchCollections: () => Promise<void>;
    createCollection: (name: string, location?: Location) => Promise<void>;
    deleteCollection: (id: string) => Promise<void>;
    addToCollection: (collectionId: string, location: Location) => Promise<void>;
}

// createContext but make it typesafe 
const CollectionsContext = createContext<CollectionsContextType | undefined>(undefined);

// hook to access the collections context (thrown if used outside the provider)
export const useCollectionsContext = () => {
    const context = useContext(CollectionsContext);
    if (!context) {
        throw new Error("useCollectionsContext must be used inside CollectionsProvider");
    }
    return context;
};

// the provider
export function CollectionsProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [collections, setCollections] = useState<Collection[]>([]);

    // refresh collections every 3 seconds
    useEffect(() => {
        refetchCollections();

        const interval = setInterval(() => {
            refetchCollections();
        }, 3000);

        return () => clearInterval(interval);
    }, [user?.id]);

    // grabs all the user's collections
    const refetchCollections = async () => {
        if (!user?.id) return;

        const { data, error } = await supabase
            .from("collections")
            .select(`
            id,
            name,
            user_id,
            user_collections (
              location_id,
              attractions (
                id, Name, Address, County, Url, Telephone, Tags, Latitude, Longitude
              )
            )
          `)
            .eq("user_id", user.id);

        if (error) {
            console.error("Failed to fetch collections", error.message);
            return;
        }

        setCollections(data || []);
    };

    // create a new collection, with an attraction if done through the popup
    const createCollection = async (name: string, location?: Location) => {
        if (!user?.id) return;

        try {
            const { data, error } = await supabase
                .from("collections")
                .insert([{ name, user_id: user.id }])
                .select()
                .single();

            if (error || !data) {
                console.error("Error creating collection:", error?.message);
                return;
            }

            // if there is an attraction involved
            if (location) {
                const { error: addError } = await supabase.from("user_collections").insert([
                    {
                        collection_id: data.id,
                        location_id: location.id,
                        user_id: user.id,
                    },
                ]);

                if (addError) {
                    console.error("Error adding initial location to collection:", addError.message);
                }
            }

            await refetchCollections?.();
        } catch (err) {
            console.error("Unexpected error during collection creation:", err);
        }
    };

    // off to the void you go
    const deleteCollection = async (id: string) => {
        const { error } = await supabase.from("collections").delete().eq("id", id);
        if (error) {
            console.error("Error deleting collection:", error.message);
        } else {
            setCollections((prev) => prev.filter((c) => c.id !== id));
        }
    };

    // drop an attraction into a collection
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

        const { error } = await supabase.from("user_collections").insert([newEntry]);

        if (error) {
            console.error("Error adding to collection:", error.message);
        }
    };

    // all collection related powers bundled and passed to the main
    return (
        <CollectionsContext.Provider
            value={{
                collections,
                refetchCollections,
                createCollection,
                deleteCollection,
                addToCollection,
            }}
        >
            {children}
        </CollectionsContext.Provider>
    );
}
