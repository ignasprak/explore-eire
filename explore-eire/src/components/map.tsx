"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/app/lib/authContext";
import { supabase } from "@/app/lib/supabaseClient";
import { useCollections } from '@/hooks/useCollections';
import { Location } from '@/types/location'; // Adjust the path based on your structure


// OpenLayers imports
import "ol/ol.css";
import { Map as OlMap, View } from "ol";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { fromLonLat } from "ol/proj";
import { Style, Icon } from "ol/style";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Zoom from "ol/control/Zoom";

const Map = () => {
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const [map, setMap] = useState<OlMap | null>(null);
    const { user } = useAuth();
    const [locations, setLocations] = useState<Location[]>([]);
    const [selectedFilter, setSelectedFilter] = useState<string>("All");
    const [selectedCounty, setSelectedCounty] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null); // track which attraction’s dropdown is open
    const dropdownRef = useRef<HTMLDivElement | null>(null); //handles clicking outside of collection popup
    const { collections, addToCollection, createCollection } = useCollections();
    const [newCollectionName, setNewCollectionName] = useState('');

    // List view state
    const [isListOpen, setIsListOpen] = useState<boolean>(false);

    const toggleDropdown = (id: string) => {
        setDropdownOpenId((prev) => (prev === id ? null : id)); // Close if open, otherwise open
    };

    const fetchLocations = async () => {
        const queryParams = new URLSearchParams({
            search: searchQuery,
            filter: selectedFilter,
            county: selectedCounty,
        });

        try {
            const response = await fetch(`/api/locations?${queryParams.toString()}`);
            const data = await response.json();

            if (!response.ok) {
                console.error("Error fetching locations:", data.error);
                setLocations([]);
            } else {
                setLocations(data);
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            setLocations([]);
        }
    };

    // handles clicking outside and inside the collections popup
    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpenId(null); // Close dropdown if clicking outside
            }
        };

        document.addEventListener("mousedown", handleClick);

        return () => {
            document.removeEventListener("mousedown", handleClick);
        };
    }, []);

    const handleCreateCollection = async () => {
        const collectionName = prompt('Enter a name for your new collection:');
        if (!collectionName) return;

        await createCollection(collectionName); // Pass the name to the hook
    };

    // Fetch new locations on filter change
    useEffect(() => {
        fetchLocations();
    }, [searchQuery, selectedFilter, selectedCounty]);

    // Initialize OpenLayers map
    useEffect(() => {
        if (!mapContainerRef.current) return;

        const osmLayer = new TileLayer({
            source: new OSM(),
        });

        const mapInstance = new OlMap({
            target: mapContainerRef.current,
            layers: [osmLayer],
            view: new View({
                center: fromLonLat([-8.24389, 53.41291]), // Center on Ireland
                zoom: 7.5,
            }),
        });

        // Zoom controls
        const zoomControl = new Zoom();
        mapInstance.addControl(zoomControl);

        setMap(mapInstance);

        return () => {
            mapInstance.setTarget(null);
        };
    }, []);

    // Update markers on location change
    useEffect(() => {
        if (!map) return;

        // Remove existing vector layers
        const existingVectorLayers = map.getLayers().getArray().filter((layer) => layer instanceof VectorLayer);
        existingVectorLayers.forEach((layer) => map.removeLayer(layer));

        // Create a vector source and layer for the markers
        const vectorSource = new VectorSource();

        locations.forEach((location) => {
            const feature = new Feature({
                geometry: new Point(fromLonLat([location.Longitude, location.Latitude])),
                name: location.Name,
                url: location.Url,
                telephone: location.Telephone,
                address: location.Address,
                tags: location.Tags,
                county: location.County,
            });

            feature.setStyle(
                new Style({
                    image: new Icon({
                        src: "marker-icon-red.svg",
                        scale: 0.03,
                        anchor: [0.5, 1],
                        anchorXUnits: "fraction",
                        anchorYUnits: "fraction",
                    }),
                })
            );

            vectorSource.addFeature(feature);
        });

        const vectorLayer = new VectorLayer({ source: vectorSource });
        map.addLayer(vectorLayer);
    }, [map, locations]);

    return (
        <div className="relative w-[96.75%] h-screen ml-auto">
            {/* Filter section */}
            {/* Floating search box */}
            <div className="absolute top-4 left-8 bg-white p-3 w-80 shadow-lg rounded-full z-50 flex items-center">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-2 rounded-full outline-none"
                    placeholder="Search for attractions..."
                />
            </div>

            {/* Filter Box counties + tags */}
            <div className="absolute top-28 left-8 bg-white p-4 rounded shadow-lg z-40 w-80">

                {/* Filter by tag */}
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Tag:</label>
                <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                >
                    <option value="All">All</option>
                    <option value="Fishing">Fishing</option>
                    <option value="Hiking">Hiking</option>
                    <option value="Beach">Beach</option>
                    <option value="Food">Food</option>
                </select>

                {/* Filter by county */}
                <label className="block text-sm font-medium text-gray-700 mt-2">Filter by County:</label>
                <select
                    value={selectedCounty}
                    onChange={(e) => setSelectedCounty(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
                >
                    <option value="All">All</option>
                    <option value="Dublin">Dublin</option>
                    <option value="Cork">Cork</option>
                </select>
            </div>

            {/* Map Container */}
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Floating Toggle Button (List Open/Close) */}
            <button
                className={`absolute ${isListOpen ? "bottom-1/2" : "bottom-6"} 
               left-1/2 transform -translate-x-1/2 bg-white 
               border border-gray-400 w-14 h-14 rounded-full 
               flex items-center justify-center z-[1000]`} // Ensure high z-index
                onClick={() => setIsListOpen(!isListOpen)}
            >
                <span className="text-2xl text-gray-600">{isListOpen ? "↓" : "↑"}</span>
            </button>

            {/* List View Box */}
            <div
                className={`absolute bottom-0 left-0 w-full bg-white shadow-lg transition-all 
                ${isListOpen ? "h-1/2" : "h-0"} overflow-hidden`}
            >
                {/* Grid of Attractions */}
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {locations.map((location) => (
                        <div key={location.id} className="bg-gray-100 p-3 rounded shadow-md relative">
                            <h3 className="font-semibold">{location.Name}</h3>
                            <button className="absolute top-2 right-12 text-lg text-gray-600 px-2 py-1 rounded hover:bg-gray-200">♡</button>
                            <button
                                className="absolute top-2 right-2 text-lg text-gray-600 px-2 py-1 rounded hover:bg-gray-200"
                                title="Add to"
                                onClick={() => toggleDropdown(location.id)}
                            >
                                ➕
                            </button>

                            {dropdownOpenId === location.id && (
                                <div ref={dropdownRef} className="absolute top-10 right-2 bg-white border rounded shadow-lg z-50 w-56">
                                    <div className="px-4 py-2 border-b">
                                        <input
                                            type="text"
                                            value={newCollectionName}
                                            onChange={(e) => setNewCollectionName(e.target.value)}
                                            placeholder="New collection name"
                                            className="w-full p-2 border rounded"
                                        />
                                        <button
                                            onClick={() => {
                                                if (newCollectionName.trim()) {
                                                    createCollection(newCollectionName.trim());
                                                    setNewCollectionName('');
                                                    setDropdownOpenId(null);
                                                } else {
                                                    alert('Please enter a collection name.');
                                                }
                                            }}
                                            className="w-full mt-2 bg-primary text-white py-1 rounded hover:bg-green-600"
                                        >
                                            Create Collection
                                        </button>
                                    </div>

                                    {collections.length > 0 ? (
                                        collections.map((collection) => (
                                            <button
                                                key={collection.id}
                                                onClick={() => {
                                                    addToCollection(collection.id, location);
                                                    setDropdownOpenId(null);
                                                }}
                                                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                            >
                                                Add to {collection.name}
                                            </button>
                                        ))
                                    ) : (
                                        <p className="px-4 py-2 text-sm text-gray-500">No collections found.</p>
                                    )}
                                </div>
                            )}

                            <p className="text-sm">{location.County}</p>
                            <a href={location.Url} className="text-blue-500 text-sm">View Website</a>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default Map;
