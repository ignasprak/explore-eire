'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/app/lib/supabaseClient';
import { useAuth } from '@/app/lib/authContext';

export type Trip = {
    id: string;
    name: string;
    created_at: string;
    user_trips?: UserTrip[];
};

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
};

const TripsContext = createContext<TripsContextType>({
    trips: [],
    createTrip: async () => { },
    refetchTrips: async () => { },
    deleteTrip: async () => { },
});


export const TripsProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [trips, setTrips] = useState<Trip[]>([]);

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

    useEffect(() => {
        fetchTrips();
    }, [user]);

    return (
        <TripsContext.Provider value={{ trips, createTrip, refetchTrips: fetchTrips, deleteTrip }}>
            {children}
        </TripsContext.Provider>
    );
};

export const useTripsContext = () => {
    const context = useContext(TripsContext);
    if (!context) throw new Error('useTripsContext must be used within TripsProvider');
    return context;
};
