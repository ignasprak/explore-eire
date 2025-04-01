'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Location } from '@/types/location';
import { fromLonLat } from 'ol/proj';

const MapContext = createContext<MapContextType | undefined>(undefined);

type MapContextType = {
    locations: Location[];
    setLocations: (locations: Location[]) => void;
    focusOnLocation: (lat: number, lng: number) => void;
};

export const MapProvider = ({ children }: { children: ReactNode }) => {
    const [locations, setLocations] = useState<Location[]>([]);

    const focusOnLocation = (lat: number, lng: number) => {
        // Optional: add your OpenLayers map logic here if you have a shared map instance
        console.warn("focusOnLocation called, but map instance not shared here.");
    };

    return (
        <MapContext.Provider value={{ locations, setLocations, focusOnLocation }}>
            {children}
        </MapContext.Provider>
    );
};

export const useMap = () => {
    const context = useContext(MapContext);
    if (!context) {
        throw new Error('useMap must be used within a MapProvider');
    }
    return context;
};
