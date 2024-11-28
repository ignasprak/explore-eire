"use client"

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useAuth } from '@/app/lib/authContext';
import { supabase } from '@/app/lib/supabaseClient';

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
    const [selectedCollection, setSelectedCollection] = useState<string>('');
    const [collectionMessage, setCollectionMessage] = useState<string | null>(null);
    const [addToCollectionMessage, setAddToCollectionMessage] = useState<string | null>(null);

    interface Collection {
        id: string;
        name: string;
        user_id: string;
    }

    const [collections, setCollections] = useState<Collection[]>([]);
    const { user } = useAuth();

    // Fetch collections for the signed-in user
    useEffect(() => {
        const fetchCollections = async () => {
            if (user) {
                const { data, error } = await supabase
                    .from('collections')
                    .select('*')
                    .eq('user_id', user.id);

                if (error) {
                    console.error('Error fetching collections:', error.message);
                } else {
                    setCollections(data);
                }
            }
        };

        fetchCollections();
    }, [user]);

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

            // Add zoom and rotation controls to the map
            mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');

            setMap(mapInstance);
        }
    }, [map]);

    // Update markers when locations, filter, or county changes
    useEffect(() => {
        if (map) {
            // Remove existing markers
            markers.forEach((marker) => marker.remove());

            // Add new markers based on the selected filter and county
            const newMarkers = locations
                .filter(
                    (location) =>
                        (selectedFilter === 'All' || location.Tags.includes(selectedFilter)) &&
                        (selectedCounty === 'All' || location.County === selectedCounty)
                )
                .map((location) => {
                    const marker = new mapboxgl.Marker()
                        .setLngLat([location.Longitude, location.Latitude])
                        .setPopup(
                            new mapboxgl.Popup({
                                offset: 20,
                                maxWidth: '400px',
                                closeButton: true,
                                closeOnClick: true,
                                closeOnMove: false,
                            })
                                .setHTML(`
                                    <h2 style="font-size: 26px;"><strong>${location.Name}</strong></h2> <br>
                                    <p><strong>County:</strong> ${location.County}</p> <br>
                                    <p><strong>Tags:</strong> ${location.Tags.split(',').map(tag => `
                                        <span style="display: inline-block; margin-right: 10px; padding: 2px 5px; background-color: #e0e0e0; border-radius: 3px;">
                                            ${tag.trim()}
                                        </span>`).join(' ')}</p> <br>
                                    <a href="${location.Url}" target="_blank" style="font-size: 18px; color: blue;">Visit Website</a> <br> <br>
                                    <button style="background-color: #83b271; padding: 10px 20px; font-size: 16px; border: none; border-radius: 5px; cursor: pointer;">
                                        Mark as Completed
                                    </button>
                                    ${user ? `
                                        <button id="add-to-collection-${location.id}" 
                                            style="background-color: #83b271; padding: 10px 20px; font-size: 16px; border: none; border-radius: 5px; cursor: pointer;">
                                            Add to ${selectedCollection ? collections.find(c => c.id === selectedCollection)?.name : 'Collection'}
                                        </button>` : ''}
                                `)
                                .on('open', () => {
                                    const popup = document.querySelector('.mapboxgl-popup');
                                    if (popup) {
                                        const closeButton = popup.querySelector('.mapboxgl-popup-close-button');
                                        if (closeButton) {
                                            (closeButton as HTMLElement).style.fontSize = '50px'; // Adjust size
                                        }

                                        if (user) {
                                            const addToCollectionButton = popup.querySelector(`#add-to-collection-${location.id}`);
                                            if (addToCollectionButton) {
                                                addToCollectionButton.addEventListener('click', async () => {
                                                    if (!selectedCollection) {
                                                        alert('Please select a collection first.');
                                                        return;
                                                    }
                                                    try {
                                                        await handleAddToCollection(location.id);
                                                        alert(`"${location.Name}" added to your collection.`);
                                                    } catch (error) {
                                                        console.error('Error adding to collection:', error);
                                                        alert('Failed to add to the collection. Please try again.');
                                                    }
                                                });
                                            }
                                        }
                                    }
                                })
                        )
                        .addTo(map);

                    return marker;
                });

            setMarkers(newMarkers);
        }
    }, [locations, selectedFilter, selectedCounty, map, user, selectedCollection]);

    useEffect(() => {
        if (collectionMessage) {
            const timer = setTimeout(() => setCollectionMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [collectionMessage]);

    useEffect(() => {
        if (addToCollectionMessage) {
            const timer = setTimeout(() => setAddToCollectionMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [addToCollectionMessage]);


    const handleAddToCollection = async (locationId) => {
        const location = locations.find((loc) => loc.id === locationId);

        if (!location) {
            console.error('Location not found');
            setAddToCollectionMessage('Failed to add location. Location not found.');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('user_collections')
                .insert({
                    collection_id: selectedCollection,
                    location_id: locationId,
                    metadata: {
                        name: location.Name,
                        address: location.Address,
                        latitude: location.Latitude,
                        longitude: location.Longitude,
                        tags: location.Tags,
                    },
                });

            if (error) {
                console.error('Supabase insert error:', error);
                setAddToCollectionMessage('Failed to add location to collection. Please try again.');
                throw new Error(error.message || 'Unknown Supabase error');
            }

            console.log('Item successfully added to collection:', data);
            setAddToCollectionMessage(`Successfully added "${location.Name}" to the collection.`);
        } catch (error) {
            console.error('Error adding to collection:', error.message || error);
            setAddToCollectionMessage('Failed to add location to collection. Please try again.');
            throw error;
        }
    };


    return (
        <div className="flex">
            {/* Filter Section */}
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

                {/* create a collection submission process */}
                <h2 className='mt-4 mb-4'> Create a Collection:</h2>
                <form
                    onSubmit={async (e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const collectionName = formData.get('collectionName') as string;

                        if (user && collectionName) {
                            try {
                                const { data, error } = await supabase
                                    .from('collections')
                                    .insert([{ name: collectionName, user_id: user.id }])
                                    .select('*'); // Fetch the created collection data

                                if (error) {
                                    console.error('Error creating collection:', error.message);
                                    setCollectionMessage('Failed to create collection. Please try again.');
                                    return;
                                }

                                if (data && data.length > 0) {
                                    const newCollection = data[0];
                                    setCollections((prevCollections) => [...prevCollections, newCollection]);
                                    setSelectedCollection(newCollection.id); // Automatically select the new collection
                                    setCollectionMessage(`Successfully created collection: "${collectionName}".`);
                                }
                            } catch (error) {
                                console.error('Unexpected error:', error);
                                setCollectionMessage('Failed to create collection. Please try again.');
                            }
                        }
                    }}
                >

                    <input
                        type="text"
                        name="collectionName"
                        placeholder="Collection Name"
                        className="w-full p-2 border rounded mb-2"
                        required
                    />
                    <button type="submit" className="w-full p-2 bg-primary text-white rounded">
                        Create
                    </button>
                </form>




                {collectionMessage && (
                    <p className="text-green-600 mt-2">{collectionMessage}</p>
                )}



                <h2 className="mt-4 mb-4">Select a Collection:</h2>
                <select
                    id="collection-select"
                    value={selectedCollection}
                    onChange={(e) => setSelectedCollection(e.target.value)}
                    className="w-full p-2 border rounded"
                >
                    <option value=""></option>
                    {collections.map((collection) => (
                        <option key={collection.id} value={collection.id}>
                            {collection.name}
                        </option>
                    ))}
                </select>
                {addToCollectionMessage && (
                    <p className="text-green-600 mt-2">{addToCollectionMessage}</p>
                )}
            </div>

            {/* Map Container */}
            <div ref={mapContainerRef} className="map-container w-full h-[56.5rem]" />
        </div>
    );
};

export default Map;