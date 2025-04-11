export interface Attraction {
    id: number;
    Name: string;
    Address: string;
    Url?: string;
    Telephone?: string;
}

export interface UserCollection {
    location_id: string;
    attractions: Attraction;
}

export interface Collection {
    id: string;
    name: string;
    created_at: string;
    user_collections: UserCollection[];
}
