type Attraction = {
    id: string;
    Name: string;
    Address: string;
    Url?: string;
    Telephone?: string;
};

type UserCollection = {
    location_id: string;
    attractions: Attraction;
};

type Collection = {
    id: string;
    name: string;
    created_at: string;
    user_collections: UserCollection[];
};
