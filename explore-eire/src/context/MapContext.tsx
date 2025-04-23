'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Location } from '@/types/location';

// This context helps us keep track of attractions on the map
const MapContext = createContext<MapContextType | undefined>(undefined);

type MapContextType = {
    locations: Location[]; // the current set of attractions to show on the map
    setLocations: (locations: Location[]) => void; // function to update those attractions
    focusOnLocation: (lat: number, lng: number) => void; // in theory, zooms the map to a given spot (but not here)
};

export const MapProvider = ({ children }: { children: ReactNode }) => {
    const [locations, setLocations] = useState<Location[]>([]);

    // please never show up again (prop drilling)
    const focusOnLocation = (lat: number, lng: number) => {
        console.warn("focusOnLocation called, but map instance not shared here.");
    };

    return (
        <MapContext.Provider value={{ locations, setLocations, focusOnLocation }}>
            {children}
        </MapContext.Provider>
    );
};

// custom hook for data, throws if used outside of provider
export const useMap = () => {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error('useMap must be used within a MapProvider');
    }
    return context;
};
