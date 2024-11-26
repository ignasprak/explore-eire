"use client"

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

// sett Mapbox access token
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
    const [selectedCounty, setSelectedCounty] = useState<string>('All');

    // initialise Mapbox map
    useEffect(() => {
        if (mapContainerRef.current && !map) {
            console.log('Initializing map...');
            const mapInstance = new mapboxgl.Map({
                container: mapContainerRef.current,
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [-8.24389, 53.41291], // Centered on Ireland
                zoom: 6.5,
            });

            // zoom and rotation controls to the map with customized zoomDelta.
            mapInstance.addControl(new mapboxgl.NavigationControl({}), 'top-right');

            setMap(mapInstance);
        }
    }, [map]);

    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
            .mapboxgl-popup-close-button:hover {
                box-shadow: none !important;
                background-color: transparent !important;
            }
        `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    // update markers when locations, filter, or county changes
    useEffect(() => {
        if (map) {
            // remove existing markers
            markers.forEach(marker => marker.remove());

            // new markers based on the selected filter and county
            const newMarkers = locations
                .filter(location =>
                    (selectedFilter === 'All' || location.Tags.includes(selectedFilter)) &&
                    (selectedCounty === 'All' || location.County === selectedCounty)
                )
                .map(location => {
                    const marker = new mapboxgl.Marker()
                        .setLngLat([location.Longitude, location.Latitude])
                        .setPopup(
                            new mapboxgl.Popup({ offset: 20, maxWidth: '400px', closeButton: true, closeOnClick: true, closeOnMove: false })
                                .setHTML(`
                                    <h2 style="font-size: 26px;"><strong>${location.Name}</strong></h2> <br>
                                    <p><strong>County:</strong> ${location.County}</p> <br>
                                    <p><strong>Tags:</strong> ${location.Tags.split(',').map(tag => `<span style="display: inline-block; margin-right: 10px; padding: 2px 5px; background-color: #e0e0e0; border-radius: 3px;">${tag.trim()}</span>`).join(' ')}</p> <br>
                                    <a href="${location.Url}" target="_blank" style="font-size: 18px; color: blue;">Visit Website</a> <br> <br>
                                    <button style="background-color: #83b271; padding: 10px 20px; font-size: 16px; border: none; border-radius: 5px; cursor: pointer;">Mark as Completed</button>
                                `)
                                .on('open', () => {
                                    const popup = document.querySelector('.mapboxgl-popup');
                                    if (popup) {
                                        const closeButton = popup.querySelector('.mapboxgl-popup-close-button');
                                        if (closeButton) {
                                            (closeButton as HTMLElement).style.fontSize = '50px'; // adjust size 
                                        }
                                    }
                                })
                        )
                        .addTo(map);
                    return marker;
                });

            setMarkers(newMarkers);
        }
    }, [locations, selectedFilter, selectedCounty, map]);

    return (
        <div className="flex">
            {/* filter Section */}
            <div className="w-1/6 p-4 mr-2">
                <h2 className="mb-4">Filter by Tag:</h2>
                <select id="tag-filter" value={selectedFilter} onChange={(e) => setSelectedFilter(e.target.value)} className="w-full p-2 border rounded">
                    <option value="All">All</option>
                    <option value="Activity">Activity</option>
                    <option value="Beach">Beach</option>
                    <option value="Castle">Castle</option>
                    <option value="Experience">Experience</option>
                    <option value="Fishing">Fishing</option>
                    <option value="Food">Food</option>
                    <option value="Golf">Golf</option>
                    <option value="Historic">Historic</option>
                    <option value="Learning">Learning</option>
                    <option value="Nature">Nature</option>
                    <option value="Tour">Tour</option>
                    <option value="Venue">Venue</option>
                    <option value="Walking">Walking</option>
                </select>

                <h2 className="mt-4 mb-4">Filter by County:</h2>
                <select id="county-filter" value={selectedCounty} onChange={(e) => setSelectedCounty(e.target.value)} className="w-full p-2 border rounded">
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