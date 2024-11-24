"use client"

import { useEffect, useRef, useState } from 'react';
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
    const [map, setMap] = useState<mapboxgl.Map | null>(null);
    const [markers, setMarkers] = useState<mapboxgl.Marker[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<string>('All');

    // Initialize Mapbox map
    useEffect(() => {
        if (mapContainerRef.current && !map) {
            console.log('Initializing map...');
            const mapInstance = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [-8.24389, 53.41291], // Centered on Ireland
                zoom: 6.5,
            });

            setMap(mapInstance);
        }
    }, [map]);

    // Update markers when locations or filter changes
    useEffect(() => {
        if (map) {
            // Remove existing markers
            markers.forEach(marker => marker.remove());

            // Add new markers based on the selected filter
            const newMarkers = locations
                .filter(location => selectedFilter === 'All' || location.Tags.includes(selectedFilter))
                .map(location => {
                    const marker = new mapboxgl.Marker()
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
                    return marker;
                });

            setMarkers(newMarkers);
        }
    }, [locations, selectedFilter, map]);

    return (
        <div className="flex">
            {/* filter Section */}
            <div className="w-1/6 p-4 mr-2">
                <h2 className="mb-4">Filter by Tag:</h2>
                <select id="filter" value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)} className="w-full p-2 border rounded">
                    <option value="All">All</option>
                    <option value="Scenic">Scenic</option>
                    <option value="Nature">Nature</option>
                    <option value="Historic">Historic</option>
                    <option value="Activity">Activity</option>
                    <option value="Experience">Experience</option>
                    <option value="Castle">Castle</option>
                    <option value="Food">Food</option>
                    <option value="Sea">Sea</option>
                </select>

                <h2 className="mt-4 mb-4">Filter by County:</h2>
                <select id="filter" value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)} className="w-full p-2 border rounded">
                    <option value="All">All</option>
                    <option value="Carlow">Carlow</option>
                    <option value="Cavan">Cavan</option>
                    <option value="Clare">Clare</option>
                    <option value="Cork">Cork</option>
                    <option value="Donegal">Donegal</option>
                    <option value="Dublin">Dublin</option>
                    <option value="Galway">Galway</option>
                    <option value="Kerry">Kerry</option>
                    <option value="Kildare">Kildare</option>
                    <option value="Kilkenny">Kilkenny</option>
                    <option value="Laois">Laois</option>
                    <option value="Leitrim">Leitrim</option>
                    <option value="Limerick">Limerick</option>
                    <option value="Longford">Longford</option>
                    <option value="Louth">Louth</option>
                    <option value="Mayo">Mayo</option>
                    <option value="Meath">Meath</option>
                    <option value="Monaghan">Monaghan</option>
                    <option value="Offaly">Offaly</option>
                    <option value="Roscommon">Roscommon</option>
                    <option value="Sligo">Sligo</option>
                    <option value="Tipperary">Tipperary</option>
                    <option value="Waterford">Waterford</option>
                    <option value="Westmeath">Westmeath</option>
                    <option value="Wexford">Wexford</option>
                    <option value="Wicklow">Wicklow</option>
                </select>

            </div>

            {/* Map Container */}
            <div ref={mapContainerRef} className="map-container w-full h-[56.5rem]" />
        </div>
    );
};

export default Map;