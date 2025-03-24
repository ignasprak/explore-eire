'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Location } from '@/types/location';

type MapContextType = {
    locations: Location[];
    setLocations: (locations: Location[]) => void;
};

const MapContext = createContext<MapContextType | undefined>(undefined);

export const MapProvider = ({ children }: { children: ReactNode }) => {
    const [locations, setLocations] = useState<Location[]>([]);

    return (
        <MapContext.Provider value={{ locations, setLocations }}>
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
