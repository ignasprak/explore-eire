export interface TripItem {
    location_id: string;
    day: number;
    position: number;
    [key: string]: any;
}

export interface TripAttractionListProps {
    tripId: string;
    items: TripItem[];
    setItems: (items: TripItem[]) => void;
    onSelect: (item: TripItem) => void;
    onRemove: (item: TripItem) => void;
    refetchTrips: () => Promise<void>;
}
