export interface Location {
    name: string;
    id: string;
    url: string;
    telephone: string;
    latitude: number;
    longitude: number;
    address: string;
    county: string;
    tags: string;
    markerIcon?: string;
}

export type RawLocation = {
    id: string;
    name?: string;
    Name?: string;
    county?: string;
    County?: string;
    address?: string;
    Address?: string;
    telephone?: string;
    Telephone?: string;
    url?: string;
    Url?: string;
    tags?: string;
    Tags?: string;
    latitude?: number;
    Latitude?: number;
    longitude?: number;
    Longitude?: number;
    markerIcon?: string;
};