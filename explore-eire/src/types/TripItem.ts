export interface TripItem {
    id: string;
    location_id: string;
    day: number;
    position: number;
    attractions: {
        Name: string;
        Address: string;
    };
}
