// context to manage the currently selected attraction (used across collection/trip/map views)


'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type Attraction = {
    id: string;
    Name: string;
    Address: string;
    County?: string;
    Telephone?: string;
    Url?: string;
    Tags?: string;
    Latitude: number;
    Longitude: number;
    source?: 'collection' | 'trip';
    collectionId?: string;
    tripId?: string;
};

type SelectedAttractionContextType = {
    selectedAttraction: Attraction | null;
    setSelectedAttraction: (attraction: Attraction | null) => void;
};

const SelectedAttractionContext = createContext<SelectedAttractionContextType | undefined>(undefined);

export const SelectedAttractionProvider = ({ children }: { children: ReactNode }) => {
    const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);

    return (
        <SelectedAttractionContext.Provider value={{ selectedAttraction, setSelectedAttraction }}>
            {children}
        </SelectedAttractionContext.Provider>
    );
};

// hook to use anywhere, throws if used outside provider
export const useSelectedAttraction = () => {
    const context = useContext(SelectedAttractionContext);
    if (!context)
        throw new Error('useSelectedAttraction must be used within SelectedAttractionProvider');
    return context;
};
