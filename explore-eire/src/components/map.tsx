"use client"

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

// Set Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY || 'pk.eyJ1IjoiaHVudGhhd2sxMSIsImEiOiJjbTN1anQ5a2wwa3BuMmxzN2k2bXhucnc2In0.MtdX1gZtTkXvDtb1RxWtuA';

interface Location {
    Name: string;
    id: string;
    Url: string;
    Telephone: string;
    Latitude: number;
    Longitude: number;
    Address: string;
    County: string;
    Tags: string;
}

const Map = ({ locations }: { locations: Location[] }) => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);

    // Initialize Mapbox map after data is fetched
    useEffect(() => {
        if (mapContainerRef.current && locations.length > 0) {
            console.log('Initialising map...');
            const map = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [-8.24389, 53.41291], // Centered on Ireland
                zoom: 6.5,
            });

            // Add markers for each location
            locations.forEach((location) => {
                new mapboxgl.Marker()
                    .setLngLat([location.Longitude, location.Latitude])
                    .setPopup(
                        new mapboxgl.Popup({ offset: 25 }).setHTML(`
                            <h3>${location.Name}</h3>
                            <p>${location.Address}</p>
                            <p><strong>County:</strong> ${location.County}</p>
                            <p><strong>Tags:</strong> ${location.Tags}</p>
                            <a href="${location.Url}" target="_blank">Visit Website</a>
                        `)
                    )
                    .addTo(map);
            });

            return () => map.remove();
        }
    }, [locations]);

    return <div ref={mapContainerRef} className="w-full h-[56.5rem]" />;
};

export default Map;