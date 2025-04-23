'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { useAuth } from '@/app/lib/authContext';
import type { Location } from '@/types/location';

// shape of a Trip 
export type Trip = {
    id: string;
    name: string;
    created_at: string;
    user_trips?: UserTrip[];
};

// shape of an individual item in a Trip
export type UserTrip = {
    trip_id: string;
    location_id: string;
    day?: number;
    position?: number;
    attractions: {
        id: string;
        Name: string;
        Address: string;
        Url?: string;
        Telephone?: string;
        County?: string;
        Latitude?: number;
        Longitude?: number;
        Tags?: string;
    };
};

type TripsContextType = {
    trips: Trip[];
    createTrip: (name: string) => Promise<void>;
    refetchTrips: () => Promise<void>;
    deleteTrip: (tripId: string) => Promise<void>;
    addToTrip: (tripId: string, location: Location, day?: number) => Promise<void>;
};

const TripsContext = createContext<TripsContextType>({
    trips: [],
    createTrip: async () => { },
    refetchTrips: async () => { },
    deleteTrip: async () => { },
    addToTrip: async () => { },
});

export const TripsProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [trips, setTrips] = useState<Trip[]>([]);

    // fetch all of the user's trips and their associated attractions
    const fetchTrips = async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from('trips')
            .select(`
            *,
            user_trips (
              *,
              attractions (
                id,
                Name,
                Latitude,
                Longitude,
                Address,
                Url
              )
            )
          `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Failed to fetch trips:', error);
        } else {
            setTrips(data);
        }
    };

    // new trip for the logged in user
    const createTrip = async (name: string) => {
        if (!user) return;
        const { error } = await supabase
            .from('trips')
            .insert({ name, user_id: user.id });

        if (error) {
            console.error('Failed to create trip:', error);
        } else {
            await fetchTrips();
        }
    };

    // delete trip by ID and refresh the list
    const deleteTrip = async (tripId: string) => {
        const { error } = await supabase
            .from('trips')
            .delete()
            .eq('id', tripId);

        if (error) {
            console.error('Error deleting trip:', error);
        } else {
            await fetchTrips();
        }
    };

    // add an attraction to a specific day of a trip
    const addToTrip = async (tripId: string, location: Location, day = 0) => {
        if (!user) return;

        const current = trips
            .find(t => t.id === tripId)
            ?.user_trips
            .filter(ut => (ut.day ?? 0) === day);

        const position = (current?.length ?? 0);

        const { error } = await supabase
            .from('user_trips')
            .insert([{
                trip_id: tripId,
                location_id: location.id,
                day,
                position
            }]);

        if (error) {
            console.error('Failed to add to trip:', error.message);
            return;
        }

        await fetchTrips();
    };

    // initial load / on login change
    useEffect(() => {
        fetchTrips();
    }, [user]);

    return (
        <TripsContext.Provider value={{ trips, createTrip, refetchTrips: fetchTrips, deleteTrip, addToTrip }}>
            {children}
        </TripsContext.Provider>
    );
};

export const useTripsContext = () => {
    const context = useContext(TripsContext);
    if (!context) throw new Error('useTripsContext must be used within TripsProvider');
    return context;
};
